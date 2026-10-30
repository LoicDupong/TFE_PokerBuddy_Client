import Link from "next/link.js";
import { getT } from "@/i18n/server.js";

const MESSAGES = {
    en: { title: "Page not found | PokerBuddy", pageRed: "Page", notFound: "not found", text: "This page doesn't exist.", back: "Back to home" },
    fr: { title: "Page introuvable | PokerBuddy", pageRed: "Page", notFound: "introuvable", text: "Cette page n'existe pas.", back: "Retour à l'accueil" },
};

export async function generateMetadata() {
    const { t } = await getT(MESSAGES);
    return { title: t("title") };
}

export default async function NotFound() {
    const { t } = await getT(MESSAGES);
    return (
        <section className="not-found">
            <p className="not-found__code" aria-hidden="true">404</p>
            <h1><span className="red">{t("pageRed")}</span> {t("notFound")}</h1>
            <p>{t("text")}</p>
            <Link href="/" className="btn">{t("back")}</Link>
        </section>
    );
}
