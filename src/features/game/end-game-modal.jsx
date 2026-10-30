"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation.js";
import gameResultsService from "@/services/gameResults.service";
import usePresetStore from "@/stores/usePresetStore";
import { toDatetimeLocalValue } from "@/utils/date.utils.js";
import { currencySymbol, displayPlayerName } from "@/utils/game.utils.js";
import gameFinanceService from "@/services/gameFinance.service";
import { centsToInput, formatCents, parseAmountToCents, splitByPercents } from "@/utils/money.utils.js";
import FinanceRecap from "@/features/game/finance-recap.jsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faGripLines, faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import {
    DragDropContext,
    Droppable,
    Draggable,
} from "@hello-pangea/dnd";

export default function EndGameModal({
    gameId,
    players,
    payoutDistribution = [{ place: 1, percent: 100 }], // ex: [{place:1,percent:70},{place:2,percent:20},{place:3,percent:10}]
    buyIn = 0,
    currency = "EUR",
    onClose,
}) {
    const router = useRouter();
    const resetPreset = usePresetStore((state) => state.resetPreset);
    const setPreset = usePresetStore((state) => state.setPreset);
    const resultsDraft = usePresetStore((state) => state.preset.resultsDraft);
    // Valeur brute de l'input (heure locale) ; convertie en ISO seulement à l'envoi
    const [finishedAt, setFinishedAt] = useState(() => toDatetimeLocalValue(new Date()));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    // Étapes : "edit" (classement) → "recap" (vérification) → "done" (résultats enregistrés)
    const [step, setStep] = useState("edit");
    // Copie du classement gardée après la sauvegarde : resetPreset() vide les joueurs du preset
    const [saved, setSaved] = useState(null);
    const focusAfterMove = useRef(null);
    const symbol = currencySymbol(currency);

    // Recap financier du serveur (partie liee suivie) : prize pool reel, classement suggere
    const [financeState, setFinanceState] = useState({ loading: Boolean(gameId), finance: null });
    useEffect(() => {
        if (!gameId) return;
        let cancelled = false;
        gameFinanceService.get(gameId).then((res) => {
            if (!cancelled) setFinanceState({ loading: false, finance: res.success ? res.data.finance : null });
        });
        return () => {
            cancelled = true;
        };
    }, [gameId]);
    const finance = financeState.finance;
    const tracked = Boolean(finance?.tracked);
    const poolCents = tracked ? finance.totals.prizePoolCents : 0;
    const money = (cents) => formatCents(cents, currency);

    // Ancien flux (partie jamais suivie) : unites entieres, comme avant
    const prizePool = tracked ? poolCents / 100 : buyIn * (players?.length || 0);

    // Joueurs du classement : ceux qui ont paye (en PKO, du dernier elimine au premier d'abord)
    const rankedPlayers = useMemo(() => {
        if (!tracked) {
            return players.map((p) => ({ gamePlayerId: p.id, name: displayPlayerName(p.user ? p.user.username : p.name) }));
        }
        const byId = new Map(finance.players.map((p) => [p.id, p]));
        const presetOrder = players.map((p) => p.id).filter((id) => byId.has(id));
        const order = finance.config.pkoEnabled && finance.suggestedOrder?.length ? finance.suggestedOrder : presetOrder;
        const ids = [...order.filter((id) => byId.has(id)), ...finance.players.map((p) => p.id).filter((id) => !order.includes(id))];
        return ids.map((id) => ({ gamePlayerId: id, name: byId.get(id).name }));
    }, [tracked, finance, players]);

    // Prizes proposes selon la repartition (centimes repartis comme le serveur le fait)
    const withPrizes = (list) => {
        const percents = list.map((_, idx) => payoutDistribution.find((d) => d.place === idx + 1)?.percent ?? 0);
        if (tracked) {
            const shares = splitByPercents(poolCents, percents);
            return list.map((player, idx) => ({ ...player, prize: centsToInput(shares[idx]) }));
        }
        return list.map((player, idx) => ({ ...player, prize: Math.round((prizePool * percents[idx]) / 100) }));
    };

    // 🔹 Pré-remplissage des prizes
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const prefilled = useMemo(() => withPrizes(rankedPlayers), [rankedPlayers, payoutDistribution, prizePool, tracked]);

    // Classement en cours gardé dans le preset (localStorage) : fermer la modale ou recharger
    // la page ne le remet plus à zéro. Il repart du pré-remplissage si les joueurs, le buy-in
    // ou la répartition changent entre-temps.
    const draftKey = JSON.stringify([prefilled.map((r) => [r.gamePlayerId, r.name]).sort(), tracked, prizePool, payoutDistribution]);
    const results = resultsDraft?.key === draftKey ? resultsDraft.results : prefilled;
    const setResults = (next) => setPreset({ resultsDraft: { key: draftKey, results: next } });

    // Déplace un joueur et recalcule les prizes selon le nouveau classement
    // (partagé par le drag & drop et les boutons haut/bas)
    const moveResult = (from, to) => {
        const reordered = Array.from(results);
        const [moved] = reordered.splice(from, 1);
        reordered.splice(to, 0, moved);

        // 🔹 Recalcul des prizes en fonction du nouveau classement
        setResults(withPrizes(reordered));
    };

    // Gestion drag & drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;
        moveResult(result.source.index, result.destination.index);
    };

    // Boutons haut/bas (accessibles au clavier)
    const handleMove = (index, direction) => {
        const target = index + direction;
        if (target < 0 || target >= results.length) return;
        focusAfterMove.current = { id: results[index].gamePlayerId, direction };
        moveResult(index, target);
    };

    // Déplacer le nœud DOM fait perdre le focus : on le rend au bouton qui vient d'être utilisé
    useEffect(() => {
        const target = focusAfterMove.current;
        if (!target) return;
        focusAfterMove.current = null;
        const row = document.querySelector(`[data-row-id="${CSS.escape(String(target.id))}"]`);
        const preferred = row?.querySelector(`[data-direction="${target.direction}"]:not(:disabled)`);
        (preferred ?? row?.querySelector(".results-move button:not(:disabled)"))?.focus();
    }, [results]);

    // Modifier un prize manuellement
    const handlePrizeChange = (index, value) => {
        setResults(results.map((r, i) => (i === index ? { ...r, prize: tracked ? value : Number(value) } : r)));
    };

    // Suivi : tout en centimes, la somme doit etre exactement le prize pool
    const prizeCentsList = results.map((r) => parseAmountToCents(r.prize === "" ? "0" : r.prize));
    const hasInvalidPrize = tracked && prizeCentsList.some((v) => v === null);
    const totalCents = prizeCentsList.reduce((sum, v) => sum + (v ?? 0), 0);
    const leftCents = poolCents - totalCents;
    const totalPrizes = tracked ? totalCents / 100 : results.reduce((sum, r) => sum + (Number(r.prize) || 0), 0);
    const matches = tracked ? !hasInvalidPrize && leftCents === 0 : totalPrizes === prizePool;
    const amount = (value) => (tracked ? money(Math.round(Number(value) * 100)) : `${Number(value) || 0} ${symbol}`);
    const prizeAmount = (r) => (tracked ? money(parseAmountToCents(r.prize === "" ? "0" : r.prize) ?? 0) : amount(r.prize));
    const leftText = hasInvalidPrize
        ? "Check the prize amounts: use numbers such as 12 or 12,50."
        : leftCents > 0
            ? `${money(leftCents)} left to distribute`
            : `${money(-leftCents)} too much distributed`;
    // En PKO, chaque joueur encore en jeu garde sa bounty : l'hote doit le savoir avant d'enregistrer
    const aliveCount = finance?.totals?.aliveCount ?? 0;
    const multipleAlive = tracked && finance.config.pkoEnabled && aliveCount > 1;

    const normalizeName = (name) =>
        (name || "").trim().replace(/\s+/g, " ").toLowerCase();

    // Étape classement → récapitulatif : les vérifications se font avant d'afficher le récap
    const handleReview = (e) => {
        e.preventDefault();

        if (!gameId) {
            setError(["No game linked to this session. Use the 'Use Preset' button from a game page."]);
            return;
        }

        if (tracked && !matches) {
            setError([leftText]);
            return;
        }

        const names = results.map((r) => normalizeName(r.name));
        const hasDuplicates = names.some((n, i) => names.indexOf(n) !== i);
        if (hasDuplicates) {
            setError(["Two or more players have the same name. Please fix duplicate names before saving."]);
            return;
        }

        const finishedDate = new Date(finishedAt);
        if (!finishedAt || Number.isNaN(finishedDate.getTime())) {
            setError(["Please set a valid end time."]);
            return;
        }

        setError(null);
        setStep("recap");
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);

        // L'ordre du tableau = le classement. Partie suivie : centimes ; sinon ancien format en unites.
        const payload = results.map((player, index) =>
            tracked
                ? { gamePlayerId: player.gamePlayerId, prizeCents: prizeCentsList[index] ?? 0 }
                : {
                    gamePlayerId: player.gamePlayerId,
                    rank: index + 1,
                    prize: parseInt(player.prize, 10) || 0,
                    guestName: player.name, // used by backend to create walk-in GamePlayer if ID is unknown
                }
        );

        const res = await gameResultsService.createResults(
            gameId,
            payload,
            new Date(finishedAt).toISOString()
        );

        if (res.success) {
            // Copie pour l'écran de résultats, avant de vider le preset
            setSaved({ results, prizePool, recap: res.data?.finance?.recap ?? null });
            // La partie est close : le preset ne doit plus pointer dessus
            resetPreset();
            setStep("done");
        } else {
            setError(res.errorMessage);
        }

        setLoading(false);
    };

    // Pas de onClose() ici : fermer la modale (preset vidé) ferait rediriger le manager vers
    // /manager/preset avant que la navigation vers l'accueil n'aboutisse
    const backToHome = () => {
        router.push("/");
    };

    // Une fois les résultats enregistrés, il n'y a plus rien à éditer : fermer = retour à l'accueil
    const closeModal = step === "done" ? backToHome : onClose;

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={closeModal} />
            <div className="modal__content" role="dialog" aria-modal="true" aria-labelledby="end-game-title">
                <button type="button" onClick={closeModal} className="modal__close" aria-label="Close">
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <h2 className="modal__title" id="end-game-title">
                    {step === "done" ? "Results saved" : step === "recap" ? "Check the results" : "End Game"}
                </h2>

                {step === "done" && saved && (
                    <div className="results-summary">
                        <p className="results-summary__winner">
                            Winner: <strong>{displayPlayerName(saved.results[0]?.name)}</strong>
                        </p>
                        {saved.recap && <FinanceRecap recap={saved.recap} currency={currency} />}
                        {!saved.recap && <ol className="results-recap">
                            {saved.results
                                .map((r, i) => ({ ...r, rank: i + 1 }))
                                .filter((r) => r.rank === 1 || Number(r.prize) > 0)
                                .map((r) => (
                                    <li key={r.gamePlayerId}>
                                        <span className="results-recap__rank">#{r.rank}</span>
                                        <span className="results-recap__name">{displayPlayerName(r.name)}</span>
                                        <span>{amount(r.prize)}</span>
                                    </li>
                                ))}
                        </ol>}
                        <button type="button" className="btn btn--primary" onClick={backToHome}>
                            Back to home
                        </button>
                    </div>
                )}

                {step === "recap" && (
                    <div className="results-summary">
                        <p>Finished at {finishedAt.replace("T", " ")}</p>
                        <ol className="results-recap">
                            {results.map((r, i) => (
                                <li key={r.gamePlayerId}>
                                    <span className="results-recap__rank">#{i + 1}</span>
                                    <span className="results-recap__name">{displayPlayerName(r.name)}</span>
                                    <span>{prizeAmount(r)}</span>
                                </li>
                            ))}
                        </ol>
                        <p className={`results-total${matches ? "" : " is-warning"}`}>
                            Distributed {amount(totalPrizes)} of {amount(prizePool)}
                            {matches ? "" : " (does not match the prize pool)"}
                        </p>
                        {multipleAlive && (
                            <p className="results-total is-warning">
                                {aliveCount} players are still in: each keeps their own remaining bounty.
                            </p>
                        )}
                        {error && <p className="error">{error}</p>}
                        <div className="results-actions">
                            <button
                                type="button"
                                className="btn btn--control"
                                disabled={loading}
                                onClick={() => setStep("edit")}
                            >
                                Back
                            </button>
                            <button
                                type="button"
                                className="btn btn--primary"
                                disabled={loading}
                                onClick={handleSave}
                            >
                                {loading ? "Saving..." : "Confirm and save"}
                            </button>
                        </div>
                    </div>
                )}

                {step === "edit" && (
                    <form onSubmit={handleReview} className="modal__form">
                        <label>
                            Finished At:
                            <input
                                type="datetime-local"
                                value={finishedAt}
                                onChange={(e) => setFinishedAt(e.target.value)}
                            />
                        </label>

                        {financeState.loading && <p className="results-total">Loading the game finances…</p>}
                        <p className="results-total">
                            Prize Pool: {amount(prizePool)} — Distributed:{" "}
                            <span className={matches ? "" : "is-warning"}>{amount(totalPrizes)}</span>
                        </p>
                        {tracked && !matches && <p className="results-total is-warning" role="status">{leftText}</p>}
                        {tracked && finance.totals.prizePoolCents !== finance.totals.investedCents && (
                            <p className="gray">Bounties are paid on top by the app: only the prize pool is split here.</p>
                        )}
                        {multipleAlive && (
                            <p className="results-total is-warning">
                                {aliveCount} players are still in. Record the remaining knockouts first, or each keeps their own bounty.
                            </p>
                        )}

                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId="players">
                                {(provided) => (
                                    <div
                                        className="results-list"
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {results.map((player, index) => (
                                            <Draggable
                                                key={player.gamePlayerId}
                                                draggableId={player.gamePlayerId}
                                                index={index}
                                            >
                                                {(provided) => (
                                                    <div
                                                        className="results-row"
                                                        data-row-id={player.gamePlayerId}
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                    >
                                                        <span
                                                            className="drag-handle"
                                                            {...provided.dragHandleProps}
                                                        >
                                                            <FontAwesomeIcon icon={faGripLines} />
                                                        </span>
                                                        <span className="results-rank">#{index + 1}</span>
                                                        <span className="player-name">{displayPlayerName(player.name)}</span>
                                                        <span className="results-move">
                                                            <button
                                                                type="button"
                                                                data-direction="-1"
                                                                aria-label={`Move ${player.name} up`}
                                                                disabled={index === 0}
                                                                onClick={() => handleMove(index, -1)}
                                                            >
                                                                <FontAwesomeIcon icon={faChevronUp} />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                data-direction="1"
                                                                aria-label={`Move ${player.name} down`}
                                                                disabled={index === results.length - 1}
                                                                onClick={() => handleMove(index, 1)}
                                                            >
                                                                <FontAwesomeIcon icon={faChevronDown} />
                                                            </button>
                                                        </span>
                                                        <span className="results-prize">
                                                            <input
                                                                {...(tracked ? { type: "text", inputMode: "decimal" } : { type: "number" })}
                                                                placeholder="Prize"
                                                                aria-label={`Prize for ${player.name}`}
                                                                value={player.prize}
                                                                onChange={(e) =>
                                                                    handlePrizeChange(
                                                                        index,
                                                                        e.target.value
                                                                    )
                                                                }
                                                            />
                                                            <span aria-hidden="true">{symbol}</span>
                                                        </span>
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>

                        {error && <p className="error">{error}</p>}
                        <button type="submit" className="btn btn--primary" disabled={financeState.loading || (tracked && !matches)}>
                            Review results
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
