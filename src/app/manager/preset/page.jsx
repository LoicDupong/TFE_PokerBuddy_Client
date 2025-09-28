"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import usePresetStore from "@/stores/usePresetStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import gameService from "@/services/game.service";

export default function PresetForm() {
    const { preset, setPreset } = usePresetStore();
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialGameId = searchParams.get("gameId");

    // 🔹 Charger une game si on vient de /games/:gameId
    useEffect(() => {
        if (!initialGameId) return;

        (async () => {
            try {
                const data = await gameService.getById(initialGameId);
                if (data?.game) {
                    const g = data.game;
                    const presetData = {
                        gameId: g.id, // ⚡ stocke l'ID de la game dans le preset
                        title: g.name,
                        buyIn: g.buyIn,
                        chipsPerPlayer: g.chipsPerPlayer || 0,
                        smallBlind: g.smallBlind,
                        bigBlind: g.bigBlind,
                        levelDurationMin: g.levelDurationMin || 15,
                        enableBlindTimer: g.enableBlindTimer ?? true,
                        allowRebuys: g.allowRebuys || false,
                        payoutDistribution: g.payoutDistribution || [],
                        placesPaid:
                            g.placesPaid || (g.payoutDistribution?.length ?? 0),
                        players:
                            g.playerLinks?.map((p) => ({
                                id: p.id,
                                name: p.userName || p.guestName,
                            })) || [],
                        maxPlayers: g.playerLinks?.length || 0,
                    };
                    setPreset(presetData);
                }
            } catch (err) {
                console.error("Error loading game preset:", err);
            }
        })();
    }, [initialGameId, setPreset]);

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setPreset({
            [name]: type === "checkbox" ? checked : value,
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
        const playersCount = preset.players?.length || 0;
        const buyIn = Number(preset.buyIn) || 0;
        setPreset({
            prizePool: playersCount * buyIn,
        });
    }, [preset.players, preset.buyIn, setPreset]);

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
        setPreset({
            players: (preset.players || []).filter(
                (p) => p.name.trim() !== ""
            ),
        });
        console.log("Preset ready:", preset);
        router.push("/manager");
    };

    return (
        <form className="form form--preset" onSubmit={handleSubmit}>
            <h2>
                Game <span className="red">Preset</span>
            </h2>

            {/* Title */}
            <div className="form__row">
                <label>Title</label>
                <input
                    name="title"
                    value={preset.title}
                    onChange={handleChange}
                    placeholder="Friday Night Poker"
                />
            </div>

            {/* Buy-in & Chips */}
            <div className="form__grid">
                <div className="form__row">
                    <label>Buy-in</label>
                    <input
                        type="number"
                        name="buyIn"
                        value={preset.buyIn}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label>Chips / Player</label>
                    <input
                        type="number"
                        name="chipsPerPlayer"
                        value={preset.chipsPerPlayer || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Prize Pool (auto) */}
            <div className="form__row">
                <label>Prize Pool</label>
                <input type="number" value={preset.prizePool || 0} readOnly />
            </div>

            {/* Blinds */}
            <fieldset className="form__fieldset">
                <legend>Blinds</legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label>Small Blind</label>
                        <input
                            type="number"
                            name="smallBlind"
                            value={preset.smallBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label>Big Blind</label>
                        <input
                            type="number"
                            name="bigBlind"
                            value={preset.bigBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label>Level Duration (min)</label>
                        <input
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

            {/* Options */}
            <fieldset className="form__fieldset">
                <legend>Options</legend>
                <div className="form__row">
                    <label>Max Players</label>
                    <input
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
                <legend>Prize Distribution</legend>
                <div className="form__row" style={{ marginBottom: "2rem" }}>
                    <label>Places Paid</label>
                    <input
                        type="number"
                        name="placesPaid"
                        value={preset.placesPaid || ""}
                        onChange={handlePlacesPaidChange}
                    />
                </div>

                {(preset.payoutDistribution || []).map((p, i) => (
                    <div key={i} className="form__grid">
                        <div className="form__row">
                            <label>
                                {p.place}ᵉ place{" "}
                                <small>
                                    {" "}
                                    ({p.percent}% →{" "}
                                    {(
                                        ((preset.prizePool || 0) * p.percent) /
                                        100
                                    ).toFixed(1)}{" "}
                                    €)
                                </small>
                            </label>

                            <input
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
                        color: totalPercent === 100 ? "green" : "red",
                        fontWeight: "bold",
                    }}
                >
                    Total: {totalPercent}% (must equal 100%)
                </p>
            </fieldset>

            {/* Players */}
            <fieldset className="form__fieldset">
                <legend>Players</legend>
                {(preset.players || []).map((player) => (
                    <div key={player.id} className="form__row">
                        <input
                            type="text"
                            placeholder="Player name"
                            value={player.name}
                            onChange={(e) =>
                                handlePlayerChange(player.id, e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="btn btn--small"
                            onClick={() => handleRemovePlayer(player.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                    </div>
                ))}
                <button
                    type="button"
                    className="btn btn--small"
                    onClick={handleAddPlayer}
                >
                    <FontAwesomeIcon icon={faPlus} /> Add Player
                </button>
            </fieldset>

            <button className="btn btn--full" type="submit">
                Use Preset
            </button>
        </form>
    );
}
