"use client";

import { useRouter, useParams } from "next/navigation.js";
import { useEffect, useMemo, useState } from "react";
import gameService from "@/services/game.service.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import useToastStore from "@/stores/useToastStore.js";
import { combineDateAndTime, toDatetimeLocalValue } from "@/utils/date.utils.js";
import { currencySymbol } from "@/utils/game.utils.js";
import FinanceFields from "@/features/game/finance-fields.jsx";
import { centsToInput, parseAmountToCents } from "@/utils/money.utils.js";
import {
    faCalendar,
    faClock,
    faCoins,
    faDiamond,
    faDollarSign,
    faGear,
    faLocationDot,
    faPenToSquare,
    faSave,
    faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { COMMON } from "@/i18n/common.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        ...COMMON.en,
        rebuyInvalid: "Rebuy price must be a positive amount",
        updateFailed: "Update failed",
        title: "Title",
        dateTime: "Date & Time",
        tableStart: "Table start",
        location: "Location",
        money: "Money settings",
        buyIn: "Buy-in",
        maxPlayers: "Max players",
        placesPaid: "Places paid",
        prizePoolMin: "Prize pool (min)",
        currency: "Currency",
        locked: "Once a buy-in, rebuy or knockout is recorded in the Game Manager, the buy-in and PKO settings are locked.",
        payouts: "Payout distribution (%)",
        place: (p) => `Place #${p.place}`,
        total: "Total",
        mustBe100: "→ must be exactly 100%",
        blinds: "Blinds",
        smallBlind: "Small blind",
        bigBlind: "Big blind",
        levelDuration: "Level duration (min)",
        enableTimer: "Enable blind timer during the game",
        description: "Description",
        saveChanges: "Save changes",
    },
    fr: {
        ...COMMON.fr,
        rebuyInvalid: "Le prix du rebuy doit être un montant positif",
        updateFailed: "La mise à jour a échoué",
        title: "Titre",
        dateTime: "Date et heure",
        tableStart: "Début à table",
        location: "Lieu",
        money: "Réglages d'argent",
        buyIn: "Buy-in",
        maxPlayers: "Joueurs max",
        placesPaid: "Places payées",
        prizePoolMin: "Prize pool (min)",
        currency: "Devise",
        locked: "Dès qu'un buy-in, un rebuy ou une élimination est enregistré dans le Game Manager, le buy-in et les réglages PKO sont verrouillés.",
        payouts: "Répartition des gains (%)",
        place: (p) => `Place n°${p.place}`,
        total: "Total",
        mustBe100: "→ doit faire exactement 100 %",
        blinds: "Blinds",
        smallBlind: "Petite blind",
        bigBlind: "Grosse blind",
        levelDuration: "Durée d'un niveau (min)",
        enableTimer: "Activer le minuteur de blinds pendant la partie",
        description: "Description",
        saveChanges: "Enregistrer les modifications",
    },
};

