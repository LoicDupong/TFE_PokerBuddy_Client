'use client';

import { addGameAction } from "@/actions/game.action.js";
import { sessionSchema } from "@/schemas/sessionSchema.js";
import { useActionState, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCoins, faDiamond, faDollarSign, faEnvelope, faGear, faLocationDot, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";

export default function GameAddForm() {

    const initialState = { message: '', data: null };
    const [state, formAction, pending] = useActionState(addGameAction, initialState);
    const [errors, setErrors] = useState({});

    async function handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const raw = Object.fromEntries(formData);

        // validation avec Zod
        const result = sessionSchema.safeParse({
            ...raw,
            buyIn: Number(raw.buyIn || 0),
            smallBlind: Number(raw.smallBlind || 1),
            bigBlind: Number(raw.bigBlind || 2),
            levelDurationMin: Number(raw.levelDurationMin || 10),
            enableBlindTimer: !!raw.enableBlindTimer,
            allowRebuys: !!raw.allowRebuys,
            isPrivate: !!raw.isPrivate,
            sendInvitesNow: !!raw.sendInvitesNow,
        });

        if (!result.success) {
            // on mappe les erreurs par champ
            const fieldErrors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0]; // ex: "title"
                fieldErrors[path] = issue.message;
            });
            setErrors(fieldErrors);
            return;
        }

        // si OK → envoie vers server action
        return formAction(formData);
    }

    return (
        <form onSubmit={handleSubmit} className="form form--session">
            <h2>Game <span className="red">Settings</span></h2>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faDiamond}/> Title <span className="red">*</span></label>
                <input name="title" placeholder="Friday Night Poker" />
                {errors.title && <p className="form__error">{errors.title}</p>}
            </div>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faCalendar}/> Date & Time <span className="red">*</span></label>
                <input type="datetime-local" name="dateTime" />
                {errors.dateTime && <p className="form__error">{errors.dateTime}</p>}
            </div>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faLocationDot}/> Location <span className="red">*</span></label>
                <input name="location" placeholder="Brussels, at John's place" />
                {errors.location && <p className="form__error">{errors.location}</p>}
            </div>

            <div className="form__grid">
                <div className="form__row">
                    <label><FontAwesomeIcon icon={faDollarSign}/> Buy-in</label>
                    <input type="number" min={0} step="1" name="buyIn" />
                    {errors.buyIn && <p className="form__error">{errors.buyIn}</p>}
                </div>
                <div className="form__row">
                    <label>Currency</label>
                    <select name="currency" defaultValue="EUR">
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                    </select>
                    {errors.currency && <p className="form__error">{errors.currency}</p>}
                </div>
            </div>

            <fieldset className="form__fieldset">
                <legend><FontAwesomeIcon icon={faCoins}/> Blinds</legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label>Small Blind</label>
                        <input type="number" min={1} step="1" name="smallBlind" />
                        {errors.smallBlind && <p className="form__error">{errors.smallBlind}</p>}
                    </div>
                    <div className="form__row">
                        <label>Big Blind</label>
                        <input type="number" min={1} step="1" name="bigBlind" />
                        {errors.bigBlind && <p className="form__error">{errors.bigBlind}</p>}
                    </div>
                    <div className="form__row">
                        <label>Level Duration (min)</label>
                        <input type="number" min={1} max={60} step="1" name="levelDurationMin" />
                        {errors.levelDurationMin && <p className="form__error">{errors.levelDurationMin}</p>}
                    </div>
                </div>

                <label className="form__checkbox">
                    <input type="checkbox" name="enableBlindTimer" defaultChecked />
                    <span>Enable blind timer during the session</span>
                </label>
            </fieldset>

            <fieldset className="form__fieldset">
                <legend><FontAwesomeIcon icon={faGear}/> Options</legend>

                <div className="form__row">
                    <label>Max Players</label>
                    <input type="number" min={2} max={20} name="maxPlayers" placeholder="(optional)" />
                    {errors.maxPlayers && <p className="form__error">{errors.maxPlayers}</p>}
                </div>

                <label className="form__checkbox">
                    <input type="checkbox" name="allowRebuys" />
                    <span>Allow rebuys</span>
                </label>

                <label className="form__checkbox">
                    <input type="checkbox" name="isPrivate" defaultChecked />
                    <span>Private session (invite-only)</span>
                </label>
            </fieldset>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faEnvelope}/> Invite by email (comma separated)</label>
                <input name="invitedEmails" placeholder="alice@mail.com, bob@mail.com" />
                {errors.invitedEmails && <p className="form__error">{errors.invitedEmails}</p>}
            </div>

            <label className="form__checkbox">
                <input type="checkbox" name="sendInvitesNow" />
                <span>Send email invitations now</span>
            </label>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faPenToSquare}/> Notes</label>
                <textarea name="notes" rows={4} placeholder="House rules, snacks, parking, etc." />
                {errors.notes && <p className="form__error">{errors.notes}</p>}
            </div>

            <button className="btn btn--full" type="submit" disabled={pending}>
                <FontAwesomeIcon icon={faPlus}/> {pending ? "Creating..." : "Create session"}
            </button>
        </form>
    );
}