"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faRotateLeft, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import gameFinanceService from "@/services/gameFinance.service";
import { displayPlayerName } from "@/utils/game.utils.js";
import { centsToInput, formatCents, parseAmountToCents } from "@/utils/money.utils.js";

import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        type: { rebuy: "Rebuy", addon: "Add-on", knockout: "Knockout", buyin: "Buy-in" },
        typeLower: { rebuy: "rebuy", addon: "add-on", knockout: "knockout", buyin: "buy-in" },
        player: "Player",
        invalidAmount: "Enter a valid amount, for example 20 or 12.50.",
        unchanged: "The amount is unchanged.",
        pickKnocker: "Pick who knocked them out.",
        knockedOutBy: (p) => `${p.name} knocked out by ${p.who}`,
        paidAtOnceNote: (p) => ` (${p.amount} paid at once)`,
        undoTitle: "Undo this action?",
        correctTitle: (p) => `Correct this ${p.type}`,
        knockedOutTitle: (p) => `${p.name} is knocked out`,
        entryTitle: (p) => `${p.type} for ${p.name}`,
        players: "Players",
        closePanel: "Close the players panel",
        totalIn: "Total in",
        prizePool: "Prize pool",
        bountiesInPlay: "Bounties in play",
        paidAtOnce: "Paid at once",
        rebuys: "Rebuys",
        addOns: "Add-ons",
        locked: "Results are saved: nothing can be changed anymore.",
        rebuysOff: "Rebuys and add-ons are off for this game. Turn them on in the game settings to use them.",
        in: "In",
        out: "Out",
        playerLine: (p) => `Buy-in ${p.buyIn} · ${p.rebuyCount} ${p.rebuyCount === 1 ? "rebuy" : "rebuys"} (${p.rebuyAmount})`,
        addOnLine: (p) => ` · ${p.count} ${p.count === 1 ? "add-on" : "add-ons"} (${p.amount})`,
        bountyLine: (p) => ` · Bounty ${p.amount}`,
        recordKoFirst: "Record the knockout first",
        rebuy: "Rebuy",
        addon: "Add-on",
        knockedOut: "Knocked out",
        history: "History",
        undoLast: "Undo last action",
        nothing: "Nothing recorded yet.",
        undone: " — undone",
        needsReview: " — needs review",
        corrected: " — corrected",
        edit: "Edit",
        undo: "Undo",
        editAria: (p) => `Edit: ${p.summary}`,
        undoAria: (p) => `Undo: ${p.summary}`,
        voidText: (p) => `${p.summary}. Everything after it is recalculated.`,
        amount: (p) => `Amount (${p.currency})`,
        knockedOutByLegend: "Knocked out by",
        noOther: "No other player is still in.",
        sharedPot: "Shared pot: the bounty is split equally.",
        bountyNote: (p) => `Bounty ${p.amount}: ${p.cash}% paid at once, the rest goes on the knocker's head.`,
        cancel: "Cancel",
        saving: "Saving…",
        tryAgain: "Try again",
        confirm: "Confirm",
    },
    fr: {
        type: { rebuy: "Rebuy", addon: "Add-on", knockout: "Élimination", buyin: "Buy-in" },
        typeLower: { rebuy: "rebuy", addon: "add-on", knockout: "élimination", buyin: "buy-in" },
        player: "Joueur",
        invalidAmount: "Saisis un montant valide, par exemple 20 ou 12,50.",
        unchanged: "Le montant n'a pas changé.",
        pickKnocker: "Choisis qui l'a éliminé.",
        knockedOutBy: (p) => `${p.name} éliminé par ${p.who}`,
        paidAtOnceNote: (p) => ` (${p.amount} versés tout de suite)`,
        undoTitle: "Annuler cette action ?",
        correctTitle: (p) => `Corriger ce ${p.type}`,
        knockedOutTitle: (p) => `${p.name} est éliminé`,
        entryTitle: (p) => `${p.type} pour ${p.name}`,
        players: "Joueurs",
        closePanel: "Fermer le panneau des joueurs",
        totalIn: "Total misé",
        prizePool: "Prize pool",
        bountiesInPlay: "Bounties en jeu",
        paidAtOnce: "Versé tout de suite",
        rebuys: "Rebuys",
        addOns: "Add-ons",
        locked: "Les résultats sont enregistrés : plus rien ne peut être modifié.",
        rebuysOff: "Les rebuys et add-ons sont désactivés pour cette partie. Active-les dans les réglages de la partie pour les utiliser.",
        in: "En jeu",
        out: "Éliminé",
        playerLine: (p) => `Buy-in ${p.buyIn} · ${p.rebuyCount} ${p.rebuyCount === 1 ? "rebuy" : "rebuys"} (${p.rebuyAmount})`,
        addOnLine: (p) => ` · ${p.count} ${p.count === 1 ? "add-on" : "add-ons"} (${p.amount})`,
        bountyLine: (p) => ` · Bounty ${p.amount}`,
        recordKoFirst: "Enregistre d'abord l'élimination",
        rebuy: "Rebuy",
        addon: "Add-on",
        knockedOut: "Éliminé",
        history: "Historique",
        undoLast: "Annuler la dernière action",
        nothing: "Rien d'enregistré pour l'instant.",
        undone: " — annulé",
        needsReview: " — à vérifier",
        corrected: " — corrigé",
        edit: "Modifier",
        undo: "Annuler",
        editAria: (p) => `Modifier : ${p.summary}`,
        undoAria: (p) => `Annuler : ${p.summary}`,
        voidText: (p) => `${p.summary}. Tout ce qui suit est recalculé.`,
        amount: (p) => `Montant (${p.currency})`,
        knockedOutByLegend: "Éliminé par",
        noOther: "Aucun autre joueur n'est encore en jeu.",
        sharedPot: "Pot partagé : la bounty est répartie à parts égales.",
        bountyNote: (p) => `Bounty de ${p.amount} : ${p.cash} % versés tout de suite, le reste va sur la tête du vainqueur du KO.`,
        cancel: "Annuler",
        saving: "Enregistrement…",
        tryAgain: "Réessayer",
        confirm: "Confirmer",
    },
};

