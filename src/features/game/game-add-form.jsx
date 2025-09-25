"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { validateSession } from "@/schemas/sessionSchema.js";
import { getFieldError } from "@/utils/getFieldError.utils.js";
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
    faPlus,
    faUserPlus,
} from "@fortawesome/free-solid-svg-icons";
import GameInvite from "../invite/game-invite.jsx";

export default function GameAddForm() {
    const router = useRouter();
    const [errorMessage, setErrorMessage] = useState([]);
    const [isPending, setIsPending] = useState(false);

    // States pour tes champs
    const [buyIn, setBuyIn] = useState(0);
    const [maxPlayers, setMaxPlayers] = useState(0);
    const [placesPaid, setPlacesPaid] = useState(2);
    const [payouts, setPayouts] = useState([
        { place: 1, percent: 70 },
        { place: 2, percent: 30 },
    ]);
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

    async function handleCreateGame(e) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // ✅ Validation avec Zod
        const validation = validateSession(data);
        if (!validation.ok) {
            setErrorMessage(validation.errors);
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
            <form onSubmit={handleCreateGame} className="form form--session">
                <h2>
                    Game <span className="red">Settings</span>
                </h2>

                {/* Name */}
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faDiamond} /> Title{" "}
                        <span className="red">*</span>
                    </label>
                    <input name="name" placeholder="Friday Night Poker" defaultValue="" />
                    {getFieldError(errorMessage, "name") && (
                        <p className="form__error">
                            {getFieldError(errorMessage, "name")}
                        </p>
                    )}
                </div>

                {/* Dates */}
                <div className="form__grid">
                    <div className="form__row input--icon left clickable">
                        <label>
                            Date & Time (planned) <span className="red">*</span>
                        </label>
                        <div className="input__container">
                            <input id="dateStart" type="datetime-local" name="dateStart" />
                            <FontAwesomeIcon
                                icon={faCalendar}
                                className="input__icon"
                                onClick={() => document.getElementById("dateStart").showPicker()}
                            />
                        </div>
                    </div>

                    <div className="form__row input--icon left clickable">
                        <label>Table start (optional)</label>
                        <div className="input__container">
                            <input id="realStart" type="time" name="realStart" />
                            <FontAwesomeIcon
                                icon={faClock}
                                className="input__icon"
                                onClick={() => document.getElementById("realStart").showPicker()}
                            />
                        </div>
                    </div>
                </div>

                {/* Location */}
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faLocationDot} /> Location{" "}
                        <span className="red">*</span>
                    </label>
                    <input
                        name="location"
                        placeholder="Brussels, at John's place"
                        defaultValue=""
                    />
                    {getFieldError(errorMessage, "location") && (
                        <p className="form__error">
                            {getFieldError(errorMessage, "location")}
                        </p>
                    )}
                </div>

                {/* Money */}
                <fieldset className="form__fieldset">
                    <legend>
                        <FontAwesomeIcon icon={faGear} /> Money settings
                    </legend>

                    <div className="form__grid">
                        <div className="form__row">
                            <label>
                                <FontAwesomeIcon icon={faDollarSign} /> Buy-in{" "}
                                <span className="red">*</span>
                            </label>
                            <input
                                type="number"
                                min={0}
                                step="1"
                                name="buyIn"
                                value={buyIn}
                                onChange={(e) => setBuyIn(Number(e.target.value || 0))}
                            />
                        </div>

                        <div className="form__row">
                            <label>Max Players</label>
                            <input
                                type="number"
                                min={2}
                                max={200}
                                name="maxPlayers"
                                value={maxPlayers || ""}
                                onChange={(e) => setMaxPlayers(Number(e.target.value || 0))}
                            />
                        </div>

                        <div className="form__row">
                            <label>
                                Places Paid <span className="red">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={50}
                                name="placesPaid"
                                value={placesPaid}
                                onChange={(e) => setPlacesPaid(Number(e.target.value))}
                            />
                        </div>

                        <div className="form__row">
                            <label>
                                <FontAwesomeIcon icon={faDollarSign} /> Prize pool (minimum)
                            </label>
                            <input
                                type="number"
                                name="prizePool"
                                value={prizePoolValue}
                                readOnly
                            />
                        </div>

                        <div className="form__row">
                            <label>Currency</label>
                            <select name="currency" defaultValue="EUR">
                                <option value="EUR">EUR</option>
                                <option value="USD">USD</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                    </div>

                    <div className="form__grid">
                        <label className="form__checkbox">
                            <input type="checkbox" name="allowRebuys" />
                            <span>Allow rebuys</span>
                        </label>
                    </div>
                </fieldset>

                {/* Payout distribution editor */}
                <fieldset className="form__fieldset">
                    <legend>Payout Distribution (%)</legend>

                    <div className="form__grid">
                        {payouts.map((p, idx) => (
                            <div className="form__row" key={idx}>
                                <label>Place #{p.place}</label>
                                <div className="input--payout">
                                    <input
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
                                    />
                                </div>
                                {prizePoolValue > 0 && (
                                    <p className="gray">
                                        ≈ {((prizePoolValue * p.percent) / 100).toFixed(2)} €
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="divider"></div>
                    <p className={payoutError ? "form__error" : "gray"}>
                        Total: {totalPercent}% {payoutError && " → must be exactly 100%"}
                    </p>

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
                            <label>
                                Small Blind <span className="red">*</span>
                            </label>
                            <input type="number" min={1} step="1" name="smallBlind" />
                        </div>
                        <div className="form__row">
                            <label>
                                Big Blind <span className="red">*</span>
                            </label>
                            <input type="number" min={1} step="1" name="bigBlind" />
                        </div>
                        <div className="form__row">
                            <label>
                                Level Duration (min) <span className="red">*</span>
                            </label>
                            <input
                                type="number"
                                min={1}
                                max={120}
                                step="1"
                                name="levelDuration"
                                defaultValue="15"
                            />
                        </div>
                    </div>

                    <label className="form__checkbox">
                        <input type="checkbox" name="enableBlindTimer" />
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
                        placeholder="House rules, snacks, parking, etc."
                        defaultValue=""
                    />
                </div>

                {/* Bouton Invite Friends */}
                <div className="form__row">
                    <button
                        type="button"
                        className="btn btn--secondary"
                        onClick={() => setShowInviteModal(true)}
                    >
                        <FontAwesomeIcon icon={faUserPlus} /> Invite Friends (
                        {invites.friends.length + invites.guests.length})
                    </button>
                </div>

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
                    {isPending ? "Creating..." : "Create session"}
                </button>

                {/* Erreur globale */}
                {getFieldError(errorMessage, "form") && (
                    <p className="form__error">
                        {getFieldError(errorMessage, "form")}
                    </p>
                )}
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
