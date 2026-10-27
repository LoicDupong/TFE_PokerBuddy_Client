import { useCallback, useEffect, useRef, useState } from "react";

// Le navigateur bloque le son tant que l'utilisateur n'a pas interagi : le contexte audio
// est créé au clic sur "Sound" (ou au premier geste après un rechargement).
let audioCtx = null;

export function unlockAudio() {
    try {
        if (!audioCtx) {
            const Ctx = window.AudioContext || window.webkitAudioContext;
            if (!Ctx) return;
            audioCtx = new Ctx();
        }
        if (audioCtx.state === "suspended") audioCtx.resume();
    } catch {
        // audio indisponible : on ignore
    }
}

// Quelques bips générés à la volée (pas de fichier audio) ; count=1 sert de confirmation
export function playBeeps(count = 3) {
    if (!audioCtx) return;
    try {
        for (let i = 0; i < count; i++) {
            const start = audioCtx.currentTime + i * 0.35;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = "sine";
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.0001, start);
            gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.25);
            osc.connect(gain).connect(audioCtx.destination);
            osc.start(start);
            osc.stop(start + 0.27);
        }
    } catch {
        // ignoré
    }
}

export function useMediaQuery(query) {
    const [matches, setMatches] = useState(false);
    useEffect(() => {
        const mq = window.matchMedia(query);
        const update = () => setMatches(mq.matches);
        update();
        mq.addEventListener("change", update);
        return () => mq.removeEventListener("change", update);
    }, [query]);
    return matches;
}

// Garde l'écran allumé tant que le timer tourne (ignoré si non supporté)
export function useWakeLock(active) {
    useEffect(() => {
        if (!active || !("wakeLock" in navigator)) return;
        let lock = null;
        let cancelled = false;
        const acquire = async () => {
            try {
                const l = await navigator.wakeLock.request("screen");
                if (cancelled) l.release().catch(() => {});
                else lock = l;
            } catch {
                // refusé (batterie faible, onglet masqué...) : on ignore
            }
        };
        // Le verrou est relâché par le navigateur quand l'onglet est masqué
        const onVisible = () => {
            if (document.visibilityState === "visible") acquire();
        };
        acquire();
        document.addEventListener("visibilitychange", onVisible);
        return () => {
            cancelled = true;
            document.removeEventListener("visibilitychange", onVisible);
            lock?.release().catch(() => {});
        };
    }, [active]);
}

// true après `delay` ms sans activité souris / tactile / clavier
export function useIdle(enabled, delay = 3000) {
    const [idle, setIdle] = useState(false);
    useEffect(() => {
        if (!enabled) {
            setIdle(false);
            return;
        }
        let timeout;
        const wake = () => {
            setIdle(false);
            clearTimeout(timeout);
            timeout = setTimeout(() => setIdle(true), delay);
        };
        const events = ["mousemove", "mousedown", "touchstart", "keydown", "focusin"];
        wake();
        events.forEach((e) => window.addEventListener(e, wake, { passive: true }));
        return () => {
            clearTimeout(timeout);
            events.forEach((e) => window.removeEventListener(e, wake));
        };
    }, [enabled, delay]);
    return idle;
}

export function useFullscreen() {
    const [supported, setSupported] = useState(false);
    const [active, setActive] = useState(false);

    useEffect(() => {
        setSupported(!!document.documentElement.requestFullscreen);
        const onChange = () => setActive(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onChange);
        return () => document.removeEventListener("fullscreenchange", onChange);
    }, []);

    const toggle = useCallback(() => {
        if (!document.documentElement.requestFullscreen) return;
        const request = document.fullscreenElement
            ? document.exitFullscreen()
            : document.documentElement.requestFullscreen();
        // Peut être refusé par le navigateur : pas de plantage
        request?.catch(() => {});
    }, []);

    return { supported, active, toggle };
}

// Raccourcis : Espace = start/pause, flèches = niveau, F = plein écran.
// `actions` est relu à chaque événement (ref) pour toujours viser l'état courant.
export function useHotkeys(actions, disabled) {
    const ref = useRef(actions);
    ref.current = actions;

    useEffect(() => {
        if (disabled) return;
        const typing = (el) =>
            el && (["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName) || el.isContentEditable);
        const onKeyDown = (e) => {
            if (e.ctrlKey || e.metaKey || e.altKey || typing(e.target)) return;
            const a = ref.current;
            let handler = null;
            if (e.key === " ") handler = a.toggle;
            else if (e.key === "ArrowLeft") handler = a.prev;
            else if (e.key === "ArrowRight") handler = a.next;
            else if (e.key === "f" || e.key === "F") handler = a.fullscreen;
            if (!handler) return;
            e.preventDefault();
            if (!e.repeat) handler();
        };
        // Sans ça, Espace relâché sur un bouton focus déclencherait aussi son clic
        const onKeyUp = (e) => {
            if (e.key === " " && !typing(e.target) && !e.ctrlKey && !e.metaKey && !e.altKey) e.preventDefault();
        };
        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, [disabled]);
}