// Panneau « Players » de l'hôte : argent de chaque joueur et actions rebuy / add-on / knockout.
// Toute action d'argent passe par une confirmation ; l'opId est créé une fois par action et
// réutilisé tel quel si on renvoie la même requête (double clic, réseau coupé).
export default function FinancePanel({ finance, gameId, currency, chips, onFinance, onClose }) {
    const { t, locale, intlLocale } = useT(MESSAGES);
    const [dialog, setDialog] = useState(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState(null);
    const closeRef = useRef(null);

    useEffect(() => {
        closeRef.current?.focus();
    }, []);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && !dialog && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [dialog, onClose]);

    const money = (cents) => formatCents(cents, currency, intlLocale);
    const cfg = finance.config;
    const isPko = cfg.pkoEnabled;
    const players = finance.players;
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const name = (id) => displayPlayerName(byId.get(id)?.name ?? t("player"), locale);
    const defaultAmount = cfg.rebuyAmountCents ?? cfg.buyInCents;

    const history = finance.history.filter((o) => o.type !== "buyin");
    const lastActive = [...history].reverse().find((o) => o.status === "active");

    const openDialog = (next) => {
        setError(null);
        setDialog({ eliminatorIds: [], amountText: "", ...next, opId: crypto.randomUUID(), sig: null });
    };
    const startEntry = (type, player) => openDialog({ kind: type, player, amountText: centsToInput(defaultAmount) });
    const startKnockout = (player) => openDialog({ kind: "knockout", player });
    const startVoid = (op) => openDialog({ kind: "void", op });
    const startCorrect = (op) =>
        openDialog({
            kind: "correct",
            op,
            amountText: op.amountCents != null ? centsToInput(op.amountCents) : "",
            eliminatorIds: op.eliminatorIds ?? [],
        });

    const patch = (changes) => setDialog((d) => ({ ...d, ...changes }));

    // Requête construite à partir du dialogue ; `invalid` = message si la saisie est incorrecte
    const buildRequest = (d) => {
        const isEntry = d.kind === "rebuy" || d.kind === "addon" || (d.kind === "correct" && d.op.type !== "knockout");
        if (isEntry) {
            const cents = parseAmountToCents(d.amountText);
            if (cents === null) return { invalid: t("invalidAmount") };
            if (d.kind === "correct") {
                if (cents === d.op.amountCents) return { invalid: t("unchanged") };
                return {
                    run: (opId) => gameFinanceService.correctOp(gameId, d.op.id, { opId, amountCents: cents }),
                    body: { cents },
                };
            }
            return {
                run: (opId) =>
                    gameFinanceService.addEntry(gameId, { opId, type: d.kind, gamePlayerId: d.player.id, amountCents: cents, ...(chips > 0 && { chips }) }),
                body: { cents },
            };
        }
        if (d.kind === "knockout" || d.kind === "correct") {
            if (d.eliminatorIds.length === 0) return { invalid: t("pickKnocker") };
            if (d.kind === "correct") {
                return {
                    run: (opId) => gameFinanceService.correctOp(gameId, d.op.id, { opId, eliminatorIds: d.eliminatorIds }),
                    body: { e: d.eliminatorIds },
                };
            }
            return {
                run: (opId) =>
                    gameFinanceService.addKnockout(gameId, { opId, eliminatedId: d.player.id, eliminatorIds: d.eliminatorIds }),
                body: { e: d.eliminatorIds },
            };
        }
        return { run: () => gameFinanceService.voidOp(gameId, d.op.id), body: {} };
    };

    const confirm = async () => {
        if (busy) return;
        const req = buildRequest(dialog);
        if (req.invalid) {
            setError(req.invalid);
            return;
        }
        // Même contenu = même opId (renvoi) ; contenu modifié après une erreur = nouvelle action
        const sig = JSON.stringify(req.body);
        let { opId } = dialog;
        if (dialog.sig && dialog.sig !== sig) opId = crypto.randomUUID();
        setDialog({ ...dialog, opId, sig });
        setBusy(true);
        setError(null);
        const res = await req.run(opId);
        setBusy(false);
        if (res.success) {
            onFinance(res.data.finance);
            setDialog(null);
        } else {
            setError(res.error);
        }
    };

    const toggleEliminator = (id) =>
        patch({
            eliminatorIds: dialog.eliminatorIds.includes(id)
                ? dialog.eliminatorIds.filter((x) => x !== id)
                : [...dialog.eliminatorIds, id],
        });

    // Joueurs encore en jeu pouvant avoir éliminé (hors éliminé)
    const eliminatedId = dialog?.kind === "knockout" ? dialog.player.id : dialog?.op?.gamePlayerId;
    const candidates = players.filter((p) => p.alive && p.id !== eliminatedId);

    const opSummary = (o) => {
        if (o.type === "knockout") {
            const shares = o.effect?.shares ?? [];
            const who = shares.length
                ? shares.map((s) => displayPlayerName(s.name, locale)).join(" + ")
                : (o.eliminatorIds ?? []).map(name).join(" + ");
            const cash = shares.reduce((s, x) => s + x.cashCents, 0);
            return t("knockedOutBy", { name: displayPlayerName(o.playerName, locale), who }) + (o.status === "active" ? t("paidAtOnceNote", { amount: money(cash) }) : "");
        }
        return `${t(`type.${o.type}`)} · ${displayPlayerName(o.playerName, locale)} · ${money(o.amountCents)}`;
    };

    const dialogTitle = () => {
        if (dialog.kind === "void") return t("undoTitle");
        if (dialog.kind === "correct") return t("correctTitle", { type: t(`typeLower.${dialog.op.type}`) });
        if (dialog.kind === "knockout") return t("knockedOutTitle", { name: displayPlayerName(dialog.player.name, locale) });
        return t("entryTitle", { type: t(`type.${dialog.kind}`), name: displayPlayerName(dialog.player.name, locale) });
    };

    const isKoDialog = dialog && (dialog.kind === "knockout" || (dialog.kind === "correct" && dialog.op.type === "knockout"));
    const isAmountDialog = dialog && (dialog.kind === "rebuy" || dialog.kind === "addon" || (dialog.kind === "correct" && dialog.op.type !== "knockout"));

    return (
        <div className="fin-panel" role="dialog" aria-modal="true" aria-labelledby="fin-panel-title">
            <div className="fin-panel__overlay" onClick={onClose} />
            <aside className="fin-panel__sheet">
                <header className="fin-panel__head">
                    <h2 id="fin-panel-title">{t("players")}</h2>
                    <button ref={closeRef} type="button" className="fin-panel__close" onClick={onClose} aria-label={t("closePanel")}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>

                <dl className="fin-totals">
                    <div><dt>{t("totalIn")}</dt><dd>{money(finance.totals.investedCents)}</dd></div>
                    <div><dt>{t("prizePool")}</dt><dd>{money(finance.totals.prizePoolCents)}</dd></div>
                    {isPko && <div><dt>{t("bountiesInPlay")}</dt><dd>{money(finance.totals.bountiesOnTableCents)}</dd></div>}
                    {isPko && <div><dt>{t("paidAtOnce")}</dt><dd>{money(finance.totals.bountiesPaidCents)}</dd></div>}
                    <div><dt>{t("rebuys")}</dt><dd>{finance.totals.rebuyCount} · {money(finance.totals.rebuyCents)}</dd></div>
                    <div><dt>{t("addOns")}</dt><dd>{finance.totals.addOnCount} · {money(finance.totals.addOnCents)}</dd></div>
                </dl>

                {finance.locked && <p className="fin-note">{t("locked")}</p>}
                {!cfg.allowRebuys && !isPko && (
                    <p className="fin-note">{t("rebuysOff")}</p>
                )}

                <ul className="fin-players">
                    {players.map((p) => {
                        const canRebuy = cfg.allowRebuys && (!isPko || p.eliminated);
                        const canAddOn = cfg.allowRebuys && (!isPko || p.alive);
                        return (
                            <li key={p.id} className={`fin-player${isPko && !p.alive ? " fin-player--out" : ""}`}>
                                <div className="fin-player__top">
                                    <strong className="fin-player__name">{displayPlayerName(p.name, locale)}</strong>
                                    {isPko && (
                                        <span className={`fin-badge${p.alive ? " fin-badge--in" : ""}`}>{p.alive ? t("in") : t("out")}</span>
                                    )}
                                    <span className="fin-player__total">{money(p.investedCents)}</span>
                                </div>
                                <p className="fin-player__line">
                                    {t("playerLine", { buyIn: money(p.buyInCents), rebuyCount: p.rebuyCount, rebuyAmount: money(p.rebuyCents) })}
                                    {p.addOnCount > 0 && t("addOnLine", { count: p.addOnCount, amount: money(p.addOnCents) })}
                                    {isPko && t("bountyLine", { amount: money(p.bountyCents) })}
                                </p>
                                {!finance.locked && (
                                    <div className="fin-player__actions">
                                        {cfg.allowRebuys && (
                                            <button type="button" className="fin-btn" disabled={!canRebuy} onClick={() => startEntry("rebuy", p)}
                                                title={!canRebuy ? t("recordKoFirst") : undefined}>{t("rebuy")}</button>
                                        )}
                                        {cfg.allowRebuys && (
                                            <button type="button" className="fin-btn" disabled={!canAddOn} onClick={() => startEntry("addon", p)}>{t("addon")}</button>
                                        )}
                                        {isPko && (
                                            <button type="button" className="fin-btn fin-btn--danger" disabled={!p.alive} onClick={() => startKnockout(p)}>{t("knockedOut")}</button>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <section className="fin-history" aria-label={t("history")}>
                    <div className="fin-history__head">
                        <h3>{t("history")}</h3>
                        {!finance.locked && lastActive && (
                            <button type="button" className="fin-btn" onClick={() => startVoid(lastActive)}>
                                <FontAwesomeIcon icon={faRotateLeft} /> {t("undoLast")}
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <p className="fin-note">{t("nothing")}</p>
                    ) : (
                        <ol>
                            {[...history].reverse().map((o) => (
                                <li key={o.id} className={`fin-op fin-op--${o.status}`}>
                                    <span className="fin-op__text">
                                        {opSummary(o)}
                                        {o.status === "voided" && <em>{t("undone")}</em>}
                                        {o.status === "invalid" && <em>{t("needsReview")}</em>}
                                        {o.correctsId && <em>{t("corrected")}</em>}
                                    </span>
                                    {!finance.locked && o.status === "active" && (
                                        <span className="fin-op__actions">
                                            <button type="button" className="fin-btn fin-btn--small" onClick={() => startCorrect(o)} aria-label={t("editAria", { summary: opSummary(o) })}>
                                                <FontAwesomeIcon icon={faPenToSquare} /> {t("edit")}
                                            </button>
                                            <button type="button" className="fin-btn fin-btn--small" onClick={() => startVoid(o)} aria-label={t("undoAria", { summary: opSummary(o) })}>
                                                <FontAwesomeIcon icon={faRotateLeft} /> {t("undo")}
                                            </button>
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ol>
                    )}
                </section>
            </aside>

            {dialog && (
                <div className="fin-confirm" role="alertdialog" aria-modal="true" aria-labelledby="fin-confirm-title">
                    <div className="fin-confirm__box">
                        <h3 id="fin-confirm-title">{dialogTitle()}</h3>

                        {dialog.kind === "void" && <p>{t("voidText", { summary: opSummary(dialog.op) })}</p>}

                        {isAmountDialog && (
                            <label className="fin-field">
                                {t("amount", { currency })}
                                <input type="text" inputMode="decimal" value={dialog.amountText} disabled={busy}
                                    onChange={(e) => patch({ amountText: e.target.value })} />
                            </label>
                        )}

                        {isKoDialog && (
                            <fieldset className="fin-field" disabled={busy}>
                                <legend>{t("knockedOutByLegend")}</legend>
                                {candidates.length === 0 && <p>{t("noOther")}</p>}
                                {candidates.map((c) => (
                                    <label key={c.id} className="fin-check">
                                        <input type="checkbox" checked={dialog.eliminatorIds.includes(c.id)} onChange={() => toggleEliminator(c.id)} />
                                        <span>{displayPlayerName(c.name, locale)}</span>
                                    </label>
                                ))}
                                {dialog.eliminatorIds.length > 1 && <p className="fin-note">{t("sharedPot")}</p>}
                            </fieldset>
                        )}

                        {dialog.kind === "knockout" && (
                            <p className="fin-note">
                                {t("bountyNote", { amount: money(dialog.player.bountyCents), cash: cfg.pkoCashPercent })}
                            </p>
                        )}

                        {error && <p className="error" role="alert">{error}</p>}

                        <div className="fin-confirm__actions">
                            <button type="button" className="fin-btn" disabled={busy} onClick={() => setDialog(null)}>{t("cancel")}</button>
                            <button type="button" className="fin-btn fin-btn--primary" disabled={busy} onClick={confirm}>
                                {busy ? t("saving") : error ? t("tryAgain") : t("confirm")}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
