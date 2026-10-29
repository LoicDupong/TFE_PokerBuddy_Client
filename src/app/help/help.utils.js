"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import useAuthStore from "@/stores/useAuthStore.js";

// Textes de l'aide regroupés ici (extraction FR/EN en vague 3)
export const HELP_TEXT = {
    categories: {
        bug: "Something is broken",
        account: "My account",
        game: "A game or its results",
        suggestion: "An idea or suggestion",
        other: "Something else",
    },
    statuses: {
        new: "Sent",
        in_progress: "In progress",
        resolved: "Resolved",
    },
    subjectMax: 120,
    messageMax: 4000,
};

export function formatDateTime(iso) {
    return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
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
