"use client";

import { formatCents, parseAmountToCents, splitBounty } from "@/utils/money.utils.js";

// Rebuys / add-ons et PKO : partagé entre la création et l'édition d'une partie.
// values = { allowRebuys, rebuyAmount, pkoEnabled, pkoBountyPercent, pkoCashPercent }
export default function FinanceFields({ values, onChange, buyIn = 0, currency = "EUR", fieldError, errProps }) {
    const err = fieldError ?? (() => null);
    const props = errProps ?? (() => ({}));
    const buyInCents = Math.round((Number(buyIn) || 0) * 100);
    const bountyPercent = Number(values.pkoBountyPercent);
    const cashPercent = Number(values.pkoCashPercent);
    const percentsOk = Number.isInteger(bountyPercent) && Number.isInteger(cashPercent)
        && bountyPercent >= 0 && bountyPercent <= 100 && cashPercent >= 0 && cashPercent <= 100;
    const entry = splitBounty(buyInCents, bountyPercent);
    // Exemple d'un KO sur une bounty de la taille de celle d'un buy-in
    const cashNow = Math.floor((entry.bounty * cashPercent) / 100);
    const rebuyCents = parseAmountToCents(values.rebuyAmount);

    return (
        <>
            <label className="form__checkbox">
                <input
                    type="checkbox"
                    name="allowRebuys"
                    checked={values.allowRebuys}
                    onChange={(e) => onChange("allowRebuys", e.target.checked)}
                />
                <span>Allow rebuys and add-ons</span>
            </label>

            {values.allowRebuys && (
                <div className="form__row">
                    <label htmlFor="rebuyAmount">Rebuy / add-on price</label>
                    <input
                        id="rebuyAmount"
                        name="rebuyAmount"
                        type="text"
                        inputMode="decimal"
                        placeholder={`Same as the buy-in${buyInCents ? ` (${formatCents(buyInCents, currency)})` : ""}`}
                        value={values.rebuyAmount}
                        onChange={(e) => onChange("rebuyAmount", e.target.value)}
                        {...props("rebuyAmount")}
                    />
                    {err("rebuyAmount")}
                    <p className="gray">
                        {rebuyCents ? `A rebuy costs ${formatCents(rebuyCents, currency)}. ` : ""}
                        The host can still change the amount when recording one.
                    </p>
                </div>
            )}

            <label className="form__checkbox">
                <input
                    type="checkbox"
                    name="pkoEnabled"
                    checked={values.pkoEnabled}
                    onChange={(e) => onChange("pkoEnabled", e.target.checked)}
                />
                <span>Progressive knockout (PKO): a bounty on every head</span>
            </label>

            {values.pkoEnabled && (
                <div className="form__row">
                    <div className="form__grid">
                        <div className="form__row">
                            <label htmlFor="pkoBountyPercent">Bounty share (%)</label>
                            <input
                                id="pkoBountyPercent"
                                name="pkoBountyPercent"
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={values.pkoBountyPercent}
                                onChange={(e) => onChange("pkoBountyPercent", e.target.value)}
                                {...props("pkoBountyPercent")}
                            />
                            {err("pkoBountyPercent")}
                        </div>
                        <div className="form__row">
                            <label htmlFor="pkoCashPercent">Paid out at once (%)</label>
                            <input
                                id="pkoCashPercent"
                                name="pkoCashPercent"
                                type="number"
                                min={0}
                                max={100}
                                step={1}
                                value={values.pkoCashPercent}
                                onChange={(e) => onChange("pkoCashPercent", e.target.value)}
                                {...props("pkoCashPercent")}
                            />
                            {err("pkoCashPercent")}
                        </div>
                    </div>
                    {percentsOk && buyInCents > 0 && (
                        <p className="gray" role="status">
                            {`${formatCents(buyInCents, currency)} buy-in: ${formatCents(entry.prize, currency)} prize pool, ${formatCents(entry.bounty, currency)} bounty.`}
                            <br />
                            {`${formatCents(entry.bounty, currency)} bounty: ${formatCents(cashNow, currency)} now, ${formatCents(entry.bounty - cashNow, currency)} on the knocker's head.`}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
