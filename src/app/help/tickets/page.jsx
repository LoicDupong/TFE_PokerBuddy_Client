"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import supportService from "@/services/support.service.js";
import { HELP_TEXT, formatDateTime, useRequireMember } from "../help.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";
import { HELP_MESSAGES } from "../help.messages.js";

export default function MyTicketsPage() {
    const { t, intlLocale } = useT(HELP_MESSAGES);
    const { allowed } = useRequireMember();
    const [tickets, setTickets] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        if (!allowed) return;
        let cancelled = false;
        (async () => {
            const res = await supportService.getMyTickets();
            if (cancelled) return;
            if (res.success) { setTickets(res.data); setError(null); }
            else setError("list.loadError"); // clé et non texte : suit un changement de langue
        })();
        return () => { cancelled = true; };
    }, [allowed, attempt]);

    if (!allowed) return <p>{t("list.loading")}</p>;

    return (
        <div className="help">
            <header className="help__header">
                <h1>{t("list.title")}</h1>
                <Link href="/help" className="btn btn--small help__link">{t("list.newRequest")}</Link>
            </header>

            {error && (
                <div className="help__section">
                    <p role="alert">{t(error)}</p>
                    <button type="button" className="btn btn--small" onClick={() => setAttempt((n) => n + 1)}>{t("list.retry")}</button>
                </div>
            )}
            {!error && tickets === null && <p>{t("list.loading")}</p>}
            {tickets?.length === 0 && (
                <div className="help__section">
                    <p className="help__hint">{t("list.empty")}</p>
                    <Link href="/help" className="btn btn--secondary">{t("list.contact")}</Link>
                </div>
            )}
            {tickets?.length > 0 && (
                <ul className="help__tickets">
                    {tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <Link href={`/help/tickets/${ticket.id}`} className="help__ticket">
                                <span className="help__ticket-subject">{ticket.subject}</span>
                                <span className={`help__badge help__badge--${ticket.status}`}>{t(`statuses.${ticket.status}`)}</span>
                                <span className="help__ticket-meta">
                                    {t(`categories.${ticket.category}`)} · {formatDateTime(ticket.lastMessageAt, intlLocale)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
