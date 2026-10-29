"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faRotateLeft, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import gameFinanceService from "@/services/gameFinance.service";
import { displayPlayerName } from "@/utils/game.utils.js";
import { centsToInput, formatCents, parseAmountToCents } from "@/utils/money.utils.js";

const TYPE_LABEL = { rebuy: "Rebuy", addon: "Add-on", knockout: "Knockout", buyin: "Buy-in" };

// Panneau « Players » de l'hôte : argent de chaque joueur et actions rebuy / add-on / knockout.
// Toute action d'argent passe par une confirmation ; l'opId est créé une fois par action et
// réutilisé tel quel si on renvoie la même requête (double clic, réseau coupé).
export default function FinancePanel({ finance, gameId, currency, chips, onFinance, onClose }) {
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

    const money = (cents) => formatCents(cents, currency);
    const cfg = finance.config;
    const isPko = cfg.pkoEnabled;
    const players = finance.players;
    const byId = useMemo(() => new Map(players.map((p) => [p.id, p])), [players]);
    const name = (id) => displayPlayerName(byId.get(id)?.name ?? "Player");
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
            if (cents === null) return { invalid: "Enter a valid amount, for example 20 or 12,50." };
            if (d.kind === "correct") {
                if (cents === d.op.amountCents) return { invalid: "The amount is unchanged." };
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
            if (d.eliminatorIds.length === 0) return { invalid: "Pick who knocked them out." };
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
                ? shares.map((s) => displayPlayerName(s.name)).join(" + ")
                : (o.eliminatorIds ?? []).map(name).join(" + ");
            const cash = shares.reduce((s, x) => s + x.cashCents, 0);
            return `${displayPlayerName(o.playerName)} knocked out by ${who}${o.status === "active" ? ` (${money(cash)} paid at once)` : ""}`;
        }
        return `${TYPE_LABEL[o.type]} · ${displayPlayerName(o.playerName)} · ${money(o.amountCents)}`;
    };

    const dialogTitle = () => {
        if (dialog.kind === "void") return "Undo this action?";
        if (dialog.kind === "correct") return `Correct this ${TYPE_LABEL[dialog.op.type].toLowerCase()}`;
        if (dialog.kind === "knockout") return `${displayPlayerName(dialog.player.name)} is knocked out`;
        return `${TYPE_LABEL[dialog.kind]} for ${displayPlayerName(dialog.player.name)}`;
    };

    const isKoDialog = dialog && (dialog.kind === "knockout" || (dialog.kind === "correct" && dialog.op.type === "knockout"));
    const isAmountDialog = dialog && (dialog.kind === "rebuy" || dialog.kind === "addon" || (dialog.kind === "correct" && dialog.op.type !== "knockout"));

    return (
        <div className="fin-panel" role="dialog" aria-modal="true" aria-labelledby="fin-panel-title">
            <div className="fin-panel__overlay" onClick={onClose} />
            <aside className="fin-panel__sheet">
                <header className="fin-panel__head">
                    <h2 id="fin-panel-title">Players</h2>
                    <button ref={closeRef} type="button" className="fin-panel__close" onClick={onClose} aria-label="Close the players panel">
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </header>

                <dl className="fin-totals">
                    <div><dt>Total in</dt><dd>{money(finance.totals.investedCents)}</dd></div>
                    <div><dt>Prize pool</dt><dd>{money(finance.totals.prizePoolCents)}</dd></div>
                    {isPko && <div><dt>Bounties in play</dt><dd>{money(finance.totals.bountiesOnTableCents)}</dd></div>}
                    {isPko && <div><dt>Paid at once</dt><dd>{money(finance.totals.bountiesPaidCents)}</dd></div>}
                    <div><dt>Rebuys</dt><dd>{finance.totals.rebuyCount} · {money(finance.totals.rebuyCents)}</dd></div>
                    <div><dt>Add-ons</dt><dd>{finance.totals.addOnCount} · {money(finance.totals.addOnCents)}</dd></div>
                </dl>

                {finance.locked && <p className="fin-note">Results are saved: nothing can be changed anymore.</p>}
                {!cfg.allowRebuys && !isPko && (
                    <p className="fin-note">Rebuys and add-ons are off for this game. Turn them on in the game settings to use them.</p>
                )}

                <ul className="fin-players">
                    {players.map((p) => {
                        const canRebuy = cfg.allowRebuys && (!isPko || p.eliminated);
                        const canAddOn = cfg.allowRebuys && (!isPko || p.alive);
                        return (
                            <li key={p.id} className={`fin-player${isPko && !p.alive ? " fin-player--out" : ""}`}>
                                <div className="fin-player__top">
                                    <strong className="fin-player__name">{displayPlayerName(p.name)}</strong>
                                    {isPko && (
                                        <span className={`fin-badge${p.alive ? " fin-badge--in" : ""}`}>{p.alive ? "In" : "Out"}</span>
                                    )}
                                    <span className="fin-player__total">{money(p.investedCents)}</span>
                                </div>
                                <p className="fin-player__line">
                                    Buy-in {money(p.buyInCents)} · {p.rebuyCount} rebuy{p.rebuyCount === 1 ? "" : "s"} ({money(p.rebuyCents)})
                                    {p.addOnCount > 0 && <> · {p.addOnCount} add-on{p.addOnCount === 1 ? "" : "s"} ({money(p.addOnCents)})</>}
                                    {isPko && <> · Bounty {money(p.bountyCents)}</>}
                                </p>
                                {!finance.locked && (
                                    <div className="fin-player__actions">
                                        {cfg.allowRebuys && (
                                            <button type="button" className="fin-btn" disabled={!canRebuy} onClick={() => startEntry("rebuy", p)}
                                                title={!canRebuy ? "Record the knockout first" : undefined}>Rebuy</button>
                                        )}
                                        {cfg.allowRebuys && (
                                            <button type="button" className="fin-btn" disabled={!canAddOn} onClick={() => startEntry("addon", p)}>Add-on</button>
                                        )}
                                        {isPko && (
                                            <button type="button" className="fin-btn fin-btn--danger" disabled={!p.alive} onClick={() => startKnockout(p)}>Knocked out</button>
                                        )}
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ul>

                <section className="fin-history" aria-label="History">
                    <div className="fin-history__head">
                        <h3>History</h3>
                        {!finance.locked && lastActive && (
                            <button type="button" className="fin-btn" onClick={() => startVoid(lastActive)}>
                                <FontAwesomeIcon icon={faRotateLeft} /> Undo last action
                            </button>
                        )}
                    </div>
                    {history.length === 0 ? (
                        <p className="fin-note">Nothing recorded yet.</p>
                    ) : (
                        <ol>
                            {[...history].reverse().map((o) => (
                                <li key={o.id} className={`fin-op fin-op--${o.status}`}>
                                    <span className="fin-op__text">
                                        {opSummary(o)}
                                        {o.status === "voided" && <em> — undone</em>}
                                        {o.status === "invalid" && <em> — needs review</em>}
                                        {o.correctsId && <em> — corrected</em>}
                                    </span>
                                    {!finance.locked && o.status === "active" && (
                                        <span className="fin-op__actions">
                                            <button type="button" className="fin-btn fin-btn--small" onClick={() => startCorrect(o)} aria-label={`Edit: ${opSummary(o)}`}>
                                                <FontAwesomeIcon icon={faPenToSquare} /> Edit
                                            </button>
                                            <button type="button" className="fin-btn fin-btn--small" onClick={() => startVoid(o)} aria-label={`Undo: ${opSummary(o)}`}>
                                                <FontAwesomeIcon icon={faRotateLeft} /> Undo
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

                        {dialog.kind === "void" && <p>{opSummary(dialog.op)}. Everything after it is recalculated.</p>}

                        {isAmountDialog && (
                            <label className="fin-field">
                                Amount ({currency})
                                <input type="text" inputMode="decimal" value={dialog.amountText} disabled={busy}
                                    onChange={(e) => patch({ amountText: e.target.value })} />
                            </label>
                        )}

                        {isKoDialog && (
                            <fieldset className="fin-field" disabled={busy}>
                                <legend>Knocked out by</legend>
                                {candidates.length === 0 && <p>No other player is still in.</p>}
                                {candidates.map((c) => (
                                    <label key={c.id} className="fin-check">
                                        <input type="checkbox" checked={dialog.eliminatorIds.includes(c.id)} onChange={() => toggleEliminator(c.id)} />
                                        <span>{displayPlayerName(c.name)}</span>
                                    </label>
                                ))}
                                {dialog.eliminatorIds.length > 1 && <p className="fin-note">Shared pot: the bounty is split equally.</p>}
                            </fieldset>
                        )}

                        {dialog.kind === "knockout" && (
                            <p className="fin-note">
                                Bounty {money(dialog.player.bountyCents)}: {cfg.pkoCashPercent}% paid at once, the rest goes on the knocker&apos;s head.
                            </p>
                        )}

                        {error && <p className="error" role="alert">{error}</p>}

                        <div className="fin-confirm__actions">
                            <button type="button" className="fin-btn" disabled={busy} onClick={() => setDialog(null)}>Cancel</button>
                            <button type="button" className="fin-btn fin-btn--primary" disabled={busy} onClick={confirm}>
                                {busy ? "Saving…" : error ? "Try again" : "Confirm"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
