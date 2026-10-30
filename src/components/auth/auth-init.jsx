"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore.js";
import { useLocale } from "@/i18n/i18n-provider.jsx";
import { LOCALE_COOKIE, isLocale } from "@/i18n/config.js";

// Restaure la session (token du localStorage) une seule fois au chargement de l'app
export default function AuthInit() {
    const fetchMe = useAuthStore((state) => state.fetchMe);
    const accountLocale = useAuthStore((state) => state.user?.locale);
    const { locale, setLocale } = useLocale();

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    // Pas de choix explicite sur cet appareil (cookie absent) : on adopte la langue du compte
    useEffect(() => {
        const hasCookie = document.cookie.split("; ").some((c) => c.startsWith(`${LOCALE_COOKIE}=`));
        if (!hasCookie && isLocale(accountLocale) && accountLocale !== locale) setLocale(accountLocale);
    }, [accountLocale, locale, setLocale]);

    return null;
}
