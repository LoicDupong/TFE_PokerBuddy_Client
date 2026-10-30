import { DEFAULT_LOCALE } from "./config.js";

// Dictionnaire colocalisé dans chaque fichier : { en: { title: "…" }, fr: { title: "…" } }.
// Valeur = texte avec {param}, ou fonction (params) => texte pour les pluriels.
// Clés imbriquées accessibles par "section.key".
const lookup = (messages, locale, key) =>
    key.split(".").reduce((node, part) => (node == null ? undefined : node[part]), messages?.[locale]);

export function translate(messages, locale, key, params = {}) {
    let value = lookup(messages, locale, key);
    // Traduction manquante : l'anglais plutôt qu'un trou, la clé en dernier recours (visible en recette)
    if (value === undefined && locale !== DEFAULT_LOCALE) value = lookup(messages, DEFAULT_LOCALE, key);
    if (value === undefined) {
        if (process.env.NODE_ENV !== "production") console.warn(`[i18n] missing key "${key}" (${locale})`);
        return key;
    }
    if (typeof value === "function") return value(params);
    return String(value).replace(/\{(\w+)\}/g, (match, name) => (params[name] ?? match));
}
