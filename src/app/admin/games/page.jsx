"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import adminService from "@/services/admin.service.js";
import { Badge, LoadError, Pagination } from "@/components/admin/admin-ui.jsx";
import { gameTone, useAdminFormat, useAdminText, useDebounced, useTexts } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";
import { useLocale } from "@/i18n/i18n-provider.jsx";

const GAMES_MESSAGES = {
    en: {
        title: "Games",
        search: "Search by game name",
        status: "Status",
        any: "Any",
        loadError: "Could not load games.",
        players: (n) => (n === 1 ? "1 player" : `${n} players`),
        hostedBy: (name) => `Hosted by ${name}`,
    },
    fr: {
        title: "Parties",
        search: "Rechercher par nom de partie",
        status: "Statut",
        any: "Tous",
        loadError: "Impossible de charger les parties.",
        players: (n) => (n <= 1 ? `${n} joueur` : `${n} joueurs`),
        hostedBy: (name) => `Organisée par ${name}`,
    },
};

const PAGE_SIZE = 20;

export default function AdminGamesPage() {
    const GAMES_TEXT = useTexts(GAMES_MESSAGES);
    const ADMIN_TEXT = useAdminText();
    const { formatDateTime } = useAdminFormat();
    const { locale } = useLocale();
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
            const res = await adminService.listGames({ q: search, status, page, pageSize: PAGE_SIZE });
            if (cancelled) return;
            if (res.success) { setResult(res.data); setError(null); }
            else setError(res.forbidden ? ADMIN_TEXT.forbidden : GAMES_TEXT.loadError);
        })();
        return () => { cancelled = true; };
    }, [search, status, page, attempt, ADMIN_TEXT.forbidden, GAMES_TEXT.loadError]);

    return (
        <section className="admin__section">
            <h2>{GAMES_TEXT.title}</h2>
            <div className="admin__filters">
                <label>
                    {GAMES_TEXT.search}
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} />
                </label>
                <label>
                    {GAMES_TEXT.status}
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                        <option value="">{GAMES_TEXT.any}</option>
                        {["pending", "active", "finished"].map((value) => <option key={value} value={value}>{ADMIN_TEXT.gameStatuses[value]}</option>)}
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
                        {result.items.map((g) => (
                            <li key={g.id}>
                                <Link href={`/admin/games/${g.id}`} className="admin__row">
                                    <span className="admin__row-main">{g.name}</span>
                                    <Badge tone={gameTone[g.status]}>{ADMIN_TEXT.gameStatuses[g.status] ?? g.status}</Badge>
                                    <span className="admin__row-meta">
                                        {formatDateTime(g.dateStart)} · {GAMES_TEXT.hostedBy(displayPlayerName(g.host?.username, locale))} · {GAMES_TEXT.players(g.playersCount ?? 0)}
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
