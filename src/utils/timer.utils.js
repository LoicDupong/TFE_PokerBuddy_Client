// Timer de niveau basé sur une heure de fin (endsAt) plutôt qu'un décompte seconde par seconde :
// un setInterval ralenti (écran verrouillé, onglet en arrière-plan) ne fait plus dériver le temps.
// timer = { level, endsAt: ms si en cours | null si en pause, remaining: s | null (= niveau complet) }

export const NEW_TIMER = { level: 1, endsAt: null, remaining: null };

export function getTimeLeft(timer, levelSeconds, now) {
    if (timer.endsAt !== null) return Math.max(0, Math.ceil((timer.endsAt - now) / 1000));
    return timer.remaining ?? levelSeconds;
}

export function startTimer(timer, levelSeconds, now) {
    return { ...timer, endsAt: now + getTimeLeft(timer, levelSeconds, now) * 1000, remaining: null };
}

export function pauseTimer(timer, levelSeconds, now) {
    return { ...timer, endsAt: null, remaining: getTimeLeft(timer, levelSeconds, now) };
}

// Changer de niveau repart sur un niveau complet, en pause (comme avant)
export function goToLevel(level) {
    return { level, endsAt: null, remaining: null };
}

export function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
}
