// Langues de l'interface. Une seule URL par page : la langue vient d'un cookie, pas du chemin.
export const LOCALES = ["en", "fr"];
export const DEFAULT_LOCALE = "en";
// Lu côté serveur par le layout racine : le HTML est rendu directement dans la bonne langue
export const LOCALE_COOKIE = "locale";

// Locale Intl utilisée pour les dates et les montants
export const INTL_LOCALES = { en: "en-GB", fr: "fr-BE" };

export const isLocale = (value) => LOCALES.includes(value);

// Cookie choisi par l'utilisateur, sinon première langue connue de l'en-tête Accept-Language
export function resolveLocale(cookieValue, acceptLanguage = "") {
    if (isLocale(cookieValue)) return cookieValue;
    const preferred = acceptLanguage
        .split(",")
        .map((part) => part.split(";")[0].trim().slice(0, 2).toLowerCase())
        .find(isLocale);
    return preferred || DEFAULT_LOCALE;
}
