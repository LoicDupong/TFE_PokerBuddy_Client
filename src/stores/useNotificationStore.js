import { useEffect } from "react";
import { create } from "zustand";
import notificationService from "../services/notification.service";

// Pas de temps réel côté serveur : poll léger, seulement onglet visible et compte connecté
const DEFAULT_POLL_INTERVAL_MS = 60_000;
const DEFAULT_TOAST_DURATION_MS = 60_000;
export const MAX_NOTIFICATION_TOASTS = 3;
const TOAST_EXIT_MS = 180; // = durée de l'animation de sortie (components/toast/toaster.scss)
const MIN_REFRESH_GAP_MS = 2_000; // focus et visibilitychange arrivent ensemble : une seule requête
const MIN_RESUME_MS = 2_000; // après un survol, le toast ne disparaît pas sous les yeux

// Tests E2E (hors production) : window.__PB_NOTIFICATIONS_TEST__ = { pollIntervalMs, toastDurationMs }
// posé avant le chargement de la page. Sans lui, les valeurs par défaut s'appliquent.
function getTimings() {
    const override = process.env.NODE_ENV !== "production" && typeof window !== "undefined"
        ? window.__PB_NOTIFICATIONS_TEST__
        : null;
    return {
        pollIntervalMs: override?.pollIntervalMs ?? DEFAULT_POLL_INTERVAL_MS,
        toastDurationMs: override?.toastDurationMs ?? DEFAULT_TOAST_DURATION_MS,
    };
}

// --- État de session hors React (aucun rendu n'en dépend), remis à zéro au logout / changement de compte ---
const session = {
    userId: null,
    generation: 0, // +1 à chaque remise à zéro : une réponse arrivée après coup est ignorée
    hasBaseline: false, // la 1re récupération réussie sert de référence : aucun toast pour l'historique
    floor: null, // date (ms) de la plus ancienne notification de la référence
    seenIds: new Set(), // notifications déjà connues : jamais deux toasts pour la même
};
let inFlight = null; // { generation, promise } : une seule requête à la fois
let lastFetchAt = 0;
let pollTimer = null;
let syncCount = 0; // composants qui ont lancé la synchro (cloche, toasts) : une seule boucle pour tous
const toastTimers = new Map(); // id → { timeoutId, deadline, remaining, paused }

const toMs = (date) => new Date(date).getTime();
const isTabVisible = () => typeof document === "undefined" || document.visibilityState === "visible";

// Notifications réellement nouvelles depuis la référence ; tout ce qui passe est mémorisé
function takeNewNotifications(list) {
    if (!session.hasBaseline) {
        const dates = list.map((n) => toMs(n.createdAt)).filter(Number.isFinite);
        session.hasBaseline = true;
        session.floor = dates.length ? Math.min(...dates) : null;
        list.forEach((n) => session.seenIds.add(n.id));
        return [];
    }
    // Le plancher écarte une ancienne notification qui reviendrait dans les 30 dernières
    // après une suppression côté serveur (rappel de résultats effacé, par exemple)
    const fresh = list.filter((n) => !session.seenIds.has(n.id)
        && (session.floor === null || toMs(n.createdAt) >= session.floor));
    list.forEach((n) => session.seenIds.add(n.id));
    return fresh;
}

// --- Poll ---
const canPoll = () => syncCount > 0 && session.userId !== null && isTabVisible();

function stopPolling() {
    clearTimeout(pollTimer);
    pollTimer = null;
}

// Le prochain poll part de la dernière récupération, quelle qu'en soit l'origine
function schedulePoll() {
    stopPolling();
    if (canPoll()) pollTimer = setTimeout(autoRefresh, getTimings().pollIntervalMs);
}

// Rafraîchissement automatique : montage, focus, retour sur l'onglet, poll
function autoRefresh() {
    if (!canPoll()) {
        stopPolling();
        return;
    }
    if (Date.now() - lastFetchAt < MIN_REFRESH_GAP_MS) {
        schedulePoll();
        return;
    }
    useNotificationStore.getState().fetchNotifications();
}

function onVisibilityChange() {
    if (isTabVisible()) autoRefresh();
    else stopPolling(); // onglet masqué : plus aucune requête jusqu'au retour
}

const onFocus = () => autoRefresh();

function startSync() {
    syncCount += 1;
    if (syncCount === 1) {
        window.addEventListener("focus", onFocus);
        document.addEventListener("visibilitychange", onVisibilityChange);
    }
    autoRefresh();

    return () => {
        syncCount -= 1;
        if (syncCount > 0) return;
        window.removeEventListener("focus", onFocus);
        document.removeEventListener("visibilitychange", onVisibilityChange);
        stopPolling();
    };
}

// --- Toasts ---
function clearToastTimer(id) {
    const timer = toastTimers.get(id);
    if (timer) clearTimeout(timer.timeoutId);
    toastTimers.delete(id);
}

