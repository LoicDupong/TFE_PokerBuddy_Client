"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

import adminService from "@/services/admin.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { Badge, ConfirmDialog, LoadError } from "@/components/admin/admin-ui.jsx";
import { gameTone, useAdminFormat, useAdminText, useTexts } from "@/components/admin/admin.utils.js";
import { displayPlayerName } from "@/utils/game.utils.js";
import { useLocale } from "@/i18n/i18n-provider.jsx";

const GAME_MESSAGES = {
    en: {
        back: "Games",
        notFound: "This game does not exist.",
        loadError: "Could not load this game.",
        facts: {
            host: "Host",
            start: "Start",
            end: "End",
            location: "Location",
            buyIn: "Buy-in",
            prizePool: "Prize pool",
            options: "Options",
        },
        options: (game) => [game.allowRebuys && "Rebuys", game.pkoEnabled && "PKO bounties"].filter(Boolean).join(", ") || "None",
        playersTitle: "Players",
        playerStatuses: { accepted: "accepted", pending: "pending", refused: "refused" },
        guest: "guest",
        noPlayers: "No player yet.",
        resultsTitle: "Results",
        noResults: "No result recorded.",
        prize: (amount) => `Prize ${amount}`,
        bounty: (amount) => `Bounty ${amount}`,
        financeTitle: "Finances",
        financeUntracked: "This game has no tracked buy-ins.",
        financeLocked: "Locked (game finished)",
        financeIssues: (n) => (n === 0 ? "No inconsistency" : `${n} inconsistency(ies) to check`),
        invested: "Total invested",
        prizePoolTotal: "Prize pool",
        bountyPool: "Bounty pool",
        cancelTitle: "Cancel this game",
        cancel: "Cancel game",
        finishedNote: "A finished game cannot be cancelled.",
        cancelBody: (name) => `Cancel "${name}"? Every participant, including the host, is notified. This cannot be undone.`,
        cancelLabel: "Cancel the game",
        keep: "Keep it",
        cancelled: (n) => (n === 1 ? "Game cancelled. 1 person notified." : `Game cancelled. ${n} people notified.`),
    },
    fr: {
        back: "Parties",
        notFound: "Cette partie n'existe pas.",
        loadError: "Impossible de charger cette partie.",
        facts: {
            host: "Organisateur",
            start: "Début",
            end: "Fin",
            location: "Lieu",
            buyIn: "Buy-in",
            prizePool: "Prize pool",
            options: "Options",
        },
        options: (game) => [game.allowRebuys && "Rebuys", game.pkoEnabled && "Bounties PKO"].filter(Boolean).join(", ") || "Aucune",
        playersTitle: "Joueurs",
        playerStatuses: { accepted: "accepté", pending: "en attente", refused: "refusé" },
        guest: "invité",
        noPlayers: "Aucun joueur pour l'instant.",
        resultsTitle: "Résultats",
        noResults: "Aucun résultat enregistré.",
        prize: (amount) => `Gain ${amount}`,
        bounty: (amount) => `Bounty ${amount}`,
        financeTitle: "Finances",
        financeUntracked: "Cette partie n'a pas de buy-ins suivis.",
        financeLocked: "Verrouillées (partie terminée)",
        financeIssues: (n) => (n === 0 ? "Aucune incohérence" : `${n} incohérence(s) à vérifier`),
        invested: "Total investi",
        prizePoolTotal: "Prize pool",
        bountyPool: "Cagnotte de bounties",
        cancelTitle: "Annuler cette partie",
        cancel: "Annuler la partie",
        finishedNote: "Une partie terminée ne peut pas être annulée.",
        cancelBody: (name) => `Annuler « ${name} » ? Tous les participants, hôte compris, sont prévenus. Cette action est irréversible.`,
        cancelLabel: "Annuler la partie",
        keep: "La garder",
        cancelled: (n) => (n <= 1 ? `Partie annulée. ${n} personne prévenue.` : `Partie annulée. ${n} personnes prévenues.`),
    },
};

