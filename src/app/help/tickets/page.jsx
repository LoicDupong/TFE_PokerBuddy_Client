"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import supportService from "@/services/support.service.js";
import { HELP_TEXT, formatDateTime, useRequireMember } from "../help.utils.js";

const LIST_TEXT = {
    title: "My requests",
    newRequest: "New request",
    loading: "Loading…",
    empty: "You haven't sent any request yet.",
    contact: "Contact us",
    retry: "Try again",
    loadError: "Could not load your requests.",
};

export default function MyTicketsPage() {
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
            else setError(LIST_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [allowed, attempt]);

    if (!allowed) return <p>{LIST_TEXT.loading}</p>;

    return (
        <div className="help">
            <header className="help__header">
                <h1>{LIST_TEXT.title}</h1>
                <Link href="/help" className="btn btn--small help__link">{LIST_TEXT.newRequest}</Link>
            </header>

            {error && (
                <div className="help__section">
                    <p role="alert">{error}</p>
                    <button type="button" className="btn btn--small" onClick={() => setAttempt((n) => n + 1)}>{LIST_TEXT.retry}</button>
                </div>
            )}
            {!error && tickets === null && <p>{LIST_TEXT.loading}</p>}
            {tickets?.length === 0 && (
                <div className="help__section">
                    <p className="help__hint">{LIST_TEXT.empty}</p>
                    <Link href="/help" className="btn btn--secondary">{LIST_TEXT.contact}</Link>
                </div>
            )}
            {tickets?.length > 0 && (
                <ul className="help__tickets">
                    {tickets.map((ticket) => (
                        <li key={ticket.id}>
                            <Link href={`/help/tickets/${ticket.id}`} className="help__ticket">
                                <span className="help__ticket-subject">{ticket.subject}</span>
                                <span className={`help__badge help__badge--${ticket.status}`}>{HELP_TEXT.statuses[ticket.status]}</span>
                                <span className="help__ticket-meta">
                                    {HELP_TEXT.categories[ticket.category]} · {formatDateTime(ticket.lastMessageAt)}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
