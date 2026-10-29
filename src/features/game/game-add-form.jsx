"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { validateSession } from "@/schemas/sessionSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
import { combineDateAndTime } from "@/utils/date.utils.js";
import { currencySymbol } from "@/utils/game.utils.js";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCalendar,
    faClock,
    faClockRotateLeft,
    faCoins,
    faDiamond,
    faDollarSign,
    faGear,
    faLocationDot,
    faPenToSquare,
    faPlus,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import GameInvite from "../invite/game-invite.jsx";
import FinanceFields from "./finance-fields.jsx";
import { centsToInput } from "@/utils/money.utils.js";

// Champs du bloc replié : une erreur ici doit rouvrir le bloc
const ADVANCED_FIELDS = [
    "realStart",
    "maxPlayers",
    "placesPaid",
    "payoutDistribution",
    "rebuyAmount",
    "pkoBountyPercent",
    "pkoCashPercent",
    "smallBlind",
    "bigBlind",
    "levelDuration",
    "description",
];

export default function GameAddForm() {
    const router = useRouter();
    const user = useAuthStore((state) => state.user);
    const formRef = useRef(null);
    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);

    // States pour tes champs
    const [buyIn, setBuyIn] = useState(0);
    const [currency, setCurrency] = useState("EUR");
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [placesPaid, setPlacesPaid] = useState(2);
    const [payouts, setPayouts] = useState([
        { place: 1, percent: 70 },
        { place: 2, percent: 30 },
    ]);
    // Réglages avancés contrôlés : "Same as last time" doit pouvoir les remplir
    const [adv, setAdv] = useState({
        realStart: "",
        smallBlind: 10,
        bigBlind: 20,
        levelDuration: 15,
        enableBlindTimer: false,
        allowRebuys: false,
        rebuyAmount: "",
        pkoEnabled: false,
        pkoBountyPercent: 50,
        pkoCashPercent: 50,
        description: "",
    });
    const setAdvField = (name, value) => setAdv((prev) => ({ ...prev, [name]: value }));
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [lastGame, setLastGame] = useState(null);
    const [prefillNotice, setPrefillNotice] = useState("");
    const [invites, setInvites] = useState({
        emails: [],
        friends: [],
        guests: [],
    });
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Calcul automatique du prize pool
    const prizePoolValue = useMemo(() => buyIn * maxPlayers, [buyIn, maxPlayers]);

    // Ajuster payoutDistribution
    useEffect(() => {
        setPayouts((prev) => {
            const next = [...prev];
            if (placesPaid > prev.length) {
                for (let i = prev.length + 1; i <= placesPaid; i++) {
                    next.push({ place: i, percent: 0 });
                }
            } else if (placesPaid < prev.length) {
                next.length = placesPaid;
            }
            if (
                next.reduce((s, p) => s + Number(p.percent || 0), 0) === 0 &&
                next.length > 0
            ) {
                next[0].percent = 100;
            }
            return next.map((p, idx) => ({ ...p, place: idx + 1 }));
        });
    }, [placesPaid]);

    const totalPercent = useMemo(
        () => payouts.reduce((s, p) => s + Number(p.percent || 0), 0),
        [payouts]
    );
    const payoutError = totalPercent !== 100;

    // Dernière partie organisée par l'utilisateur (la plus récemment créée)
    useEffect(() => {
        if (!user?.id) return;
        let cancelled = false;
        (async () => {
            const data = await gameService.getAll();
            const hosted = (data?.games || []).filter((g) => g.hostId === user.id);
            hosted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            if (!cancelled) setLastGame(hosted[0] || null);
        })();
        return () => {
            cancelled = true;
        };
    }, [user?.id]);

    // Reprend les réglages (pas le titre ni la date) de la dernière partie
    function applyLastGame() {
        const g = lastGame;
        if (!g) return;
        let hhmm = "";
        if (g.realStart) {
            const d = new Date(g.realStart);
            hhmm = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
        }
        const dist =
            Array.isArray(g.payoutDistribution) && g.payoutDistribution.length
                ? g.payoutDistribution.map((p, i) => ({ place: i + 1, percent: Number(p.percent) || 0 }))
                : null;
        setBuyIn(Number(g.buyIn) || 0);
        setCurrency(g.currency || "EUR");
        setMaxPlayers(Number(g.maxPlayers) || 0);
        setPlacesPaid(dist ? dist.length : Number(g.placesPaid) || 2);
        if (dist) setPayouts(dist);
        setAdv({
            realStart: hhmm,
            smallBlind: Number(g.smallBlind) || 10,
            bigBlind: Number(g.bigBlind) || 20,
            levelDuration: Number(g.levelDuration) || 15,
            enableBlindTimer: !!g.enableBlindTimer,
            allowRebuys: !!g.allowRebuys,
            rebuyAmount: g.rebuyAmountCents != null ? centsToInput(g.rebuyAmountCents) : "",
            pkoEnabled: !!g.pkoEnabled,
            pkoBountyPercent: g.pkoBountyPercent ?? 50,
            pkoCashPercent: g.pkoCashPercent ?? 50,
            description: g.description || "",
        });
        setPrefillNotice(`Settings copied from "${g.name}".`);
    }

    // Une erreur dans le bloc replié : on l'ouvre, puis on met le focus sur le premier champ invalide
    useEffect(() => {
        if (!errorMessage.some((e) => e.field !== "form")) return;
        if (errorMessage.some((e) => ADVANCED_FIELDS.includes(e.field))) setAdvancedOpen(true);
        // Après le rendu : le bloc ouvert rend ses champs focusables
        const t = setTimeout(() => {
            formRef.current?.querySelector('[aria-invalid="true"]')?.focus();
        }, 0);
        return () => clearTimeout(t);
    }, [errorMessage]);

    // Message d'erreur zod sous le champ concerné
    const fieldError = (field) => {
        const message = getFieldError(errorMessage, field);
        return message && <p className="form__error" id={`${field}-error`}>{message}</p>;
    };

    // Lie le champ à son message d'erreur pour les lecteurs d'écran
    const errProps = (field) => {
        const invalid = !!getFieldError(errorMessage, field);
        return {
            "aria-invalid": invalid,
            "aria-describedby": invalid ? `${field}-error` : undefined,
        };
    };

    async function handleCreateGame(e) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Dates converties en ISO ici, dans le fuseau de l'utilisateur (le serveur tourne en UTC)
        if (data.dateStart) {
            const start = new Date(data.dateStart);
            data.dateStart = start.toISOString();
            data.realStart = data.realStart ? combineDateAndTime(start, data.realStart) : "";
        }

        // ✅ Validation avec Zod
        const validation = validateSession(data);
        if (!validation.ok) {
            // Rappel près du bouton : sur mobile, le champ fautif est souvent hors écran
            setErrorMessage([
                ...validation.errors,
                { field: "form", message: "Some fields are invalid: check the messages above." },
            ]);
            setIsPending(false);
            return;
        }

        // ✅ API call
        const res = await gameService.create(validation.data);

        if (res.success) {
            router.push("/games");
        } else {
            setErrorMessage([{ field: "form", message: res.errorMessage }]);
        }

        setIsPending(false);
    }

    return (
        <>
            <form ref={formRef} onSubmit={handleCreateGame} className="form form--session" noValidate>
                <h2>
                    Game <span className="red">settings</span>
                </h2>

                {lastGame && (
                    <div className="form__row">
                        <button type="button" className="btn btn--secondary" onClick={applyLastGame}>
                            <FontAwesomeIcon icon={faClockRotateLeft} /> Same as last time
                        </button>
                        <p className="gray" role="status">
                            {prefillNotice || "Copies the settings of your last hosted game, not the title or date."}
                        </p>
                    </div>
                )}

                {/* Name */}
                <div className="form__row">
                    <label htmlFor="name">
                        <FontAwesomeIcon icon={faDiamond} /> Title{" "}
                        <span className="red">*</span>
                    </label>
                    <input id="name" name="name" placeholder="Friday Night Poker" defaultValue="" {...errProps("name")} />
                    {fieldError("name")}
                </div>

                {/* Dates */}
                <div className="form__row input--icon left clickable">
                    <label htmlFor="dateStart">
                        Date & time <span className="red">*</span>
                    </label>
                    <div className="input__container">
                        <input id="dateStart" type="datetime-local" name="dateStart" {...errProps("dateStart")} />
                        <FontAwesomeIcon
                            icon={faCalendar}
                            className="input__icon"
                            onClick={() => document.getElementById("dateStart").showPicker()}
                        />
                    </div>
                    {fieldError("dateStart")}
                </div>

                {/* Location */}
                <div className="form__row">
                    <label htmlFor="location">
                        <FontAwesomeIcon icon={faLocationDot} /> Location{" "}
                        <span className="red">*</span>
                    </label>
                    <input id="location"
                        name="location"
                        placeholder="Brussels, at John's place"
                        defaultValue=""
                        {...errProps("location")}
                    />
                    {fieldError("location")}
                </div>

                {/* Buy-in */}
                <div className="form__grid">
                    <div className="form__row">
                        <label htmlFor="buyIn">
                            <FontAwesomeIcon icon={faDollarSign} /> Buy-in{" "}
                            <span className="red">*</span>
                        </label>
                        <input id="buyIn"
                            type="number"
                            min={0}
                            step="1"
                            name="buyIn"
                            value={buyIn}
                            onChange={(e) => setBuyIn(Number(e.target.value || 0))}
                            {...errProps("buyIn")}
                        />
                        {fieldError("buyIn")}
                    </div>

                    <div className="form__row">
                        <label htmlFor="currency">Currency</label>
                        <select id="currency" name="currency" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </select>
                        {fieldError("currency")}
                    </div>
                </div>

                {/* Bouton Invite Friends */}
                <div className="form__row">
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <FontAwesomeIcon icon={faUserPlus} /> Invite friends (
                        {invites.friends.length + invites.guests.length})
                    </button>
                </div>

                {/* Réglages avancés : repliés par défaut, les valeurs par défaut suffisent pour valider */}
                <details
                    className="form__advanced"
                    open={advancedOpen}
                    onToggle={(e) => setAdvancedOpen(e.currentTarget.open)}
                >
                    <summary>
                        <FontAwesomeIcon icon={faGear} /> Advanced settings
                    </summary>

                    <div className="form__advanced-body">
                        <div className="form__grid">
                            <div className="form__row input--icon left clickable">
                                <label htmlFor="realStart">Table start (optional)</label>
                                <div className="input__container">
                                    <input id="realStart"
                                        type="time"
                                        name="realStart"
                                        value={adv.realStart}
                                        onChange={(e) => setAdvField("realStart", e.target.value)}
                                        {...errProps("realStart")}
                                    />
                                    <FontAwesomeIcon
                                        icon={faClock}
                                        className="input__icon"
                                        onClick={() => document.getElementById("realStart").showPicker()}
                                    />
                                </div>
                                {fieldError("realStart")}
                            </div>

                            <div className="form__row">
                                <label htmlFor="maxPlayers">Max players</label>
                                <input id="maxPlayers"
                                    type="number"
                                    min={2}
                                    max={200}
                                    name="maxPlayers"
                                    value={maxPlayers || ""}
                                    onChange={(e) => setMaxPlayers(Number(e.target.value || 0))}
                                    {...errProps("maxPlayers")}
                                />
                                {fieldError("maxPlayers")}
                            </div>

                            <div className="form__row">
                                <label htmlFor="placesPaid">
                                    Places paid <span className="red">*</span>
                                </label>
                                <input id="placesPaid"
                                    type="number"
                                    min={1}
                                    max={50}
                                    name="placesPaid"
                                    value={placesPaid}
                                    onChange={(e) => setPlacesPaid(Number(e.target.value))}
                                    {...errProps("placesPaid")}
                                />
                                {fieldError("placesPaid")}
                            </div>

                            <div className="form__row">
                                <label htmlFor="prizePool">
                                    <FontAwesomeIcon icon={faDollarSign} /> Prize pool (minimum)
                                </label>
                                <input id="prizePool"
                                    type="number"
                                    name="prizePool"
                                    value={prizePoolValue}
                                    readOnly
                                />
                            </div>
                        </div>

                        <FinanceFields
                            values={adv}
                            onChange={setAdvField}
                            buyIn={buyIn}
                            currency={currency}
                            fieldError={fieldError}
                            errProps={errProps}
                        />

                        {/* Payout distribution editor */}
                        <fieldset className="form__fieldset">
                            <legend>Payout distribution (%)</legend>

                            <div className="form__grid">
                                {payouts.map((p, idx) => (
                                    <div className="form__row" key={idx}>
                                        <label htmlFor={`payout-${idx}`}>Place #{p.place}</label>
                                        <div className="input--payout">
                                            <input
                                                id={`payout-${idx}`}
                                                type="number"
                                                min={0}
                                                max={100}
                                                step="1"
                                                value={p.percent}
                                                onChange={(e) => {
                                                    const v = Number(e.target.value || 0);
                                                    setPayouts((prev) => {
                                                        const next = [...prev];
                                                        next[idx] = { ...next[idx], percent: v };
                                                        return next;
                                                    });
                                                }}
                                                {...(idx === 0 ? errProps("payoutDistribution") : {})}
                                            />
                                        </div>
                                        {prizePoolValue > 0 && (
                                            <p className="gray">
                                                ≈ {((prizePoolValue * p.percent) / 100).toFixed(2)} {currencySymbol(currency)}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <div className="divider"></div>
                            <p className={payoutError ? "form__error" : "gray"}>
                                Total: {totalPercent}% {payoutError && " → must be exactly 100%"}
                            </p>
                            {fieldError("payoutDistribution")}

                            <input
                                type="hidden"
                                name="payoutDistribution"
                                value={JSON.stringify(payouts)}
                                readOnly
                            />
                        </fieldset>

                        {/* Blinds & Timer */}
                        <fieldset className="form__fieldset">
                            <legend>
                                <FontAwesomeIcon icon={faCoins} /> Blinds
                            </legend>
                            <div className="form__grid">
                                <div className="form__row">
                                    <label htmlFor="smallBlind">
                                        Small blind <span className="red">*</span>
                                    </label>
                                    <input id="smallBlind"
                                        type="number"
                                        min={1}
                                        step="1"
                                        name="smallBlind"
                                        value={adv.smallBlind}
                                        onChange={(e) => setAdvField("smallBlind", e.target.value)}
                                        {...errProps("smallBlind")}
                                    />
                                    {fieldError("smallBlind")}
                                </div>
                                <div className="form__row">
                                    <label htmlFor="bigBlind">
                                        Big blind <span className="red">*</span>
                                    </label>
                                    <input id="bigBlind"
                                        type="number"
                                        min={1}
                                        step="1"
                                        name="bigBlind"
                                        value={adv.bigBlind}
                                        onChange={(e) => setAdvField("bigBlind", e.target.value)}
                                        {...errProps("bigBlind")}
                                    />
                                    {fieldError("bigBlind")}
                                </div>
                                <div className="form__row">
                                    <label htmlFor="levelDuration">
                                        Level duration (min) <span className="red">*</span>
                                    </label>
                                    <input id="levelDuration"
                                        type="number"
                                        min={1}
                                        max={120}
                                        step="1"
                                        name="levelDuration"
                                        value={adv.levelDuration}
                                        onChange={(e) => setAdvField("levelDuration", e.target.value)}
                                        {...errProps("levelDuration")}
                                    />
                                    {fieldError("levelDuration")}
                                </div>
                            </div>

                            <label className="form__checkbox">
                                <input
                                    type="checkbox"
                                    name="enableBlindTimer"
                                    checked={adv.enableBlindTimer}
                                    onChange={(e) => setAdvField("enableBlindTimer", e.target.checked)}
                                />
                                <span>Enable blind timer during the game</span>
                            </label>
                        </fieldset>

                        {/* Description */}
                        <div className="form__row">
                            <label htmlFor="description">
                                <FontAwesomeIcon icon={faPenToSquare} /> Description
                            </label>
                            <textarea id="description"
                                name="description"
                                rows={4}
                                placeholder="House rules, snacks, parking, etc."
                                value={adv.description}
                                onChange={(e) => setAdvField("description", e.target.value)}
                                {...errProps("description")}
                            />
                            {fieldError("description")}
                        </div>
                    </div>
                </details>

                {/* Champ caché pour envoyer au backend */}
                <input
                    type="hidden"
                    name="invites"
                    value={JSON.stringify(invites)}
                    readOnly
                />

                <button
                    className="btn btn--full"
                    type="submit"
                    disabled={isPending || payoutError}
                >
                    <FontAwesomeIcon icon={faPlus} />{" "}
                    {isPending ? "Creating..." : "Create game"}
                </button>
                {payoutError && (
                    <p className="form__error">
                        Payout distribution must total 100%: open Advanced settings to fix it.
                    </p>
                )}

                {/* Erreur globale */}
                {fieldError("form")}
            </form>

            {/* Modal d’invitation */}
            {showInviteModal && (
                <GameInvite
                    invites={invites}
                    setInvites={setInvites}
                    onClose={() => setShowInviteModal(false)}
                />
            )}
        </>
    );
}
