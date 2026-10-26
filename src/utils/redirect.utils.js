/**
 * N'accepte qu'un chemin interne ("/join/abc") comme destination après login,
 * jamais une URL externe ("https://…", "//site.com", "/\site.com").
 */
export function getSafeRedirect(value) {
    if (typeof value !== "string") return null;
    if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return null;
    return value;
}
