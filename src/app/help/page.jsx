"use client";

import Link from "next/link";
import useAuthStore from "@/stores/useAuthStore.js";
import Faq from "./faq.jsx";
import TicketForm from "./ticket-form.jsx";

const PAGE_TEXT = {
    title: "Help",
    intro: "Find a quick answer, or send us a message.",
    myRequests: "My requests",
    loginPrompt: "Log in to contact us and follow your requests.",
    login: "Log in",
};

// La FAQ est publique (utile même sans pouvoir se connecter) ; le formulaire et le suivi demandent un compte
export default function HelpPage() {
    const user = useAuthStore((state) => state.user);
    const isReady = useAuthStore((state) => state.isReady);

    return (
        <div className="help">
            <header className="help__header">
                <h1>{PAGE_TEXT.title}</h1>
                <p className="help__hint">{PAGE_TEXT.intro}</p>
                {user && <Link href="/help/tickets" className="btn btn--small help__link">{PAGE_TEXT.myRequests}</Link>}
            </header>

            <Faq />

            {isReady && user && <TicketForm />}
            {isReady && !user && (
                <section className="help__section">
                    <p className="help__hint">{PAGE_TEXT.loginPrompt}</p>
                    <Link href="/auth/login?redirect=%2Fhelp" className="btn btn--secondary">{PAGE_TEXT.login}</Link>
                </section>
            )}
        </div>
    );
}
