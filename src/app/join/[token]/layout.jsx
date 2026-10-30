import { fetchInvitePreview, inviteMetadata } from "../_lib/invite-preview.js";
import { getLocale } from "@/i18n/server.js";

// Server component : la page (client) ne peut pas exporter de métadonnées. Ce layout donne au lien
// partagé (WhatsApp, Discord, Messenger…) un aperçu qui identifie la partie.
export async function generateMetadata({ params }) {
    const { token } = await params;
    const [preview, locale] = await Promise.all([fetchInvitePreview(token), getLocale()]);
    return inviteMetadata(preview, token, locale);
}

export default function JoinInviteLayout({ children }) {
    return children;
}
