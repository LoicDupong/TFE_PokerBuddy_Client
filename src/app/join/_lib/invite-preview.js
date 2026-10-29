// Aperçu d'un lien d'invitation (métadonnées + image Open Graph), exécuté côté serveur uniquement.
// Confidentialité : on ne garde que nom, hôte, date/heure et nombre de confirmés. Jamais le lieu
// ni le buy-in : l'aperçu est visible par tout le groupe de discussion où le lien est collé.
import { formatInviteDate } from "@/utils/calendar.utils.js";

// Render peut mettre ~30 s à sortir de veille : au-delà, on sert l'aperçu générique plutôt que
// de faire attendre (ou échouer) le robot de WhatsApp/Discord
export const PREVIEW_TIMEOUT_MS = 3000;

// Les codes d'invitation sont des UUID : inutile d'appeler l'API pour autre chose
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const SITE_NAME = "PokerBuddy";

export const GENERIC_PREVIEW = {
    title: "Poker night on PokerBuddy",
    description: "Organise home poker nights with your friends: invitations, blinds timer and results in one place.",
};

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
export function confirmedSentence({ confirmedCount: count, maxPlayers: max }) {
    if (max && count >= max) return `The table is full (${count}/${max} players).`;
    if (max) return `${count}/${max} players confirmed.`;
    if (count === 0) return "Nobody has confirmed yet.";
    if (count === 1) return "1 player confirmed.";
    return `${count} players confirmed.`;
}

// Description courte de l'aperçu, heure dans le fuseau des joueurs
export function previewDescription(preview) {
    const { day, time } = formatInviteDate(preview.dateStart, { month: "short" });
    const players = confirmedSentence(preview);

    if (preview.status === "finished") {
        return `This poker night took place on ${day}. Organise the next one with PokerBuddy!`;
    }
    if (preview.status === "active") {
        return `This poker night started on ${day} at ${time}. ${players}`;
    }
    return preview.host
        ? `${preview.host} invites you to a poker night on ${day} at ${time}. ${players} See the details and answer the invite!`
        : `You're invited to a poker night on ${day} at ${time}. ${players} See the details and answer the invite!`;
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
export function inviteMetadata(preview, token) {
    const url = `/join/${encodeURIComponent(token ?? "")}`;
    const title = preview ? `${preview.name} — ${SITE_NAME}` : GENERIC_PREVIEW.title;
    const description = preview ? previewDescription(preview) : GENERIC_PREVIEW.description;

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
            locale: "en_GB",
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
