"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

// Mesure d'audience sans cookie : à chaque changement de page, un ping { path, referrer } part vers l'API,
// qui n'en garde qu'un compteur par jour et par page. Aucun identifiant n'est stocké ni envoyé.
// Désactivé en développement (sauf NEXT_PUBLIC_ANALYTICS_DEV=1) et si le navigateur demande "Do Not Track".
const ENDPOINT = `${process.env.NEXT_PUBLIC_API_URL}/analytics/pageview`;
const isEnabled = () =>
    (process.env.NODE_ENV === "production" || process.env.NEXT_PUBLIC_ANALYTICS_DEV === "1")
    && typeof navigator !== "undefined"
    && navigator.doNotTrack !== "1";

function sendPageView(path, referrer) {
    const payload = JSON.stringify({ path, referrer });
    try {
        // text/plain : requête CORS "simple", sans preflight (l'API lit le JSON elle-même)
        const queued = navigator.sendBeacon?.(ENDPOINT, new Blob([payload], { type: "text/plain" }));
        if (queued) return;
    } catch {
        // repli ci-dessous
    }
    fetch(ENDPOINT, { method: "POST", body: payload, headers: { "Content-Type": "text/plain" }, keepalive: true })
        .catch(() => { /* la mesure ne doit jamais gêner l'app */ });
}

export default function PageViewTracker() {
    const pathname = usePathname();
    const lastPath = useRef(null);

    useEffect(() => {
        if (!isEnabled() || lastPath.current === pathname) return;
        // Le référent n'a de sens que pour l'arrivée sur le site ; ensuite c'est de la navigation interne
        const referrer = lastPath.current === null ? document.referrer : "";
        lastPath.current = pathname;
        sendPageView(pathname, referrer);
    }, [pathname]);

    return null;
}
