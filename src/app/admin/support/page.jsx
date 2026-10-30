"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import adminSupportService from "@/services/adminSupport.service.js";
import { Badge, LoadError, Pagination } from "@/components/admin/admin-ui.jsx";
import { ADMIN_TEXT, formatDateTime, ticketTone, useDebounced } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";

const SUPPORT_TEXT = {
    title: "Support",
    search: "Search by subject or username",
    status: "Status",
    any: "All tickets",
    loadError: "Could not load the tickets.",
    empty: "No ticket matches these filters.",
    pageSize: 20,
};

export default function AdminSupportPage() {
    const [q, setQ] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const search = useDebounced(q);

    useEffect(() => { setPage(1); }, [search, status]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await adminSupportService.listTickets({ q: search, status, page, pageSize: SUPPORT_TEXT.pageSize });
            if (cancelled) return;
            if (res.success) { setResult(res.data); setError(null); }
            else setError(res.forbidden ? ADMIN_TEXT.forbidden : SUPPORT_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [search, status, page, attempt]);

    return (
        <section className="admin__section">
            <h2>{SUPPORT_TEXT.title}</h2>
            <div className="admin__filters">
                <label>
                    {SUPPORT_TEXT.search}
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
                </label>
                <label>
                    {SUPPORT_TEXT.status}
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">{SUPPORT_TEXT.any}</option>
                        {Object.entries(ADMIN_TEXT.ticketStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
            </div>

            {error && <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />}
            {!error && result === null && <p>{ADMIN_TEXT.loading}</p>}
            {result && (
                <>
                    <p className="admin__count" aria-live="polite">{ADMIN_TEXT.results(result.total)}</p>
                    {result.items.length === 0 && <p className="admin__hint">{SUPPORT_TEXT.empty}</p>}
                    <ul className="admin__list">
                        {result.items.map((t) => (
                            <li key={t.id}>
                                <Link href={`/admin/support/${t.id}`} className="admin__row">
                                    <span className="admin__row-main">{t.subject}</span>
                                    <Badge tone={ticketTone[t.status]}>{ADMIN_TEXT.ticketStatuses[t.status]}</Badge>
                                    <span className="admin__row-meta">
                                        {displayPlayerName(t.user?.username)} · {ADMIN_TEXT.ticketCategories[t.category] ?? t.category} · {formatDateTime(t.lastMessageAt)}
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    {result.total > result.pageSize && <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={setPage} />}
                </>
            )}
        </section>
    );
}
