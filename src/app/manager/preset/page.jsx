"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrash } from "@fortawesome/free-solid-svg-icons";
import usePresetStore, { usePresetHydrated } from "@/stores/usePresetStore";
import { goToLevel } from "@/utils/timer.utils.js";
import { currencySymbol, displayPlayerName } from "@/utils/game.utils.js";
import gameFinanceService from "@/services/gameFinance.service";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import gameService from "@/services/game.service";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        loading: "Loading…",
        linked: (p) => `Linked to the game ${p.title}: results will be saved to it.`,
        freeSession: "Start a free session instead",
        title: "Title",
        titlePlaceholder: "Friday Night Poker",
        buyIn: "Buy-in",
        chips: "Chips per player",
        blinds: "Blinds",
        smallBlind: "Small blind",
        bigBlind: "Big blind",
        levelDuration: "Level duration (min)",
        enableTimer: "Enable blind timer",
        players: "Players",
        playerName: "Player name",
        remove: (p) => `Remove ${p.name}`,
        removeFallback: "player",
        pending: "pending",
        pendingTitle: "No answer to the invite yet — remove if absent",
        addPlayer: "Add player",
        allowRebuys: "Allow rebuys and add-ons",
        prizeDistribution: "Prize distribution",
        placesPaid: "Places paid",
        placeLabel: (p) => `${p.ordinal} place`,
        total: (p) => `Total: ${p.total}% (must equal 100%)`,
        prizePool: "Prize pool",
        duplicateNames: "Two or more players have the same name. Please use unique names.",
        mustTotal100: (p) => `Prize distribution must total 100% (currently ${p.total}%).`,
        seating: "Seating players…",
        start: "Start Game Manager",
        seatError: "Could not seat the players, please try again.",
    },
    fr: {
        loading: "Chargement…",
        linked: (p) => `Liée à la partie ${p.title} : les résultats y seront enregistrés.`,
        freeSession: "Lancer plutôt une session libre",
        title: "Titre",
        titlePlaceholder: "Poker du vendredi soir",
        buyIn: "Buy-in",
        chips: "Jetons par joueur",
        blinds: "Blinds",
        smallBlind: "Petite blind",
        bigBlind: "Grosse blind",
        levelDuration: "Durée d'un niveau (min)",
        enableTimer: "Activer le minuteur de blinds",
        players: "Joueurs",
        playerName: "Nom du joueur",
        remove: (p) => `Retirer ${p.name}`,
        removeFallback: "joueur",
        pending: "en attente",
        pendingTitle: "Pas encore de réponse à l'invitation — retire-le s'il est absent",
        addPlayer: "Ajouter un joueur",
        allowRebuys: "Autoriser les rebuys et les add-ons",
        prizeDistribution: "Répartition des gains",
        placesPaid: "Places payées",
        placeLabel: (p) => `${p.ordinal} place`,
        total: (p) => `Total : ${p.total} % (doit faire 100 %)`,
        prizePool: "Prize pool",
        duplicateNames: "Au moins deux joueurs ont le même nom. Utilise des noms uniques.",
        mustTotal100: (p) => `La répartition des gains doit totaliser 100 % (actuellement ${p.total} %).`,
        seating: "Installation des joueurs…",
        start: "Lancer le Game Manager",
        seatError: "Impossible d'installer les joueurs, réessaie.",
    },
};

// 1st, 2nd, 3rd, 4th… (11th, 12th, 13th compris)
function ordinal(n, locale) {
    if (locale === "fr") return n === 1 ? "1re" : `${n}e`;
    const mod100 = n % 100;
    if (mod100 >= 11 && mod100 <= 13) return `${n}th`;
    return `${n}${{ 1: "st", 2: "nd", 3: "rd" }[n % 10] || "th"}`;
}

