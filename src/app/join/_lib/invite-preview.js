// Aperçu d'un lien d'invitation (métadonnées + image Open Graph), exécuté côté serveur uniquement.
// Confidentialité : on ne garde que nom, hôte, date/heure et nombre de confirmés. Jamais le lieu
// ni le buy-in : l'aperçu est visible par tout le groupe de discussion où le lien est collé.
import { formatInviteDate } from "@/utils/calendar.utils.js";
import { INTL_LOCALES } from "@/i18n/config.js";
import { translate } from "@/i18n/translate.js";

const PREVIEW_MESSAGES = {
    en: {
        genericTitle: "Poker night on PokerBuddy",
        genericDescription: "Organise home poker nights with your friends: invitations, blinds timer and results in one place.",
        full: "The table is full ({count}/{max} players).",
        ofMax: "{count}/{max} players confirmed.",
        nobody: "Nobody has confirmed yet.",
        one: "1 player confirmed.",
        many: "{count} players confirmed.",
        finished: "This poker night took place on {day}. Organise the next one with PokerBuddy!",
        active: "This poker night started on {day} at {time}. {players}",
        invitesYou: "{host} invites you to a poker night on {day} at {time}. {players} See the details and answer the invite!",
        invited: "You're invited to a poker night on {day} at {time}. {players} See the details and answer the invite!",
        ogGameOver: "Game over", ogLive: "Live now", ogInvited: "You're invited",
        ogInvitedTo: "You're invited to", ogPokerNight: "Poker night", ogInvitesYouTo: "{host} invites you to", ogHostedBy: "Hosted by {host}",
        ogTagline: "Home poker nights with friends", ogSub: "Invitations, blinds timer and results in one place.",
    },
    fr: {
        genericTitle: "Soirée poker sur PokerBuddy",
        genericDescription: "Organise tes soirées poker entre amis : invitations, timer de blinds et résultats au même endroit.",
        full: "La table est complète ({count}/{max} joueurs).",
        ofMax: "{count}/{max} joueurs confirmés.",
        nobody: "Personne n'a encore confirmé.",
        one: "1 joueur confirmé.",
        many: "{count} joueurs confirmés.",
        finished: "Cette soirée poker a eu lieu le {day}. Organise la prochaine avec PokerBuddy !",
        active: "Cette soirée poker a commencé le {day} à {time}. {players}",
        invitesYou: "{host} t'invite à une soirée poker le {day} à {time}. {players} Vois les détails et réponds à l'invitation !",
        invited: "Tu es invité à une soirée poker le {day} à {time}. {players} Vois les détails et réponds à l'invitation !",
        ogGameOver: "Partie terminée", ogLive: "En direct", ogInvited: "Tu es invité",
        ogInvitedTo: "Tu es invité à", ogPokerNight: "Soirée poker", ogInvitesYouTo: "{host} t'invite à", ogHostedBy: "Organisée par {host}",
        ogTagline: "Soirées poker entre amis", ogSub: "Invitations, timer de blinds et résultats au même endroit.",
    },
};

// Texte d'aperçu dans la langue demandée (cookie du visiteur, sinon Accept-Language du robot, sinon anglais)
export const previewText = (locale, key, params) => translate(PREVIEW_MESSAGES, locale, key, params);

// Render peut mettre ~30 s à sortir de veille : au-delà, on sert l'aperçu générique plutôt que
// de faire attendre (ou échouer) le robot de WhatsApp/Discord
export const PREVIEW_TIMEOUT_MS = 3000;

// Les codes d'invitation sont des UUID : inutile d'appeler l'API pour autre chose
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SITE_NAME = "PokerBuddy";

export const genericPreview = (locale = "en") => ({
    title: previewText(locale, "genericTitle"),
    description: previewText(locale, "genericDescription"),
});

/**
 * Résumé public de la partie, ou null (lien invalide/désactivé, API injoignable ou trop lente).
 * @returns {Promise<{ name: string, host: string|null, dateStart: string, confirmedCount: number,
 *                     maxPlayers: number|null, status: string } | null>}
 */
