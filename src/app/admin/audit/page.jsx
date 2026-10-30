"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import adminService from "@/services/admin.service.js";
import { LoadError, Pagination } from "@/components/admin/admin-ui.jsx";
import { ADMIN_TEXT, formatDateTime } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";

const AUDIT_TEXT = {
    title: "Audit log",
    hint: "Every administrative action is recorded here, newest first.",
    action: "Action",
    targetType: "Target",
    any: "Any",
    loadError: "Could not load the audit log.",
    empty: "No action recorded for these filters.",
    by: (name) => `by ${name}`,
    actions: {
        "user.role": "Role changed",
        "user.disable": "Account disabled",
        "user.enable": "Account re-enabled",
        "user.revoke_sessions": "Sessions revoked",
        "user.delete": "Account deleted",
        "game.cancel": "Game cancelled",
        "support.reply": "Support reply sent",
        "support.status": "Ticket status changed",
    },
    targets: { user: "Account", game: "Game", support_ticket: "Support ticket" },
    pageSize: 25,
};

// Page admin de la cible, quand elle existe
const targetHref = (type, id) => {
    if (!id) return null;
    if (type === "user") return `/admin/users/${id}`;
    if (type === "game") return `/admin/games/${id}`;
    if (type === "support_ticket") return `/admin/support/${id}`;
    return null;
};

// Résumé lisible des détails (JSON déjà purgé des secrets côté serveur)
const detailsText = (details) => {
    if (!details || typeof details !== "object") return "";
    return Object.entries(details)
        .filter(([, v]) => v !== null && v !== undefined && v !== "")
        .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
        .join(" · ");
};

export default function AdminAuditPage() {
    const [action, setAction] = useState("");
    const [targetType, setTargetType] = useState("");
    const [page, setPage] = useState(1);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => { setPage(1); }, [action, targetType]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            const res = await adminService.listAuditLogs({ action, targetType, page, pageSize: AUDIT_TEXT.pageSize });
            if (cancelled) return;
            if (res.success) { setResult(res.data); setError(null); }
            else setError(res.forbidden ? ADMIN_TEXT.forbidden : AUDIT_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [action, targetType, page, attempt]);

    return (
        <section className="admin__section">
            <h2>{AUDIT_TEXT.title}</h2>
            <p className="admin__hint">{AUDIT_TEXT.hint}</p>
            <div className="admin__filters">
                <label>
                    {AUDIT_TEXT.action}
                    <select value={action} onChange={(e) => setAction(e.target.value)}>
                        <option value="">{AUDIT_TEXT.any}</option>
                        {Object.entries(AUDIT_TEXT.actions).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
                <label>
                    {AUDIT_TEXT.targetType}
                    <select value={targetType} onChange={(e) => setTargetType(e.target.value)}>
                        <option value="">{AUDIT_TEXT.any}</option>
                        {Object.entries(AUDIT_TEXT.targets).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                    </select>
                </label>
            </div>

            {error && <LoadError message={error} onRetry={() => setAttempt((n) => n + 1)} />}
            {!error && result === null && <p>{ADMIN_TEXT.loading}</p>}
            {result && (
                <>
                    <p className="admin__count" aria-live="polite">{ADMIN_TEXT.results(result.total)}</p>
                    {result.items.length === 0 && <p className="admin__hint">{AUDIT_TEXT.empty}</p>}
                    <ul className="admin__list">
                        {result.items.map((log) => {
                            const href = targetHref(log.targetType, log.targetId);
                            const label = AUDIT_TEXT.actions[log.action] ?? log.action;
                            const details = detailsText(log.details);
                            return (
                                <li key={log.id} className="admin__row">
                                    <span className="admin__row-main">{href ? <Link href={href}>{label}</Link> : label}</span>
                                    <time className="admin__row-meta" dateTime={log.createdAt}>
                                        {formatDateTime(log.createdAt)} · {AUDIT_TEXT.by(displayPlayerName(log.actor?.username ?? "—"))} · {AUDIT_TEXT.targets[log.targetType] ?? log.targetType}
                                    </time>
                                    {details && <span className="admin__row-meta">{details}</span>}
                                </li>
                            );
                        })}
                    </ul>
                    {result.total > result.pageSize && <Pagination page={result.page} pageSize={result.pageSize} total={result.total} onPage={setPage} />}
                </>
            )}
        </section>
    );
}
