// Ajout d'une partie à un agenda + formatage des dates des aperçus de lien.
// Fonctions pures, utilisables côté client comme côté serveur (métadonnées, image Open Graph).

// Fuseau des joueurs : Vercel tourne en UTC, on formate donc toujours explicitement dans ce fuseau
// quand le code s'exécute sur le serveur (aperçus de lien) ; le lien Google l'utilise aussi.
export const APP_TIME_ZONE = "Europe/Brussels";

// Même durée que le .ics de l'API (src/utils/ics.utils.js côté serveur) : aucune heure de fin n'est saisie
export const GAME_DURATION_MS = 3 * 60 * 60 * 1000;

// "20261106T190000Z" : format UTC attendu par Google Calendar (et par les .ics)
export function toCalendarUtc(date) {
    return new Date(date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
}

// Bouton visible tant que la partie n'est ni terminée ni passée (une partie annulée est supprimée :
// son lien renvoie déjà une erreur)
export function canAddToCalendar(info, now = new Date()) {
    if (!info || info.status === "finished") return false;
    const start = new Date(info.dateStart).getTime();
    if (Number.isNaN(start)) return false;
    return start + GAME_DURATION_MS > now.getTime();
}

// Texte de l'événement : uniquement ce que la page d'invitation montre déjà
const EVENT_TEXT = {
    en: {
        hosted: (host) => `Poker night hosted by ${host}.`,
        organised: "Poker night organised with PokerBuddy.",
        buyIn: (buyIn, cur) => `Buy-in: ${buyIn} ${cur}.`,
        see: (url) => `See the details and answer the invite: ${url}`,
    },
    fr: {
        hosted: (host) => `Soirée poker organisée par ${host}.`,
        organised: "Soirée poker organisée avec PokerBuddy.",
        buyIn: (buyIn, cur) => `Buy-in : ${buyIn} ${cur}.`,
        see: (url) => `Vois les détails et réponds à l'invitation : ${url}`,
    },
};

export function inviteEventDetails({ host, buyIn, currencyLabel, inviteUrl }, locale = "en") {
    const text = EVENT_TEXT[locale] ?? EVENT_TEXT.en;
    return [
        host ? text.hosted(host) : text.organised,
        buyIn !== undefined && buyIn !== null ? text.buyIn(buyIn, currencyLabel) : null,
        inviteUrl ? text.see(inviteUrl) : null,
    ].filter(Boolean).join("\n");
}

/**
 * Lien « ajouter à Google Calendar » (aucune API ni compte côté PokerBuddy).
 * Dates en UTC (suffixe Z) : l'heure exacte est conservée quel que soit le fuseau de l'appareil ;
 * ctz fixe le fuseau de l'événement créé.
 */
export function googleCalendarUrl({ title, start, durationMs = GAME_DURATION_MS, details, location }) {
    const startDate = new Date(start);
    const end = new Date(startDate.getTime() + durationMs);
    const params = [
        ["action", "TEMPLATE"],
        ["text", title || "Poker night"],
        // Le "/" entre les deux dates reste littéral, comme dans les exemples de Google
        ["dates", `${toCalendarUtc(startDate)}/${toCalendarUtc(end)}`, true],
        ["details", details],
        ["location", location?.trim()],
        ["ctz", APP_TIME_ZONE],
    ];
    const query = params
        .filter(([, value]) => value)
        .map(([key, value, raw]) => `${key}=${raw ? value : encodeURIComponent(value)}`)
        .join("&");
    return `https://calendar.google.com/calendar/render?${query}`;
}

// "Friday 7 November" et "20:00" dans le fuseau des joueurs (et non celui du serveur)
export function formatInviteDate(date, { timeZone = APP_TIME_ZONE, weekday = "long", month = "long", intlLocale = "en-GB" } = {}) {
    const d = new Date(date);
    if (Number.isNaN(d.getTime())) return null;
    return {
        day: new Intl.DateTimeFormat(intlLocale, { timeZone, weekday, day: "numeric", month }).format(d),
        time: new Intl.DateTimeFormat(intlLocale, { timeZone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d),
    };
}
