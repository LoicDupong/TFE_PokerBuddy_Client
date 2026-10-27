"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import usePresetStore, { usePresetHydrated } from "@/stores/usePresetStore";
import { goToLevel } from "@/utils/timer.utils.js";
import { currencySymbol } from "@/utils/game.utils.js";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import gameService from "@/services/game.service";

// 1st, 2nd, 3rd, 4th… (11th, 12th, 13th compris)
function ordinal(n) {
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
}

export default function PresetForm() {
    // En premier : la sauvegarde doit être relue avant que les effets ci-dessous n'écrivent dans le preset
    const hydrated = usePresetHydrated();
    const { preset, setPreset, resetPreset } = usePresetStore();
    const router = useRouter();
    const [playerError, setPlayerError] = useState(null);

    const normalizeName = (name) =>
        (name || "").trim().replace(/\s+/g, " ").toLowerCase();

    const searchParams = useSearchParams();

    const initialGameId = searchParams.get("gameId");

    // 🔹 Charger une game si on vient de /games/:gameId
    useEffect(() => {
        if (!initialGameId || !hydrated) return;

        (async () => {
            try {
                const data = await gameService.getById(initialGameId);
                if (data?.game) {
                    const g = data.game;
                    // Ceux qui ont refusé ne jouent pas ; les "pending" restent, l'hôte les retire s'ils ne viennent pas
                    const players = (g.playerLinks || [])
                        .filter((p) => p.status !== "refused")
                        .map((p) => ({
                            id: p.id,
                            name: p.user?.username || p.userName || p.guestName,
                            status: p.status,
                        }));
                    const presetData = {
                        gameId: g.id, // ⚡ stocke l'ID de la game dans le preset
                        title: g.name,
                        buyIn: g.buyIn,
                        currency: g.currency || "EUR",
                        chipsPerPlayer: g.chipsPerPlayer || 0,
                        smallBlind: g.smallBlind,
                        bigBlind: g.bigBlind,
                        levelDurationMin: g.levelDuration || 15,
                        enableBlindTimer: g.enableBlindTimer ?? true,
                        allowRebuys: g.allowRebuys || false,
                        payoutDistribution: g.payoutDistribution || [],
                        placesPaid:
                            g.placesPaid || (g.payoutDistribution?.length ?? 0),
                        players,
                        maxPlayers: players.length,
                    };
                    // Repartir d'un preset vide : rien ne doit rester de la partie précédente
                    resetPreset();
                    setPreset(presetData);
                }
            } catch (err) {
                console.error("Error loading game preset:", err);
            }
        })();
    }, [initialGameId, hydrated, setPreset, resetPreset]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setPreset({
            [name]: type === "checkbox" ? checked : value,
            // Nouvelle durée de niveau : le niveau en cours repart sur un niveau complet, en pause
            ...(name === "levelDurationMin" && preset.timer && { timer: goToLevel(preset.timer.level) }),
        });
    };

    // 🔹 Ajouter un joueur
    const handleAddPlayer = () => {
        const updatedPlayers = [
            ...(preset.players || []),
            { id: crypto.randomUUID(), name: "" },
        ];
        setPreset({
            players: updatedPlayers,
            maxPlayers: updatedPlayers.length,
        });
    };

    // 🔹 Supprimer un joueur
    const handleRemovePlayer = (id) => {
        const updatedPlayers = preset.players.filter((p) => p.id !== id);
        setPreset({
            players: updatedPlayers,
            maxPlayers: updatedPlayers.length,
        });
    };

    // 🔹 Modifier un joueur
    const handlePlayerChange = (id, value) => {
        const updatedPlayers = preset.players.map((p) =>
            p.id === id ? { ...p, name: value } : p
        );
        setPreset({
            players: updatedPlayers,
            maxPlayers: updatedPlayers.length,
        });
    };

    // 🔹 Calcul automatique du prizePool
    useEffect(() => {
        if (!hydrated) return;
        const playersCount = preset.players?.length || 0;
        const buyIn = Number(preset.buyIn) || 0;
        setPreset({
            prizePool: playersCount * buyIn,
        });
    }, [hydrated, preset.players, preset.buyIn, setPreset]);

    // 🔹 Ajuster payoutDistribution si placesPaid change
    const handlePlacesPaidChange = (e) => {
        const value = Number(e.target.value) || 0;
        const newDist = Array.from({ length: value }, (_, i) => ({
            place: i + 1,
            percent: Math.floor(100 / value), // réparti équitablement
        }));
        setPreset({
            placesPaid: value,
            payoutDistribution: newDist,
        });
    };

    // 🔹 Modifier un pourcentage
    const handlePercentChange = (index, value) => {
        const updated = preset.payoutDistribution.map((p, i) =>
            i === index ? { ...p, percent: Number(value) } : p
        );
        setPreset({ payoutDistribution: updated });
    };

    const totalPercent = (preset.payoutDistribution || []).reduce(
        (sum, p) => sum + (Number(p.percent) || 0),
        0
    );

    const handleSubmit = (e) => {
        e.preventDefault();

        const filteredPlayers = (preset.players || []).filter(
            (p) => p.name?.trim() !== ""
        );

        const names = filteredPlayers.map((p) => normalizeName(p.name));
        const hasDuplicates = names.some((n, i) => names.indexOf(n) !== i);
        if (hasDuplicates) {
            setPlayerError("Two or more players have the same name. Please use unique names.");
            return;
        }

        // Ex : 3 places → 33/33/33 = 99 % ; les gains ne correspondraient pas au prize pool
        if ((preset.payoutDistribution || []).length > 0 && totalPercent !== 100) {
            setPlayerError(`Prize distribution must total 100% (currently ${totalPercent}%).`);
            return;
        }

        setPlayerError(null);
        setPreset({ players: filteredPlayers });
        router.push("/manager");
    };

    if (!hydrated) return <p>Loading…</p>;

    return (
        <form className="form form--preset" onSubmit={handleSubmit}>
            <h2>
                Game <span className="red">setup</span>
            </h2>

            {/* Preset encore lié à une partie (ex: retour via "Edit" depuis le manager) */}
            {preset.gameId && !initialGameId && (
                <div className="form__row">
                    <p className="gray">
                        Linked to the game <strong>{preset.title}</strong>: results will be saved to it.
                    </p>
                    <button type="button" className="btn btn--small" onClick={resetPreset}>
                        Start a free session instead
                    </button>
                </div>
            )}

            {/* Title */}
            <div className="form__row">
                <label htmlFor="title">Title</label>
                <input id="title"
                    name="title"
                    value={preset.title}
                    onChange={handleChange}
                    placeholder="Friday Night Poker"
                />
            </div>

            {/* Buy-in & Chips */}
            <div className="form__grid">
                <div className="form__row">
                    <label htmlFor="buyIn">Buy-in</label>
                    <input id="buyIn"
                        type="number"
                        name="buyIn"
                        value={preset.buyIn}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label htmlFor="chipsPerPlayer">Chips per player</label>
                    <input id="chipsPerPlayer"
                        type="number"
                        name="chipsPerPlayer"
                        value={preset.chipsPerPlayer || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Blinds */}
            <fieldset className="form__fieldset">
                <legend>Blinds</legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label htmlFor="smallBlind">Small blind</label>
                        <input id="smallBlind"
                            type="number"
                            name="smallBlind"
                            value={preset.smallBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="bigBlind">Big blind</label>
                        <input id="bigBlind"
                            type="number"
                            name="bigBlind"
                            value={preset.bigBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="levelDurationMin">Level duration (min)</label>
                        <input id="levelDurationMin"
                            type="number"
                            name="levelDurationMin"
                            value={preset.levelDurationMin}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <label className="form__checkbox">
                    <input
                        type="checkbox"
                        name="enableBlindTimer"
                        checked={preset.enableBlindTimer}
                        onChange={handleChange}
                    />
                    <span>Enable blind timer</span>
                </label>
            </fieldset>


            {/* Players */}
            <fieldset className="form__fieldset">
                <legend>Players</legend>
                {(preset.players || []).map((player) => (
                    <div key={player.id} className="form__row form__addPlayer">
                        <input
                            type="text"
                            aria-label="Player name"
                            placeholder="Player name"
                            value={player.name}
                            onChange={(e) =>
                                handlePlayerChange(player.id, e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="btn btn--small btn-add"
                            aria-label={`Remove ${player.name || "player"}`}
                            onClick={() => handleRemovePlayer(player.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        {player.status === "pending" && (
                            <span
                                className="player__status player__status--pending"
                                title="No answer to the invite yet — remove if absent"
                            >
                                pending
                            </span>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="btn btn--addPlayer"
                    onClick={handleAddPlayer}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add player
                </button>
                <div className="form__row">
                    <label htmlFor="playersNumber">Players</label>
                    <input
                        id="playersNumber"
                        type="number"
                        value={preset.players?.length || 0}
                        readOnly
                    />
                </div>

                <label className="form__checkbox">
                    <input
                        type="checkbox"
                        name="allowRebuys"
                        checked={preset.allowRebuys}
                        onChange={handleChange}
                    />
                    <span>Allow rebuys</span>
                </label>
            </fieldset>

            {/* Payout */}
            <fieldset className="form__fieldset">
                <legend>Prize distribution</legend>
                <div className="form__row" style={{ marginBottom: "2rem" }}>
                    <label htmlFor="placesPaid">Places paid</label>
                    <input id="placesPaid"
                        type="number"
                        name="placesPaid"
                        value={preset.placesPaid || ""}
                        onChange={handlePlacesPaidChange}
                    />
                </div>

                {(preset.payoutDistribution || []).map((p, i) => (
                    <div key={i} className="form__grid">
                        <div className="form__row">
                            <label htmlFor={`payout-${i}`}>
                                {ordinal(p.place)} place{" "}
                                <small>
                                    {" "}
                                    ({p.percent}% →{" "}
                                    {(
                                        ((preset.prizePool || 0) * p.percent) /
                                        100
                                    ).toFixed(1)}{" "}
                                    {currencySymbol(preset.currency)})
                                </small>
                            </label>

                            <input
                                id={`payout-${i}`}
                                type="number"
                                value={p.percent}
                                onChange={(e) =>
                                    handlePercentChange(i, e.target.value)
                                }
                            />
                        </div>
                    </div>
                ))}

                <p
                    style={{
                        color: totalPercent === 100 ? "#22c55e" : "var(--secondary-color-text)",
                        fontWeight: "bold",
                    }}
                >
                    Total: {totalPercent}% (must equal 100%)
                </p>

                {/* Prize Pool (auto) */}
                <div className="form__row">
                    <label htmlFor="prizePool">Prize pool</label>
                    <input id="prizePool" type="number" value={preset.prizePool || 0} readOnly />
                </div>
            </fieldset>


            {playerError && <p className="error">{playerError}</p>}

            <button className="btn btn--full" type="submit">
                Start Game Manager
            </button>
        </form>
    );
}
