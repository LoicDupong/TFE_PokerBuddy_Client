"use client";

import { useEffect } from "react";
import useAuthStore from "@/stores/useAuthStore.js";

// Restaure la session (token du localStorage) une seule fois au chargement de l'app
export default function AuthInit() {
    const fetchMe = useAuthStore((state) => state.fetchMe);

    useEffect(() => {
        fetchMe();
    }, [fetchMe]);

    return null;
}
