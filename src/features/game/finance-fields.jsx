"use client";

import { formatCents, parseAmountToCents, splitBounty } from "@/utils/money.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        allowRebuys: "Allow rebuys and add-ons",
        rebuyPrice: "Rebuy / add-on price",
        sameAsBuyIn: "Same as the buy-in",
        sameAsBuyInWith: (p) => `Same as the buy-in (${p.amount})`,
        rebuyCosts: (p) => `A rebuy costs ${p.amount}. `,
        hostCanChange: "The host can still change the amount when recording one.",
        pko: "Progressive knockout (PKO): a bounty on every head",
        bountyShare: "Bounty share (%)",
        paidAtOnce: "Paid out at once (%)",
        entryExample: (p) => `${p.buyIn} buy-in: ${p.prize} prize pool, ${p.bounty} bounty.`,
        bountyExample: (p) => `${p.bounty} bounty: ${p.now} now, ${p.head} on the knocker's head.`,
    },
    fr: {
        allowRebuys: "Autoriser les rebuys et les add-ons",
        rebuyPrice: "Prix d'un rebuy / add-on",
        sameAsBuyIn: "Identique au buy-in",
        sameAsBuyInWith: (p) => `Identique au buy-in (${p.amount})`,
        rebuyCosts: (p) => `Un rebuy coûte ${p.amount}. `,
        hostCanChange: "L'hôte peut toujours modifier le montant au moment de l'enregistrer.",
        pko: "Knockout progressif (PKO) : une bounty sur chaque tête",
        bountyShare: "Part de bounty (%)",
        paidAtOnce: "Versé immédiatement (%)",
        entryExample: (p) => `Buy-in de ${p.buyIn} : ${p.prize} pour le prize pool, ${p.bounty} de bounty.`,
        bountyExample: (p) => `Bounty de ${p.bounty} : ${p.now} tout de suite, ${p.head} sur la tête du vainqueur du KO.`,
    },
};

// Rebuys / add-ons et PKO : partagé entre la création et l'édition d'une partie.
// values = { allowRebuys, rebuyAmount, pkoEnabled, pkoBountyPercent, pkoCashPercent }
export default function FinanceFields({ values, onChange, buyIn = 0, currency = "EUR", fieldError, errProps }) {
    const { t, intlLocale } = useT(MESSAGES);
    const money = (cents) => formatCents(cents, currency, intlLocale);
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
                <span>{t("allowRebuys")}</span>
            </label>

            {values.allowRebuys && (
                <div className="form__row">
                    <label htmlFor="rebuyAmount">{t("rebuyPrice")}</label>
                    <input
                        id="rebuyAmount"
                        name="rebuyAmount"
                        type="text"
                        inputMode="decimal"
                        placeholder={buyInCents ? t("sameAsBuyInWith", { amount: money(buyInCents) }) : t("sameAsBuyIn")}
                        value={values.rebuyAmount}
                        onChange={(e) => onChange("rebuyAmount", e.target.value)}
                        {...props("rebuyAmount")}
                    />
                    {err("rebuyAmount")}
                    <p className="gray">
                        {rebuyCents ? t("rebuyCosts", { amount: money(rebuyCents) }) : ""}
                        {t("hostCanChange")}
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
                <span>{t("pko")}</span>
            </label>

            {values.pkoEnabled && (
                <div className="form__row">
                    <div className="form__grid">
                        <div className="form__row">
                            <label htmlFor="pkoBountyPercent">{t("bountyShare")}</label>
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
                            <label htmlFor="pkoCashPercent">{t("paidAtOnce")}</label>
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
                            {t("entryExample", { buyIn: money(buyInCents), prize: money(entry.prize), bounty: money(entry.bounty) })}
                            <br />
                            {t("bountyExample", { bounty: money(entry.bounty), now: money(cashNow), head: money(entry.bounty - cashNow) })}
                        </p>
                    )}
                </div>
            )}
        </>
    );
}