export async function fetchInvitePreview(token) {
    const apiBase = process.env.NEXT_PUBLIC_API_URL;
    if (!apiBase || typeof token !== "string" || !UUID_RE.test(token)) return null;

    try {
        const res = await fetch(`${apiBase}/join/${token}`, {
            cache: "no-store",
            headers: { accept: "application/json" },
            signal: AbortSignal.timeout(PREVIEW_TIMEOUT_MS),
        });
        if (!res.ok) return null;
        const data = await res.json();
        if (typeof data?.name !== "string" || Number.isNaN(new Date(data.dateStart).getTime())) return null;

        // Liste blanche explicite : un champ ajouté plus tard à l'API ne fuit pas dans l'aperçu
        return {
            name: data.name,
            host: typeof data.host === "string" ? data.host : null,
            dateStart: data.dateStart,
            confirmedCount: Number(data.confirmedCount) || 0,
            maxPlayers: Number(data.maxPlayers) || null,
            status: data.status,
        };
    } catch (error) {
        // Timeout (cold start) ou réseau : aperçu générique, sans faire échouer la page
        console.warn(`Invite preview unavailable (${error?.name ?? "error"}): falling back to generic metadata`);
        return null;
    }
}

// "6 players confirmed." / "6/8 players confirmed." / "The table is full (8/8 players)."
export function confirmedSentence({ confirmedCount: count, maxPlayers: max }, locale = "en") {
    if (max && count >= max) return previewText(locale, "full", { count, max });
    if (max) return previewText(locale, "ofMax", { count, max });
    if (count === 0) return previewText(locale, "nobody");
    if (count === 1) return previewText(locale, "one");
    return previewText(locale, "many", { count });
}

// Description courte de l'aperçu, heure dans le fuseau des joueurs
export function previewDescription(preview, locale = "en") {
    const { day, time } = formatInviteDate(preview.dateStart, { month: "short", intlLocale: INTL_LOCALES[locale] });
    const players = confirmedSentence(preview, locale);
    if (preview.status === "finished") return previewText(locale, "finished", { day });
    if (preview.status === "active") return previewText(locale, "active", { day, time, players });
    return preview.host
        ? previewText(locale, "invitesYou", { host: preview.host, day, time, players })
        : previewText(locale, "invited", { day, time, players });
}

/**
 * Origine publique du client pour des URLs absolues (og:image, og:url).
 * NEXT_PUBLIC_APP_URL si défini (domaine personnalisé), sinon les variables système de Vercel,
 * sinon localhost (même logique de repli que Next pour les images sociales).
 */
export function getSiteUrl() {
    const explicit = process.env.NEXT_PUBLIC_APP_URL;
    if (explicit) {
        try {
            return new URL(explicit);
        } catch {
            console.warn("NEXT_PUBLIC_APP_URL is not a valid URL, ignoring it");
        }
    }
    const preview = process.env.VERCEL_ENV === "preview" && (process.env.VERCEL_BRANCH_URL || process.env.VERCEL_URL);
    const host = preview || process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
    if (host) return new URL(`https://${host}`);
    return new URL(`http://localhost:${process.env.PORT || 3000}`);
}

// Métadonnées de /join/[token] : spécifiques si la partie est connue, génériques sinon
export function inviteMetadata(preview, token, locale = "en") {
    const generic = genericPreview(locale);
    const url = `/join/${encodeURIComponent(token ?? "")}`;
    const title = preview ? `${preview.name} — ${SITE_NAME}` : generic.title;
    const description = preview ? previewDescription(preview, locale) : generic.description;

    return {
        metadataBase: getSiteUrl(),
        // absolute : un éventuel modèle de titre du layout racine ne s'y ajoute pas
        title: { absolute: title },
        description,
        // Lien privé : jamais indexé, même s'il fuit sur une page publique
        robots: {
            index: false,
            follow: false,
            googleBot: { index: false, follow: false },
        },
        openGraph: {
            type: "website",
            siteName: SITE_NAME,
            locale: locale === "fr" ? "fr_BE" : "en_GB",
            title,
            description,
            url,
            // images : fournie par opengraph-image.jsx (même dossier)
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
        },
    };
}
