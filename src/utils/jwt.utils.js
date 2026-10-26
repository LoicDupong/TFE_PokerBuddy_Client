/**
 * Lit le payload d'un JWT ({ id, username, exp, ... }) sans vérifier la signature.
 * Sert uniquement à l'affichage : c'est le serveur qui valide le token.
 */
export function decodeTokenPayload(token) {
    try {
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        return JSON.parse(new TextDecoder().decode(bytes));
    } catch {
        return null;
    }
}
