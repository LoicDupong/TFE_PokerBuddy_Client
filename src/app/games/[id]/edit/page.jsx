"use client";

import { useRouter, useParams } from "next/navigation.js";
import { useEffect, useMemo, useState } from "react";
import gameService from "@/services/game.service.js";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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

export default function EditGamePage() {
    const { id } = useParams();
    const router = useRouter();

    const [game, setGame] = useState(null);

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
                        ? new Date(data.game.dateStart).toISOString().slice(0, 16)
                        : "",
                    realStart: data.game.realStart
                        ? new Date(data.game.realStart).toISOString().slice(11, 16) // → "20:05"
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

    if (!game) return <p>Loading...</p>;

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
        const res = await gameService.update(game.id, {
            ...formData,
            payoutDistribution: payouts,
            prizePool: prizePoolValue,
        });
        if (res.success) {
            router.push(`/games/${game.id}`);
        } else {
            alert(res.errorMessage?.[0] || "Update failed");
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
                Edit <span className="red">Game</span>
            </h2>

            {/* Name */}
            <div className="form__row">
                <label>
                    <FontAwesomeIcon icon={faDiamond} /> Title
                </label>
                <input name="name" value={formData.name} onChange={handleChange} />
            </div>

            {/* Dates */}
            <div className="form__grid">
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faCalendar} /> Date & Time
                    </label>
                    <input
                        type="datetime-local"
                        name="dateStart"
                        value={formData.dateStart}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faClock} /> Table start
                    </label>
                    <input
                        type="time"
                        name="realStart"
                        value={formData.realStart}
                        onChange={handleChange}
                    />
                </div>
            </div>

            {/* Location */}
            <div className="form__row">
                <label>
                    <FontAwesomeIcon icon={faLocationDot} /> Location
                </label>
                <input name="location" value={formData.location} onChange={handleChange} />
            </div>

            {/* Money */}
            <fieldset className="form__fieldset">
                <legend>
                    <FontAwesomeIcon icon={faGear} /> Money settings
                </legend>

                <div className="form__grid">
                    <div className="form__row">
                        <label>
                            <FontAwesomeIcon icon={faDollarSign} /> Buy-in
                        </label>
                        <input
                            type="number"
                            name="buyIn"
                            value={formData.buyIn}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label>Max Players</label>
                        <input
                            type="number"
                            name="maxPlayers"
                            value={formData.maxPlayers}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label>Places Paid</label>
                        <input
                            type="number"
                            name="placesPaid"
                            value={formData.placesPaid}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="form__row">
                        <label>
                            <FontAwesomeIcon icon={faDollarSign} /> Prize pool (min)
                        </label>
                        <input type="number" value={prizePoolValue} readOnly />
                    </div>

                    <div className="form__row">
                        <label>Currency</label>
                        <select name="currency" value={formData.currency} onChange={handleChange}>
                            <option value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="GBP">GBP</option>
                        </select>
                    </div>
                </div>

                <label className="form__checkbox">
                    <input
                        type="checkbox"
                        name="allowRebuys"
                        checked={formData.allowRebuys}
                        onChange={handleChange}
                    />
                    <span>Allow rebuys</span>
                </label>
            </fieldset>

            {/* Payouts */}
            <fieldset className="form__fieldset">
                <legend>Payout Distribution (%)</legend>

                <div className="form__grid">
                    {payouts.map((p, idx) => (
                        <div className="form__row" key={idx}>
                            <label>Place #{p.place}</label>
                            <input
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
                                <p className="gray">≈ {(prizePoolValue * p.percent / 100).toFixed(2)} €</p>
                            )}
                        </div>
                    ))}
                </div>
                <p className={payoutError ? "form__error" : "gray"}>
                    Total: {totalPercent}% {payoutError && "→ must be exactly 100%"}
                </p>
            </fieldset>

            {/* Blinds */}
            <fieldset className="form__fieldset">
                <legend>
                    <FontAwesomeIcon icon={faCoins} /> Blinds
                </legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label>Small Blind</label>
                        <input
                            type="number"
                            name="smallBlind"
                            value={formData.smallBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label>Big Blind</label>
                        <input
                            type="number"
                            name="bigBlind"
                            value={formData.bigBlind}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form__row">
                        <label>Level Duration (min)</label>
                        <input
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
                    <span>Enable blind timer during the session</span>
                </label>
            </fieldset>

            {/* Description */}
            <div className="form__row">
                <label>
                    <FontAwesomeIcon icon={faPenToSquare} /> Description
                </label>
                <textarea
                    name="description"
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                />
            </div>

            {/* Actions */}
            <div className="form__actions">
                <button type="button" className="btn btn--secondary" onClick={handleCancel}>
                    <FontAwesomeIcon icon={faXmark} /> Cancel
                </button>
                <button type="submit" className="btn btn--primary" disabled={payoutError}>
                    <FontAwesomeIcon icon={faSave} /> Save Changes
                </button>
            </div>
        </form>
    );
}