export default function PresetForm() {
    // En premier : la sauvegarde doit être relue avant que les effets ci-dessous n'écrivent dans le preset
    const hydrated = usePresetHydrated();
    const { preset, setPreset, resetPreset } = usePresetStore();
    const router = useRouter();
    const { t, locale, intlLocale } = useT(MESSAGES);
    const [playerError, setPlayerError] = useState(null);
    const [starting, setStarting] = useState(false);

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
                            name: displayPlayerName(p.user?.username || p.userName || p.guestName, locale),
                            status: p.status,
                            linked: true, // a déjà un GamePlayer côté serveur
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
                        rebuyAmountCents: g.rebuyAmountCents ?? null,
                        pkoEnabled: g.pkoEnabled || false,
                        pkoBountyPercent: g.pkoBountyPercent ?? 50,
                        pkoCashPercent: g.pkoCashPercent ?? 50,
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
    // La langue ne doit pas relancer le chargement (et réinitialiser le preset)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filteredPlayers = (preset.players || []).filter(
            (p) => p.name?.trim() !== ""
        );

        const names = filteredPlayers.map((p) => normalizeName(p.name));
        const hasDuplicates = names.some((n, i) => names.indexOf(n) !== i);
        if (hasDuplicates) {
            setPlayerError(t("duplicateNames"));
            return;
        }

        // Ex : 3 places → 33/33/33 = 99 % ; les gains ne correspondraient pas au prize pool
        if ((preset.payoutDistribution || []).length > 0 && totalPercent !== 100) {
            setPlayerError(t("mustTotal100", { total: totalPercent }));
            return;
        }

        setPlayerError(null);

        // Partie liée : chaque joueur assis paie son buy-in côté serveur, et les walk-ins
        // reçoivent un GamePlayer. Les ids du preset sont remplacés par les gamePlayerId.
        let players = filteredPlayers;
        if (preset.gameId) {
            setStarting(true);
            const res = await gameFinanceService.seats(
                preset.gameId,
                filteredPlayers.map((p) => ({
                    key: p.id,
                    gamePlayerId: p.linked ? p.id : undefined,
                    name: p.name.trim(),
                })),
                Number(preset.chipsPerPlayer) || undefined
            );
            setStarting(false);
            if (!res.success) {
                setPlayerError(t("seatError"));
                return;
            }
            const idByKey = new Map(res.data.seats.map((seat) => [seat.key, seat.gamePlayerId]));
            players = filteredPlayers.map((p) => ({ ...p, id: idByKey.get(p.id) ?? p.id, linked: true }));
        }
        setPreset({ players, maxPlayers: players.length });
        router.push("/manager");
    };

    if (!hydrated) return <p>{t("loading")}</p>;

    return (
        <form className="form form--preset" onSubmit={handleSubmit}>
            <h2>
                {locale === "fr" ? <>Préparation de la <span className="red">partie</span></> : <>Game <span className="red">setup</span></>}
            </h2>

            {/* Preset encore lié à une partie (ex: retour via "Edit" depuis le manager) */}
            {preset.gameId && !initialGameId && (
                <div className="form__row">
                    <p className="gray">
                        {t("linked", { title: preset.title })}
                    </p>
                    <button type="button" className="btn btn--small" onClick={resetPreset}>
                        {t("freeSession")}
                    </button>
                </div>
            )}

            {/* Title */}
            <div className="form__row">
                <label htmlFor="title">{t("title")}</label>
                <input id="title"
                    name="title"
                    value={preset.title}
                    onChange={handleChange}
                    placeholder={t("titlePlaceholder")}
                />
            </div>

            {/* Buy-in & Chips */}
            <div className="form__grid">
                <div className="form__row">
                    <label htmlFor="buyIn">{t("buyIn")}</label>
                    <input id="buyIn"
                        type="number"
                        name="buyIn"
                        value={preset.buyIn}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label htmlFor="chipsPerPlayer">{t("chips")}</label>
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
                <legend>{t("blinds")}</legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label htmlFor="smallBlind">{t("smallBlind")}</label>
                        <input id="smallBlind"
                            type="number"
                            name="smallBlind"
                            value={preset.smallBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="bigBlind">{t("bigBlind")}</label>
                        <input id="bigBlind"
                            type="number"
                            name="bigBlind"
                            value={preset.bigBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="levelDurationMin">{t("levelDuration")}</label>
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
                    <span>{t("enableTimer")}</span>
                </label>
            </fieldset>


            {/* Players */}
            <fieldset className="form__fieldset">
                <legend>{t("players")}</legend>
                {(preset.players || []).map((player) => (
                    <div key={player.id} className="form__row form__addPlayer">
                        <input
                            type="text"
                            aria-label={t("playerName")}
                            placeholder={t("playerName")}
                            value={player.name}
                            onChange={(e) =>
                                handlePlayerChange(player.id, e.target.value)
                            }
                        />
                        <button
                            type="button"
                            className="btn btn--small btn-add"
                            aria-label={t("remove", { name: player.name || t("removeFallback") })}
                            onClick={() => handleRemovePlayer(player.id)}
                        >
                            <FontAwesomeIcon icon={faTrash} />
                        </button>
                        {player.status === "pending" && (
                            <span
                                className="player__status player__status--pending"
                                title={t("pendingTitle")}
                            >
                                {t("pending")}
                            </span>
                        )}
                    </div>
                ))}
                <button
                    type="button"
                    className="btn btn--addPlayer"
                    onClick={handleAddPlayer}
                >
                    <FontAwesomeIcon icon={faPlus} /> {t("addPlayer")}
                </button>
                <div className="form__row">
                    <label htmlFor="playersNumber">{t("players")}</label>
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
                    <span>{t("allowRebuys")}</span>
                </label>
            </fieldset>

            {/* Payout */}
            <fieldset className="form__fieldset">
                <legend>{t("prizeDistribution")}</legend>
                <div className="form__row" style={{ marginBottom: "2rem" }}>
                    <label htmlFor="placesPaid">{t("placesPaid")}</label>
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
                                {t("placeLabel", { ordinal: ordinal(p.place, locale) })}{" "}
                                <small>
                                    {" "}
                                    ({p.percent}% →{" "}
                                    {new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(
                                        ((preset.prizePool || 0) * p.percent) /
                                        100
                                    )}{" "}
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
                    {t("total", { total: totalPercent })}
                </p>

                {/* Prize Pool (auto) */}
                <div className="form__row">
                    <label htmlFor="prizePool">{t("prizePool")}</label>
                    <input id="prizePool" type="number" value={preset.prizePool || 0} readOnly />
                </div>
            </fieldset>


            {playerError && <p className="error">{playerError}</p>}

            <button className="btn btn--full" type="submit" disabled={starting}>
                {starting ? t("seating") : t("start")}
            </button>
        </form>
    );
}