export default function AdminGamePage() {
    const GAME_TEXT = useTexts(GAME_MESSAGES);
    const ADMIN_TEXT = useAdminText();
    const { formatCents, formatDateTime } = useAdminFormat();
    const { locale } = useLocale();
    const { id } = useParams();
    const router = useRouter();
    const showToast = useToastStore((state) => state.showToast);
    const [game, setGame] = useState(null);
    const [state, setState] = useState("loading");
    const [confirm, setConfirm] = useState(false);
    const [pending, setPending] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const load = useCallback(async () => {
        const res = await adminService.getGame(id);
        if (res.success) { setGame(res.data); setState("ready"); }
        else setState(res.notFound ? "notFound" : "error");
    }, [id]);

    useEffect(() => { load(); }, [load, attempt]);

    async function handleCancel(reason) {
        setPending(true);
        const res = await adminService.cancelGame(id, reason || undefined);
        setPending(false);
        setConfirm(false);
        if (!res.success) {
            showToast(res.forbidden ? ADMIN_TEXT.forbidden : res.error || ADMIN_TEXT.genericError, "error");
            // Partie déjà terminée entre-temps : on rafraîchit la fiche
            if (res.code === "GAME_FINISHED") load();
            return;
        }
        showToast(GAME_TEXT.cancelled(res.data.notified ?? 0), "success");
        router.replace("/admin/games");
    }

    if (state === "loading") return <p>{ADMIN_TEXT.loading}</p>;
    if (state === "notFound") {
        return (
            <section className="admin__section">
                <p className="admin__hint">{GAME_TEXT.notFound}</p>
                <Link href="/admin/games" className="admin__back">← {GAME_TEXT.back}</Link>
            </section>
        );
    }
    if (state === "error") return <LoadError message={GAME_TEXT.loadError} onRetry={() => { setState("loading"); setAttempt((n) => n + 1); }} />;

    const nameOf = new Map(game.players.map((p) => [p.id, p]));
    const money = (cents) => `${formatCents(cents)} ${game.currency ?? ""}`.trim();
    const finished = game.status === "finished";

    return (
        <section className="admin__section">
            <Link href="/admin/games" className="admin__back">← {GAME_TEXT.back}</Link>
            <h2>{game.name}</h2>
            <p><Badge tone={gameTone[game.status]}>{ADMIN_TEXT.gameStatuses[game.status] ?? game.status}</Badge></p>

            <div className="admin__card">
                <dl className="admin__facts">
                    <dt>{GAME_TEXT.facts.host}</dt>
                    <dd>{game.host ? <Link href={`/admin/users/${game.host.id}`}>{displayPlayerName(game.host.username, locale)}</Link> : "—"}</dd>
                    <dt>{GAME_TEXT.facts.start}</dt><dd>{formatDateTime(game.dateStart)}</dd>
                    {game.dateEnd && <><dt>{GAME_TEXT.facts.end}</dt><dd>{formatDateTime(game.dateEnd)}</dd></>}
                    {game.location && <><dt>{GAME_TEXT.facts.location}</dt><dd>{game.location}</dd></>}
                    <dt>{GAME_TEXT.facts.buyIn}</dt><dd>{game.buyIn ?? 0} {game.currency}</dd>
                    <dt>{GAME_TEXT.facts.options}</dt><dd>{GAME_TEXT.options(game)}</dd>
                </dl>
            </div>

            <h3>{GAME_TEXT.playersTitle}</h3>
            {game.players.length === 0 && <p className="admin__hint">{GAME_TEXT.noPlayers}</p>}
            <ul className="admin__list">
                {game.players.map((p) => (
                    <li key={p.id} className="admin__row">
                        <span className="admin__row-main">
                            {p.userId ? <Link href={`/admin/users/${p.userId}`}>{displayPlayerName(p.name, locale)}</Link> : displayPlayerName(p.name, locale)}
                            {p.isGuest ? ` (${GAME_TEXT.guest})` : ""}
                        </span>
                        <span className="admin__row-meta">{GAME_TEXT.playerStatuses[p.status] ?? p.status}</span>
                    </li>
                ))}
            </ul>

            {finished && (
                <>
                    <h3>{GAME_TEXT.resultsTitle}</h3>
                    {game.results.length === 0 && <p className="admin__hint">{GAME_TEXT.noResults}</p>}
                    <ol className="admin__list">
                        {game.results.map((r) => (
                            <li key={r.gamePlayerId} className="admin__row">
                                <span className="admin__row-main">{r.rank}. {displayPlayerName(nameOf.get(r.gamePlayerId)?.name ?? "—", locale)}</span>
                                <span className="admin__row-meta">
                                    {GAME_TEXT.prize(r.prizeCents != null ? money(r.prizeCents) : r.prize ?? 0)}
                                    {r.bountyCents ? ` · ${GAME_TEXT.bounty(money(r.bountyCents))}` : ""}
                                </span>
                            </li>
                        ))}
                    </ol>
                </>
            )}

            <h3>{GAME_TEXT.financeTitle}</h3>
            {!game.finance?.tracked ? <p className="admin__hint">{GAME_TEXT.financeUntracked}</p> : (
                <div className="admin__card">
                    <dl className="admin__facts">
                        <dt>{GAME_TEXT.invested}</dt><dd>{money(game.finance.totals.investedCents)}</dd>
                        <dt>{GAME_TEXT.prizePoolTotal}</dt><dd>{money(game.finance.totals.prizePoolCents)}</dd>
                        {game.finance.totals.bountyPoolCents > 0 && <><dt>{GAME_TEXT.bountyPool}</dt><dd>{money(game.finance.totals.bountyPoolCents)}</dd></>}
                    </dl>
                    <p className="admin__hint">{game.finance.locked ? `${GAME_TEXT.financeLocked} · ` : ""}{GAME_TEXT.financeIssues(game.finance.issues)}</p>
                </div>
            )}

            <h3>{GAME_TEXT.cancelTitle}</h3>
            {finished
                ? <p className="admin__hint">{GAME_TEXT.finishedNote}</p>
                : <div className="admin__actions"><button type="button" className="btn admin__btn admin__btn--danger" onClick={() => setConfirm(true)}>{GAME_TEXT.cancel}</button></div>}

            {confirm && (
                <ConfirmDialog
                    title={GAME_TEXT.cancelTitle}
                    confirmLabel={GAME_TEXT.cancelLabel}
                    danger
                    withReason
                    pending={pending}
                    onCancel={() => setConfirm(false)}
                    onConfirm={handleCancel}
                >
                    <p>{GAME_TEXT.cancelBody(game.name)}</p>
                </ConfirmDialog>
            )}
        </section>
    );
}