export default function EditGamePage() {
    const { id } = useParams();
    const router = useRouter();

    const [game, setGame] = useState(null);
    const { showToast } = useToastStore();
    const { t, locale, intlLocale } = useT(MESSAGES);

    const [formData, setFormData] = useState({
        name: "",
        dateStart: "",
        realStart: "",
        location: "",
        buyIn: 0,
        currency: "EUR",
        smallBlind: 0,
        bigBlind: 0,
        levelDuration: 15,
        enableBlindTimer: false,
        maxPlayers: 0,
        placesPaid: 2,
        allowRebuys: false,
        rebuyAmount: "",
        pkoEnabled: false,
        pkoBountyPercent: 50,
        pkoCashPercent: 50,
        description: "",
    });

    const [payouts, setPayouts] = useState([
        { place: 1, percent: 70 },
        { place: 2, percent: 30 },
    ]);

    // prizePool auto
    const prizePoolValue = useMemo(
        () => formData.buyIn * formData.maxPlayers,
        [formData.buyIn, formData.maxPlayers]
    );

    // fetch game on mount
    useEffect(() => {
        (async () => {
            const data = await gameService.getById(id);
            if (data?.game) {
                setGame(data.game);
                setFormData({
                    name: data.game.name || "",
                    dateStart: data.game.dateStart
                        ? toDatetimeLocalValue(new Date(data.game.dateStart))
                        : "",
                    realStart: data.game.realStart
                        ? (() => { const d = new Date(data.game.realStart); return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; })()
                        : "",

                    location: data.game.location || "",
                    buyIn: Number(data.game.buyIn) || 0,
                    currency: data.game.currency || "EUR",
                    smallBlind: Number(data.game.smallBlind) || 0,
                    bigBlind: Number(data.game.bigBlind) || 0,
                    levelDuration: Number(data.game.levelDuration) || 15,
                    enableBlindTimer: data.game.enableBlindTimer || false,
                    maxPlayers: Number(data.game.maxPlayers) || 0,
                    placesPaid: Number(data.game.placesPaid) || 2,
                    allowRebuys: data.game.allowRebuys || false,
                    rebuyAmount: data.game.rebuyAmountCents != null ? centsToInput(data.game.rebuyAmountCents) : "",
                    pkoEnabled: data.game.pkoEnabled || false,
                    pkoBountyPercent: data.game.pkoBountyPercent ?? 50,
                    pkoCashPercent: data.game.pkoCashPercent ?? 50,
                    description: data.game.description || "",
                });
                setPayouts(data.game.payoutDistribution || payouts);
            }
        })();
    }, [id]);

    // ajuster payouts quand placesPaid change
    useEffect(() => {
        setPayouts((prev) => {
            const next = [...prev];
            if (formData.placesPaid > prev.length) {
                for (let i = prev.length + 1; i <= formData.placesPaid; i++) {
                    next.push({ place: i, percent: 0 });
                }
            } else if (formData.placesPaid < prev.length) {
                next.length = formData.placesPaid;
            }
            return next.map((p, idx) => ({ ...p, place: idx + 1 }));
        });
    }, [formData.placesPaid]);

    if (!game) return <p>{t("loading")}</p>;

    // handle inputs
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]:
                type === "checkbox" ? checked : name === "placesPaid" || name === "buyIn" || name === "maxPlayers" ? Number(value) || 0 : value,
        }));
    };

    // confirm save
    const handleConfirm = async (e) => {
        e.preventDefault();
        const start = formData.dateStart ? new Date(formData.dateStart) : null;
        // Prix du rebuy saisi en unités → centimes (analyse de chaîne)
        const { rebuyAmount, ...rest } = formData;
        const rebuyText = String(rebuyAmount ?? "").trim();
        const rebuyAmountCents = rebuyText === "" ? null : parseAmountToCents(rebuyText);
        if (rebuyText !== "" && !rebuyAmountCents) {
            showToast(t("rebuyInvalid"));
            return;
        }
        const res = await gameService.update(game.id, {
            ...rest,
            rebuyAmountCents,
            pkoBountyPercent: Number(formData.pkoBountyPercent),
            pkoCashPercent: Number(formData.pkoCashPercent),
            dateStart: start ? start.toISOString() : formData.dateStart,
            // Heure de table convertie ici, dans le fuseau de l'utilisateur ; vide → null pour l'effacer
            realStart: start && formData.realStart ? combineDateAndTime(start, formData.realStart) : null,
            payoutDistribution: payouts,
            prizePool: prizePoolValue,
        });
        if (res.success) {
            router.push(`/games/${game.id}`);
        } else {
            showToast(t("updateFailed"));
        }
    };

    const handleCancel = () => {
        router.push(`/games/${game.id}`);
    };

    const totalPercent = payouts.reduce((s, p) => s + Number(p.percent || 0), 0);
    const payoutError = totalPercent !== 100;

    return (
        <form onSubmit={handleConfirm} className="form form--session">
            <h2>
                {locale === "fr" ? <>Modifier la <span className="red">partie</span></> : <>Edit <span className="red">game</span></>}
            </h2>

            {/* Name */}
            <div className="form__row">
                <label htmlFor="name">
                    <FontAwesomeIcon icon={faDiamond} /> {t("title")}
                </label>
                <input id="name" name="name" value={formData.name} onChange={handleChange} />
            </div>

            {/* Dates */}
            <div className="form__grid">
                <div className="form__row">
                    <label htmlFor="dateStart">
                        <FontAwesomeIcon icon={faCalendar} /> {t("dateTime")}
                    </label>
                    <input id="dateStart"
                        type="datetime-local"
                        name="dateStart"
                        value={formData.dateStart}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label htmlFor="realStart">
                        <FontAwesomeIcon icon={faClock} /> {t("tableStart")}
                    </label>
                    <input id="realStart"
                        type="time"
                        name="realStart"
                        value={formData.realStart}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="form__row">
                <label htmlFor="location">
                    <FontAwesomeIcon icon={faLocationDot} /> {t("location")}
                </label>
                <input id="location" name="location" value={formData.location} onChange={handleChange} />
            </div>

            {/* Money */}
            <fieldset className="form__fieldset">
                <legend>
                    <FontAwesomeIcon icon={faGear} /> {t("money")}
                </legend>

                <div className="form__grid">
                    <div className="form__row">
                        <label htmlFor="buyIn">
                            <FontAwesomeIcon icon={faDollarSign} /> {t("buyIn")}
                        </label>
                        <input id="buyIn"
                            type="number"
                            name="buyIn"
                            value={formData.buyIn}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label htmlFor="maxPlayers">{t("maxPlayers")}</label>
                        <input id="maxPlayers"
                            type="number"
                            name="maxPlayers"
                            value={formData.maxPlayers}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label htmlFor="placesPaid">{t("placesPaid")}</label>
                        <input id="placesPaid"
                            type="number"
                            name="placesPaid"
                            value={formData.placesPaid}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label htmlFor="prizePoolMin">
                            <FontAwesomeIcon icon={faDollarSign} /> {t("prizePoolMin")}
                        </label>
                        <input id="prizePoolMin" type="number" value={prizePoolValue} readOnly />
                    </div>

                    <div className="form__row">
                        <label htmlFor="currency">{t("currency")}</label>
                        <select id="currency" name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                <FinanceFields
                    values={formData}
                    onChange={(name, value) => setFormData((prev) => ({ ...prev, [name]: value }))}
                    buyIn={formData.buyIn}
                    currency={formData.currency}
                />
                <p className="gray">{t("locked")}</p>
            </fieldset>

            {/* Payouts */}
            <fieldset className="form__fieldset">
                <legend>{t("payouts")}</legend>

                <div className="form__grid">
                    {payouts.map((p, idx) => (
                        <div className="form__row" key={idx}>
                            <label htmlFor={`payout-${idx}`}>{t("place", { place: p.place })}</label>
                            <input
                                id={`payout-${idx}`}
                                type="number"
                                min={0}
                                max={100}
                                value={p.percent}
                                onChange={(e) => {
                                    const v = Number(e.target.value || 0);
                                    setPayouts((prev) => {
                                        const next = [...prev];
                                        next[idx] = { ...next[idx], percent: v };
                                        return next;
                                    });
                                }}
                            />
                            {prizePoolValue > 0 && (
                                <p className="gray">≈ {new Intl.NumberFormat(intlLocale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(prizePoolValue * p.percent / 100)} {currencySymbol(formData.currency)}</p>
                            )}
                        </div>
                    ))}
                </div>
                <p className={payoutError ? "form__error" : "gray"}>
                    {t("total")}: {totalPercent}% {payoutError && t("mustBe100")}
                </p>
            </fieldset>

            {/* Blinds */}
            <fieldset className="form__fieldset">
                <legend>
                    <FontAwesomeIcon icon={faCoins} /> {t("blinds")}
                </legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label htmlFor="smallBlind">{t("smallBlind")}</label>
                        <input id="smallBlind"
                            type="number"
                            name="smallBlind"
                            value={formData.smallBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="bigBlind">{t("bigBlind")}</label>
                        <input id="bigBlind"
                            type="number"
                            name="bigBlind"
                            value={formData.bigBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label htmlFor="levelDuration">{t("levelDuration")}</label>
                        <input id="levelDuration"
                            type="number"
                            name="levelDuration"
                            value={formData.levelDuration}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <label className="form__checkbox">
                    <input
                        type="checkbox"
                        name="enableBlindTimer"
                        checked={formData.enableBlindTimer}
                        onChange={handleChange}
                    />
                    <span>{t("enableTimer")}</span>
                </label>
            </fieldset>

            {/* Description */}
            <div className="form__row">
                <label htmlFor="description">
                    <FontAwesomeIcon icon={faPenToSquare} /> {t("description")}
                </label>
                <textarea id="description"
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            {/* Actions */}
            <div className="form__actions">
                <button type="button" className="btn btn--secondary" onClick={handleCancel}>
                    <FontAwesomeIcon icon={faXmark} /> {t("cancel")}
                </button>
                <button type="submit" className="btn btn--primary" disabled={payoutError}>
                    <FontAwesomeIcon icon={faSave} /> {t("saveChanges")}
                </button>
            </div>
        </form>
    );
}
