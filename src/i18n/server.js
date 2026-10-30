import "server-only";
import { cookies, headers } from "next/headers";
import { INTL_LOCALES, LOCALE_COOKIE, resolveLocale } from "./config.js";
import { translate } from "./translate.js";

// Langue de la requête, pour les composants serveur et generateMetadata
export async function getLocale() {
    const [cookieStore, headerList] = await Promise.all([cookies(), headers()]);
    return resolveLocale(cookieStore.get(LOCALE_COOKIE)?.value, headerList.get("accept-language") || "");
}

// Équivalent serveur de useT
export async function getT(messages) {
    const locale = await getLocale();
    return { t: (key, params) => translate(messages, locale, key, params), locale, intlLocale: INTL_LOCALES[locale] };
}
