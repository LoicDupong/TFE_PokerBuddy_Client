"use client";

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "@/i18n/i18n-provider.jsx";
import { INTL_LOCALES } from "@/i18n/config.js";

// Textes communs de l'interface admin ({ en, fr }), lus avec useAdminText()
const ADMIN_MESSAGES = {
    en: {
        loading: "Loading…",
        retry: "Try again",
        previous: "Previous",
        next: "Next",
        pagination: "Pagination",
        pageOf: (page, pages) => `Page ${page} of ${pages}`,
        results: (total) => (total === 1 ? "1 result" : `${total} results`),
        noResults: "Nothing matches these filters.",
        cancel: "Cancel",
        confirm: "Confirm",
        reasonLabel: "Reason (optional)",
        reasonMax: 500,
        typeToConfirm: (text) => `Type "${text}" to confirm`,
        forbidden: "Your account is not allowed to do this.",
        genericError: "Something went wrong, please try again.",
        accountStatuses: { active: "Active", disabled: "Disabled", deleted: "Deleted" },
        gameStatuses: { pending: "Upcoming", active: "Live", finished: "Finished", cancelled: "Cancelled" },
        ticketStatuses: { new: "New", in_progress: "In progress", resolved: "Resolved" },
        ticketCategories: {
            bug: "Something is broken",
            account: "Account",
            game: "Game or results",
            suggestion: "Suggestion",
            other: "Other",
        },
        roles: { user: "Member", admin: "Admin" },
    },
    fr: {
        loading: "Chargement…",
        retry: "Réessayer",
        previous: "Précédent",
        next: "Suivant",
        pagination: "Pagination",
        pageOf: (page, pages) => `Page ${page} sur ${pages}`,
        results: (total) => (total <= 1 ? `${total} résultat` : `${total} résultats`),
        noResults: "Aucun résultat pour ces filtres.",
        cancel: "Annuler",
        confirm: "Confirmer",
        reasonLabel: "Motif (facultatif)",
        reasonMax: 500,
        typeToConfirm: (text) => `Tape « ${text} » pour confirmer`,
        forbidden: "Ton compte n'est pas autorisé à faire cela.",
        genericError: "Une erreur est survenue, réessaie.",
        accountStatuses: { active: "Actif", disabled: "Désactivé", deleted: "Supprimé" },
        gameStatuses: { pending: "À venir", active: "En cours", finished: "Terminée", cancelled: "Annulée" },
        ticketStatuses: { new: "Nouveau", in_progress: "En cours", resolved: "Résolu" },
        ticketCategories: {
            bug: "Quelque chose ne marche pas",
            account: "Compte",
            game: "Partie ou résultats",
            suggestion: "Suggestion",
            other: "Autre",
        },
        roles: { user: "Membre", admin: "Admin" },
    },
};

const isPlain = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
// L'anglais sert de repli clé par clé si une traduction manque
const merge = (base, over) => {
    if (!isPlain(base) || !isPlain(over)) return over ?? base;
    const out = { ...base };
    for (const key of Object.keys(over)) out[key] = merge(base[key], over[key]);
    return out;
};

// Dictionnaire { en, fr } -> objet de textes de la langue courante (fonctions et tableaux conservés)
export function useTexts(messages) {
    const { locale } = useLocale();
    return useMemo(() => merge(messages.en, messages[locale]), [messages, locale]);
}

export const useAdminText = () => useTexts(ADMIN_MESSAGES);

// Couleur des pastilles (toujours accompagnée du texte)
export const accountTone = { active: "ok", disabled: "warn", deleted: "muted" };
export const gameTone = { pending: "info", active: "ok", finished: "muted", cancelled: "bad" };
export const ticketTone = { new: "info", in_progress: "warn", resolved: "ok" };

// Dates et montants dans la langue courante ; renvoie des fonctions stables par langue
export function useAdminFormat() {
    const { locale } = useLocale();
    return useMemo(() => {
        const intl = INTL_LOCALES[locale];
        return {
            formatDate: (iso) => (iso ? new Date(iso).toLocaleDateString(intl, { day: "numeric", month: "short", year: "numeric" }) : "—"),
            formatDateTime: (iso) => (iso
                ? new Date(iso).toLocaleString(intl, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
                : "—"),
            // Montant en centimes -> "12.50" / "12,50"
            formatCents: (cents) => ((cents || 0) / 100).toLocaleString(intl, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
        };
    }, [locale]);
}

// Valeur qui ne suit la saisie qu'après une pause : évite une requête par frappe
export function useDebounced(value, delay = 350) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const id = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(id);
    }, [value, delay]);
    return debounced;
}
