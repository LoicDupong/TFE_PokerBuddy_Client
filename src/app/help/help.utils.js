"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore.js";

// Limites des champs (les textes sont dans help.messages.js)
export const HELP_TEXT = {
    subjectMax: 120,
    messageMax: 4000,
};

export function formatDateTime(iso, intlLocale = "en-GB") {
    return new Date(iso).toLocaleString(intlLocale, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

// Pages réservées aux membres : un visiteur est renvoyé vers le login, puis ramené ici
export function useRequireMember() {
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (isReady && !user) router.replace(`/auth/login?redirect=${encodeURIComponent(pathname)}`);
    }, [isReady, user, router, pathname]);

    return { user, isReady, allowed: isReady && Boolean(user) };
}
