"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCoins, faDiamond, faDollarSign, faGear, faLocationDot, faPlus, faSackDollar, faClock } from "@fortawesome/free-solid-svg-icons";
import usePresetStore from "@/stores/usePresetStore";
import { useRouter } from "next/navigation";

export default function PresetForm() {
    const { preset, setPreset } = usePresetStore();
    const router = useRouter();

    const handleChange = (e) => {
        const { name, type, value, checked } = e.target;
        setPreset({
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Preset ready:", preset);
        router.push("/games/manager");
    };

    return (
        <form className="form form--session" onSubmit={handleSubmit}>
            <h2>
                Game <span className="red">Preset</span>
            </h2>

            {/* Nom + Date */}
            <div className="form__row">
                <label>
                    <FontAwesomeIcon icon={faDiamond} /> Title
                </label>
                <input
                    name="title"
                    value={preset.title}
                    onChange={handleChange}
                    placeholder="Friday Night Poker"
                />
            </div>

            <div className="form__row">
                <label>
                    <FontAwesomeIcon icon={faCalendar} /> Start Time
                </label>
                <input
                    type="time"
                    name="dateTime"
                    value={preset.dateTime}
                    onChange={handleChange}
                />
            </div>

            {/* Buy-in + Currency + Chips */}
            <div className="form__grid">
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faDollarSign} /> Buy-in
                    </label>
                    <input
                        type="number"
                        name="buyIn"
                        value={preset.buyIn}
                        onChange={handleChange}
                    />
                </div>
                <div className="form__row">
                    <label>Currency</label>
                    <select
                        name="currency"
                        value={preset.currency}
                        onChange={handleChange}
                    >
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                    </select>
                </div>
                <div className="form__row">
                    <label>
                        <FontAwesomeIcon icon={faSackDollar} /> Chips / Player
                    </label>
                    <input
                        type="number"
                        name="chipsPerPlayer"
                        value={preset.chipsPerPlayer || ""}
                        onChange={handleChange}
                    />
                </div>
            </div>

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
                        <label>
                            <FontAwesomeIcon icon={faClock} /> Level Duration (min)
                        </label>
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

            {/* Options utiles en live */}
            <fieldset className="form__fieldset">
                <legend>
                    <FontAwesomeIcon icon={faGear} /> Options
                </legend>

                <div className="form__row">
                    <label>Max Players</label>
                    <input
                        type="number"
                        name="maxPlayers"
                        value={preset.maxPlayers || ""}
                        onChange={handleChange}
                    />
                </div>

                <label className="form__checkbox">
                    <input
                        type="checkbox"
                        name="allowRebuys"
                        checked={preset.allowRebuys}
                        onChange={handleChange}
                    />
                    <span>Allow rebuys (until break)</span>
                </label>
            </fieldset>

            <button className="btn btn--full" type="submit">
                <FontAwesomeIcon icon={faPlus} /> Use Preset
            </button>
        </form>
    );
}
