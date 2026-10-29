import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { formatInviteDate } from "@/utils/calendar.utils.js";
import { confirmedSentence, fetchInvitePreview } from "../_lib/invite-preview.js";

// Image de l'aperçu du lien d'invitation (WhatsApp, Discord, Messenger…).
// Même règle que les métadonnées : nom, hôte, date/heure, confirmés ; jamais le lieu.
export const alt = "Invitation to a poker night on PokerBuddy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const NAVY = "#1a1b26";
const RED = "#d70022";
const PERIWINKLE = "#9fa5df";
const TEXT = "#fff3f3";

const FONT_TIMEOUT_MS = 1500;
// Fichiers TTF de Barlow Condensed (police d'affichage du site). Aucun texte de la partie n'est
// envoyé à Google : on charge la police complète, mise en cache le temps de vie de l'instance.
const FONT_CSS_URL = "https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700";

let fontsPromise = null;

async function fetchDisplayFonts() {
    const css = await fetch(FONT_CSS_URL, { signal: AbortSignal.timeout(FONT_TIMEOUT_MS) }).then((r) => r.text());
    const faces = [...css.matchAll(/font-weight: (\d+);\s*src: url\((.+?)\) format\('(?:truetype|opentype)'\)/g)];
    if (faces.length === 0) throw new Error("No TTF in Google Fonts response");
    return Promise.all(faces.map(async ([, weight, url]) => {
        const res = await fetch(url, { signal: AbortSignal.timeout(FONT_TIMEOUT_MS) });
        if (!res.ok) throw new Error(`Font download failed (${res.status})`);
        return { name: "Barlow Condensed", data: await res.arrayBuffer(), weight: Number(weight), style: "normal" };
    }));
}

// En cas d'échec : police par défaut de next/og (Noto Sans), et on réessaiera à la prochaine image
function loadDisplayFonts() {
    fontsPromise ??= fetchDisplayFonts().catch((error) => {
        console.warn("OG image: display font unavailable, using the default one:", error?.message);
        fontsPromise = null;
        return null;
    });
    return fontsPromise;
}

// Logo clair (texte "POKER" blanc) de public/, lu sur disque ; s'il manque : logotype en texte
async function loadLogo() {
    try {
        const data = await readFile(join(process.cwd(), "public", "pokerbuddy_logo_light.png"));
        return `data:image/png;base64,${data.toString("base64")}`;
    } catch {
        return null;
    }
}

// Nom long : taille réduite, puis coupé sur un mot (~2 lignes de Barlow Condensed à 64 px)
const NAME_MAX_CHARS = 80;
function nameStyle(name) {
    const chars = [...name];
    if (chars.length <= 22) return { fontSize: 108, text: name };
    if (chars.length <= 34) return { fontSize: 88, text: name };
    if (chars.length <= 50) return { fontSize: 72, text: name };
    if (chars.length <= NAME_MAX_CHARS) return { fontSize: 64, text: name };
    const cut = chars.slice(0, NAME_MAX_CHARS).join("");
    const lastSpace = cut.lastIndexOf(" ");
    return { fontSize: 64, text: `${(lastSpace > 50 ? cut.slice(0, lastSpace) : cut).trimEnd()}…` };
}

function Brand({ logo, height }) {
    if (logo) {
        // Ratio du PNG source : 736 × 333
        return <img src={logo} alt="" width={Math.round((height * 736) / 333)} height={height} />;
    }
    return (
        <div style={{ display: "flex", fontSize: height * 0.6, fontWeight: 700, letterSpacing: 1 }}>
            <span style={{ color: TEXT }}>Poker</span>
            <span style={{ color: RED }}>Buddy</span>
        </div>
    );
}

function Badge({ children, color = RED, textColor = TEXT }) {
    return (
        <div
            style={{
                display: "flex",
                padding: "10px 26px",
                borderRadius: 999,
                background: color,
                color: textColor,
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 3,
                textTransform: "uppercase",
            }}
        >
            {children}
        </div>
    );
}

function Frame({ children }) {
    return (
        <div
            style={{
                width: "100%",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                padding: "52px 72px 64px",
                background: NAVY,
                backgroundImage: `radial-gradient(circle at 100% 0%, rgba(159, 165, 223, 0.16), rgba(26, 27, 38, 0) 55%)`,
                color: TEXT,
                fontFamily: "Barlow Condensed, sans-serif",
            }}
        >
            {children}
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 16, display: "flex", background: RED }} />
        </div>
    );
}

function InviteCard({ preview, logo }) {
    const { day, time } = formatInviteDate(preview.dateStart);
    const { fontSize, text } = nameStyle(preview.name);
    const badge = { finished: "Game over", active: "Live now" }[preview.status] ?? "You're invited";
    const upcoming = preview.status !== "finished" && preview.status !== "active";
    let intro = upcoming ? "You're invited to" : "Poker night";
    if (preview.host) intro = upcoming ? `${preview.host} invites you to` : `Hosted by ${preview.host}`;

    return (
        <Frame>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Brand logo={logo} height={104} />
                <Badge>{badge}</Badge>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1 }}>
                <div style={{ display: "flex", fontSize: 40, fontWeight: 600, color: PERIWINKLE }}>{intro}</div>
                <div style={{ display: "flex", fontSize, fontWeight: 700, lineHeight: 1.02, marginTop: 6, maxWidth: 1056 }}>{text}</div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", fontSize: 48, fontWeight: 700 }}>{`${day} · ${time}`}</div>
                {preview.status !== "finished" && (
                    <Badge color={PERIWINKLE} textColor={NAVY}>{confirmedSentence(preview).replace(/\.$/, "")}</Badge>
                )}
            </div>
        </Frame>
    );
}

// Lien invalide, désactivé ou API injoignable : carte PokerBuddy sans rien de la partie
function GenericCard({ logo }) {
    return (
        <Frame>
            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", flexGrow: 1 }}>
                <Brand logo={logo} height={220} />
                <div style={{ display: "flex", fontSize: 76, fontWeight: 700, marginTop: 36 }}>Home poker nights with friends</div>
                <div style={{ display: "flex", fontSize: 38, fontWeight: 600, color: PERIWINKLE, marginTop: 8 }}>
                    Invitations, blinds timer and results in one place.
                </div>
            </div>
        </Frame>
    );
}

export default async function Image({ params }) {
    const { token } = await params;
    const [preview, logo, fonts] = await Promise.all([fetchInvitePreview(token), loadLogo(), loadDisplayFonts()]);

    return new ImageResponse(
        preview ? <InviteCard preview={preview} logo={logo} /> : <GenericCard logo={logo} />,
        {
            ...size,
            ...(fonts ? { fonts } : {}),
            headers: {
                // Par défaut next/og met un cache immuable d'un an : un lien désactivé ou une partie
                // renommée garderait son ancienne image. 5 min sur le CDN suffisent pour les robots.
                // (clé en minuscules pour remplacer celle de next/og au lieu de s'y ajouter)
                "cache-control": "public, max-age=0, s-maxage=300",
            },
        },
    );
}
