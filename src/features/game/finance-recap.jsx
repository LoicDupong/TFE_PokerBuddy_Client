"use client";

import { displayPlayerName } from "@/utils/game.utils.js";
import { formatCents, formatSignedCents } from "@/utils/money.utils.js";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        net: "Net",
        buyIn: "Buy-in",
        rebuys: (p) => `Rebuys (${p.n})`,
        addOns: (p) => `Add-ons (${p.n})`,
        invested: "Invested",
        prizeMoney: "Prize money",
        bountiesWon: "Bounties won",
        finalBounty: "Final bounty",
        totalReceived: "Total received",
        totals: "Totals",
        buyIns: "Buy-ins",
        finalBounties: "Final bounties",
    },
    fr: {
        net: "Net",
        buyIn: "Buy-in",
        rebuys: (p) => `Rebuys (${p.n})`,
        addOns: (p) => `Add-ons (${p.n})`,
        invested: "Investi",
        prizeMoney: "Gains",
        bountiesWon: "Bounties gagnées",
        finalBounty: "Bounty finale",
        totalReceived: "Total reçu",
        totals: "Totaux",
        buyIns: "Buy-ins",
        finalBounties: "Bounties finales",
    },
};

// Récapitulatif financier final (fin de partie et détail d'une partie terminée).
// Un bloc par joueur plutôt qu'un tableau : lisible à 375 px comme sur une TV.
export default function FinanceRecap({ recap, currency = "EUR" }) {
    const { t, intlLocale, locale } = useT(MESSAGES);
    if (!recap?.rows?.length) return null;
    const money = (cents) => formatCents(cents, currency, intlLocale);
    const signed = (cents) => formatSignedCents(cents, currency, intlLocale);
    const { totals } = recap;
    const hasRebuys = totals.rebuyCount > 0;
    const hasAddOns = totals.addOnCount > 0;
    const hasBounties = recap.rows.some((r) => r.bountiesWonCents > 0 || r.finalBountyCents > 0);

    const netClass = (cents) => (cents > 0 ? "fin-net fin-net--plus" : cents < 0 ? "fin-net fin-net--minus" : "fin-net");

    return (
        <div className="fin-recap">
            <ol className="fin-recap__rows">
                {recap.rows.map((r) => (
                    <li key={r.gamePlayerId} className="fin-recap__row">
                        <div className="fin-recap__top">
                            <span className="fin-recap__rank">#{r.rank}</span>
                            <strong className="fin-recap__name">{displayPlayerName(r.name, locale)}</strong>
                            <span className={netClass(r.netCents)} aria-label={`${t("net")} ${signed(r.netCents)}`}>
                                {signed(r.netCents)}
                            </span>
                        </div>
                        <dl className="fin-recap__grid">
                            <div><dt>{t("buyIn")}</dt><dd>{money(r.buyInCents)}</dd></div>
                            {(hasRebuys || r.rebuyCount > 0) && (
                                <div><dt>{t("rebuys", { n: r.rebuyCount })}</dt><dd>{money(r.rebuyCents)}</dd></div>
                            )}
                            {(hasAddOns || r.addOnCount > 0) && (
                                <div><dt>{t("addOns", { n: r.addOnCount })}</dt><dd>{money(r.addOnCents)}</dd></div>
                            )}
                            <div><dt>{t("invested")}</dt><dd>{money(r.investedCents)}</dd></div>
                            <div><dt>{t("prizeMoney")}</dt><dd>{money(r.prizeCents)}</dd></div>
                            {hasBounties && <div><dt>{t("bountiesWon")}</dt><dd>{money(r.bountiesWonCents)}</dd></div>}
                            {hasBounties && <div><dt>{t("finalBounty")}</dt><dd>{money(r.finalBountyCents)}</dd></div>}
                            <div><dt>{t("totalReceived")}</dt><dd>{money(r.receivedCents)}</dd></div>
                        </dl>
                    </li>
                ))}
            </ol>

            <div className="fin-recap__row fin-recap__row--totals">
                <div className="fin-recap__top">
                    <strong className="fin-recap__name">{t("totals")}</strong>
                    <span className="fin-recap__check" data-balanced={recap.balanced ? "yes" : "no"}>
                        {t("net")} {signed(totals.netCents)}
                    </span>
                </div>
                <dl className="fin-recap__grid">
                    <div><dt>{t("buyIns")}</dt><dd>{money(totals.buyInCents)}</dd></div>
                    {hasRebuys && <div><dt>{t("rebuys", { n: totals.rebuyCount })}</dt><dd>{money(totals.rebuyCents)}</dd></div>}
                    {hasAddOns && <div><dt>{t("addOns", { n: totals.addOnCount })}</dt><dd>{money(totals.addOnCents)}</dd></div>}
                    <div><dt>{t("invested")}</dt><dd>{money(totals.investedCents)}</dd></div>
                    <div><dt>{t("prizeMoney")}</dt><dd>{money(totals.prizeCents)}</dd></div>
                    {hasBounties && <div><dt>{t("bountiesWon")}</dt><dd>{money(totals.bountiesWonCents)}</dd></div>}
                    {hasBounties && <div><dt>{t("finalBounties")}</dt><dd>{money(totals.finalBountyCents)}</dd></div>}
                    <div><dt>{t("totalReceived")}</dt><dd>{money(totals.receivedCents)}</dd></div>
                </dl>
            </div>
        </div>
    );
}
