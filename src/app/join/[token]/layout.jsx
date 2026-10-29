import { fetchInvitePreview, inviteMetadata } from "../_lib/invite-preview.js";

// Server component : la page (client) ne peut pas exporter de métadonnées. Ce layout donne au lien
// partagé (WhatsApp, Discord, Messenger…) un aperçu qui identifie la partie.
export async function generateMetadata({ params }) {
    const { token } = await params;
    const preview = await fetchInvitePreview(token);
    return inviteMetadata(preview, token);
}

export default function JoinInviteLayout({ children }) {
    return children;
}
