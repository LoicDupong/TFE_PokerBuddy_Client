"use client";

import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore.js";
import Faq from "./faq.jsx";
import TicketForm from "./ticket-form.jsx";
import { useT } from "@/i18n/i18n-provider.jsx";
import { HELP_MESSAGES } from "./help.messages.js";

// La FAQ est publique (utile même sans pouvoir se connecter) ; le formulaire et le suivi demandent un compte
export default function HelpPage() {
    const { t, intlLocale } = useT(HELP_MESSAGES);
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);

    return (
        <div className="help">
            <header className="help__header">
                <h1>{t("page.title")}</h1>
                <p className="help__hint">{t("page.intro")}</p>
                {user && <Link href="/help/tickets" className="btn btn--small help__link">{t("page.myRequests")}</Link>}
            </header>

            <Faq />

            {isReady && user && <TicketForm />}
            {isReady && !user && (
                <section className="help__section">
                    <p className="help__hint">{t("page.loginPrompt")}</p>
                    <Link href="/auth/login?redirect=%2Fhelp" className="btn btn--secondary">{t("page.login")}</Link>
                </section>
            )}
        </div>
    );
}
