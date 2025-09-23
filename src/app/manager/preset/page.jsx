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
        router.push("/manager");
    };

    return (
        <form className="form form--preset" onSubmit={handleSubmit}>
            <h2>Game <span className="red">Preset</span></h2>

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
                    <span>Allow rebuys</span>
                </label>

                <div className="form__row">
                    <label>Prize Distribution</label>
                    <select
                        name="payout"
                        value={preset.payout || "70/20/10"}
                        onChange={handleChange}
                    >
                        <option value="70/20/10">70 / 20 / 10</option>
                        <option value="50/30/20">50 / 30 / 20</option>
                        <option value="100">Winner takes all</option>
                    </select>
                </div>
            </fieldset>

            <button className="btn btn--full" type="submit">
                Use Preset
            </button>
        </form>

    );
}
