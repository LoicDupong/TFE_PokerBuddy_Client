"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import adminService from "@/services/admin.service.js";
import { Badge, LoadError, Pagination } from "@/components/admin/admin-ui.jsx";
import { ADMIN_TEXT, accountTone, formatDate, useDebounced } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";

const USERS_TEXT = {
    title: "Users",
    search: "Search by username or email",
    role: "Role",
    status: "Status",
    any: "Any",
    loadError: "Could not load users.",
    joined: (date) => `Joined ${date}`,
    pageSize: 20,
};

export default function AdminUsersPage() {
    const [q, setQ] = useState("");
    const [role, setRole] = useState("");
    const [status, setStatus] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);
    const search = useDebounced(q);

    useEffect(() => { setPage(1); }, [search, role, status]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await adminService.listUsers({ q: search, role, status, page, pageSize: USERS_TEXT.pageSize });
            if (cancelled) return;
            if (res.success) { setResult(res.data); setError(null); }
            else setError(res.forbidden ? ADMIN_TEXT.forbidden : USERS_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [search, role, status, page, attempt]);

    return (
        <section className="admin__section">
            <h2>{USERS_TEXT.title}</h2>
            <div className="admin__filters">
                <label>
                    {USERS_TEXT.search}
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
                </label>
                <label>
                    {USERS_TEXT.role}
                    <select value={role} onChange={(e) => setRole(e.target.value)}>
                        <option value="">{USERS_TEXT.any}</option>
                        <option value="user">{ADMIN_TEXT.roles.user}</option>
                        <option value="admin">{ADMIN_TEXT.roles.admin}</option>
                    </select>
                </label>
                <label>
                    {USERS_TEXT.status}
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">{USERS_TEXT.any}</option>
                        {Object.entries(ADMIN_TEXT.accountStatuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
            </div>

            {error && <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />}
            {!error && result === null && <p>{ADMIN_TEXT.loading}</p>}
            {result && (
                <>
                    <p className="admin__count" aria-live="polite">{ADMIN_TEXT.results(result.total)}</p>
                    {result.items.length === 0 && <p className="admin__hint">{ADMIN_TEXT.noResults}</p>}
                    <ul className="admin__list">
                        {result.items.map((u) => (
                            <li key={u.id}>
                                <Link href={`/admin/users/${u.id}`} className="admin__row">
                                    <span className="admin__row-main">{displayPlayerName(u.username)}</span>
                                    <span>
                                        {u.role === "admin" && <Badge tone="info">{ADMIN_TEXT.roles.admin}</Badge>}{" "}
                                        <Badge tone={accountTone[u.status]}>{ADMIN_TEXT.accountStatuses[u.status]}</Badge>
                                    </span>
                                    <span className="admin__row-meta">{u.status === "deleted" ? USERS_TEXT.joined(formatDate(u.createdAt)) : `${u.email} · ${USERS_TEXT.joined(formatDate(u.createdAt))}`}</span>
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
