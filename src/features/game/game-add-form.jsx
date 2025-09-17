'use client';

import { addGameAction } from "@/actions/game.action.js";
import { sessionSchema } from "@/schemas/sessionSchema.js";
import { useActionState, useState } from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendar, faCoins, faDiamond, faDollarSign, faEnvelope, faGear, faLocationDot, faPenToSquare, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getFieldError } from "@/utils/getFieldError.utils.js";

export default function GameAddForm() {

    const initialState = { success: false, message: '', data: null };
    const [state, handleForm, pending] = useActionState(addGameAction, initialState);

    //TODO: redirect vers la page by Id de la session
    if (state?.success) {
        redirect("/games/123");
    }

    return (
        <form action={handleForm} className="form form--session">
            <h2>Game <span className="red">Settings</span></h2>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faDiamond} /> Title <span className="red">*</span></label>
                <input name="title" placeholder="Friday Night Poker" defaultValue={state?.data?.title || ""} />
                {getFieldError(state?.errorMessage, "title") && (
                    <p className="form__error">{getFieldError(state?.errorMessage, "title")}</p>
                )}
            </div>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faCalendar} /> Date & Time <span className="red">*</span></label>
                <input type="datetime-local" name="dateTime" defaultValue={state?.data?.dateTime || ""}/>
                {getFieldError(state?.errorMessage, "dateTime") && (
                    <p className="form__error">{getFieldError(state?.errorMessage, "dateTime")}</p>
                )}
            </div>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faLocationDot} /> Location <span className="red">*</span></label>
                <input name="location" placeholder="Brussels, at John's place" defaultValue={state?.data?.location || ""}/>
                {getFieldError(state?.errorMessage, "location") && (
                    <p className="form__error">{getFieldError(state?.errorMessage, "location")}</p>
                )}
            </div>

            <div className="form__grid">
                <div className="form__row">
                    <label><FontAwesomeIcon icon={faDollarSign} /> Buy-in</label>
                    <input type="number" min={0} step="1" name="buyIn" defaultValue={state?.data?.buyIn || ""}/>
                    {getFieldError(state?.errorMessage, "buyIn") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "buyIn")}</p>
                    )}
                </div>
                <div className="form__row">
                    <label>Currency</label>
                    <select name="currency" defaultValue="EUR">
                        <option value="EUR">EUR</option>
                        <option value="USD">USD</option>
                        <option value="GBP">GBP</option>
                    </select>
                    {getFieldError(state?.errorMessage, "currency") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "currency")}</p>
                    )}
                </div>
            </div>

            <fieldset className="form__fieldset">
                <legend><FontAwesomeIcon icon={faCoins} /> Blinds</legend>
                <div className="form__grid">
                    <div className="form__row">
                        <label>Small Blind</label>
                        <input type="number" min={1} step="1" name="smallBlind" defaultValue={state?.data?.smallBlind || ""}/>
                        {getFieldError(state?.errorMessage, "smallBlind") && (
                            <p className="form__error">{getFieldError(state?.errorMessage, "smallBlind")}</p>
                        )}
                    </div>
                    <div className="form__row">
                        <label>Big Blind</label>
                        <input type="number" min={1} step="1" name="bigBlind" defaultValue={state?.data?.bigBlind || ""}/>
                        {getFieldError(state?.errorMessage, "bigBlind") && (
                            <p className="form__error">{getFieldError(state?.errorMessage, "bigBlind")}</p>
                        )}
                    </div>
                    <div className="form__row">
                        <label>Level Duration (min)</label>
                        <input type="number" min={1} max={60} step="1" name="levelDurationMin" defaultValue={state?.data?.levelDurationMin || ""}/>
                        {getFieldError(state?.errorMessage, "levelDurationMin") && (
                            <p className="form__error">{getFieldError(state?.errorMessage, "levelDurationMin")}</p>
                        )}
                    </div>
                </div>

                <label className="form__checkbox">
                    <input type="checkbox" name="enableBlindTimer" defaultChecked />
                    <span>Enable blind timer during the session</span>
                </label>
            </fieldset>

            <fieldset className="form__fieldset">
                <legend><FontAwesomeIcon icon={faGear} /> Options</legend>

                <div className="form__row">
                    <label>Max Players</label>
                    <input type="number" min={2} max={20} name="maxPlayers" placeholder="(optional)" defaultValue={state?.data?.maxPlayers || ""}/>
                    {getFieldError(state?.errorMessage, "maxPlayers") && (
                        <p className="form__error">{getFieldError(state?.errorMessage, "maxPlayers")}</p>
                    )}
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
                <label><FontAwesomeIcon icon={faEnvelope} /> Invite by email (comma separated)</label>
                <input name="invitedEmails" placeholder="alice@mail.com, bob@mail.com" defaultValue={state?.data?.invitedEmails || ""}/>
                {getFieldError(state?.errorMessage, "invitedEmails") && (
                    <p className="form__error">{getFieldError(state?.errorMessage, "invitedEmails")}</p>
                )}
            </div>

            <label className="form__checkbox">
                <input type="checkbox" name="sendInvitesNow" />
                <span>Send email invitations now</span>
            </label>

            <div className="form__row">
                <label><FontAwesomeIcon icon={faPenToSquare} /> Notes</label>
                <textarea name="notes" rows={4} placeholder="House rules, snacks, parking, etc." defaultValue={state?.data?.notes || ""}/>
                {getFieldError(state?.errorMessage, "notes") && (
                    <p className="form__error">{getFieldError(state?.errorMessage, "notes")}</p>
                )}
            </div>

            <button className="btn btn--full" type="submit" disabled={pending}>
                <FontAwesomeIcon icon={faPlus} /> {pending ? "Creating..." : "Create session"}
            </button>
        </form>
    );
}