function armToastTimer(id, ms) {
    clearToastTimer(id);
    toastTimers.set(id, {
        timeoutId: setTimeout(() => useNotificationStore.getState().dismissToast(id), ms),
        deadline: Date.now() + ms,
        remaining: ms,
        paused: false,
    });
}

function pushToasts(fresh) {
    const { toasts, dismissToast } = useNotificationStore.getState();
    // Plus anciennes d'abord : la plus récente arrive en bas de la pile
    const incoming = [...fresh]
        .sort((a, b) => toMs(a.createdAt) - toMs(b.createdAt))
        .map((notification) => ({ id: notification.id, notification, leaving: false }));
    const shown = toasts.filter((t) => !t.leaving);
    // 3 visibles au plus : les plus anciens cèdent la place (arrivée groupée : seules les 3 plus récentes)
    const keptIds = new Set([...shown, ...incoming].slice(-MAX_NOTIFICATION_TOASTS).map((t) => t.id));
    const added = incoming.filter((t) => keptIds.has(t.id));

    useNotificationStore.setState((state) => ({ toasts: [...state.toasts, ...added] }));
    const { toastDurationMs } = getTimings();
    added.forEach((t) => armToastTimer(t.id, toastDurationMs));
    shown.filter((t) => !keptIds.has(t.id)).forEach((t) => dismissToast(t.id));
}

const useNotificationStore = create((set, get) => ({
    notifications: [],
    unreadCount: 0,
    // Notifications arrivées pendant la session, affichées en toast : { id, notification, leaving }
    toasts: [],

    // Une seule requête à la fois : un appel pendant une requête en cours reçoit la même promesse
    fetchNotifications: () => {
        if (inFlight && inFlight.generation === session.generation) return inFlight.promise;

        const request = { generation: session.generation, promise: null };
        inFlight = request;
        lastFetchAt = Date.now();
        stopPolling();
        request.promise = (async () => {
            try {
                const data = await notificationService.getAll();
                // Compte changé pendant la requête, ou erreur : l'état actuel est gardé
                if (request.generation !== session.generation || !data.success) return;
                const notifications = Array.isArray(data.notifications) ? data.notifications : [];
                const fresh = takeNewNotifications(notifications);
                set({ notifications, unreadCount: data.unreadCount ?? 0 });
                if (fresh.length) pushToasts(fresh);
            } catch (error) {
                console.error("fetchNotifications error:", error);
            } finally {
                if (inFlight === request) inFlight = null;
                if (request.generation === session.generation) schedulePoll();
            }
        })();
        return request.promise;
    },

    markAllRead: async () => {
        await notificationService.markAllRead();
        set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    },

    // Fermeture (bouton, clic, fin du délai) : sortie animée puis retrait. Ne touche pas au statut lu.
    dismissToast: (id) => {
        clearToastTimer(id);
        const toast = get().toasts.find((t) => t.id === id);
        if (!toast || toast.leaving) return;
        set((state) => ({ toasts: state.toasts.map((t) => (t.id === id ? { ...t, leaving: true } : t)) }));
        setTimeout(() => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })), TOAST_EXIT_MS);
    },

    // Survol ou focus : le compte à rebours s'arrête, le toast ne part pas sous le pointeur ou le focus
    pauseToast: (id) => {
        const timer = toastTimers.get(id);
        if (!timer || timer.paused) return;
        clearTimeout(timer.timeoutId);
        timer.remaining = Math.max(0, timer.deadline - Date.now());
        timer.paused = true;
    },

    resumeToast: (id) => {
        const timer = toastTimers.get(id);
        if (!timer?.paused) return;
        armToastTimer(id, Math.max(timer.remaining, MIN_RESUME_MS));
    },

    // Logout ou changement de compte : rien ne reste de la session précédente
    resetSession: () => {
        session.generation += 1;
        session.hasBaseline = false;
        session.floor = null;
        session.seenIds = new Set();
        inFlight = null;
        lastFetchAt = 0;
        stopPolling();
        toastTimers.forEach((timer) => clearTimeout(timer.timeoutId));
        toastTimers.clear();
        set({ notifications: [], unreadCount: 0, toasts: [] });
    },

    // Compte connecté (null = déconnecté). Passer de "pas encore connu" à un compte garde la référence :
    // au chargement, une récupération a pu partir avec le même token avant que le compte soit restauré.
    setSessionUser: (userId) => {
        if (session.userId !== null && session.userId !== userId) get().resetSession();
        session.userId = userId;
    },
}));

/**
 * Synchronise les notifications du compte connecté : tout de suite, au focus, au retour sur l'onglet,
 * puis toutes les 60 s tant que l'onglet est visible. Appelable depuis plusieurs composants
 * (cloche, toasts) : une seule boucle, pas de requête en double.
 */
export function useNotificationSync(userId) {
    useEffect(() => {
        useNotificationStore.getState().setSessionUser(userId ?? null);
        if (!userId) return undefined;
        return startSync();
    }, [userId]);
}

export default useNotificationStore;
