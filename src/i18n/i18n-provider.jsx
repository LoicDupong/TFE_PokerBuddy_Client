"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DEFAULT_LOCALE, INTL_LOCALES, LOCALE_COOKIE, isLocale } from "./config.js";
import { translate } from "./translate.js";

const I18nContext = createContext({ locale: DEFAULT_LOCALE, setLocale: () => {} });

// Contexte React et non store Zustand : au rendu serveur, un store de module serait partagé
// entre les requêtes de visiteurs de langues différentes
export function I18nProvider({ initialLocale, children }) {
    const [locale, setLocaleState] = useState(isLocale(initialLocale) ? initialLocale : DEFAULT_LOCALE);
    const router = useRouter();

    const setLocale = useCallback((next) => {
        if (!isLocale(next)) return;
        document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
        document.documentElement.lang = next;
        setLocaleState(next);
        // Les composants serveur (métadonnées, glossaire) relisent le cookie
        router.refresh();
    }, [router]);

    const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);
    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useLocale = () => useContext(I18nContext);

// const { t, locale } = useT(MESSAGES) ; t("key", { name })
export function useT(messages) {
    const { locale } = useContext(I18nContext);
    const t = useCallback((key, params) => translate(messages, locale, key, params), [messages, locale]);
    return { t, locale, intlLocale: INTL_LOCALES[locale] };
}
