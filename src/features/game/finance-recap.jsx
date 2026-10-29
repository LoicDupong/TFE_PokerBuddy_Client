"use client";

import { displayPlayerName } from "@/utils/game.utils.js";
import { formatCents, formatSignedCents } from "@/utils/money.utils.js";

// Récapitulatif financier final (fin de partie et détail d'une partie terminée).
// Un bloc par joueur plutôt qu'un tableau : lisible à 375 px comme sur une TV.
export default function FinanceRecap({ recap, currency = "EUR" }) {
    if (!recap?.rows?.length) return null;
    const money = (cents) => formatCents(cents, currency);
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
                            <strong className="fin-recap__name">{displayPlayerName(r.name)}</strong>
                            <span className={netClass(r.netCents)} aria-label={`Net ${formatSignedCents(r.netCents, currency)}`}>
                                {formatSignedCents(r.netCents, currency)}
                            </span>
                        </div>
                        <dl className="fin-recap__grid">
                            <div><dt>Buy-in</dt><dd>{money(r.buyInCents)}</dd></div>
                            {(hasRebuys || r.rebuyCount > 0) && (
                                <div><dt>Rebuys ({r.rebuyCount})</dt><dd>{money(r.rebuyCents)}</dd></div>
                            )}
                            {(hasAddOns || r.addOnCount > 0) && (
                                <div><dt>Add-ons ({r.addOnCount})</dt><dd>{money(r.addOnCents)}</dd></div>
                            )}
                            <div><dt>Invested</dt><dd>{money(r.investedCents)}</dd></div>
                            <div><dt>Prize money</dt><dd>{money(r.prizeCents)}</dd></div>
                            {hasBounties && <div><dt>Bounties won</dt><dd>{money(r.bountiesWonCents)}</dd></div>}
                            {hasBounties && <div><dt>Final bounty</dt><dd>{money(r.finalBountyCents)}</dd></div>}
                            <div><dt>Total received</dt><dd>{money(r.receivedCents)}</dd></div>
                        </dl>
                    </li>
                ))}
            </ol>

            <div className="fin-recap__row fin-recap__row--totals">
                <div className="fin-recap__top">
                    <strong className="fin-recap__name">Totals</strong>
                    <span className="fin-recap__check" data-balanced={recap.balanced ? "yes" : "no"}>
                        Net {formatSignedCents(totals.netCents, currency)}
                    </span>
                </div>
                <dl className="fin-recap__grid">
                    <div><dt>Buy-ins</dt><dd>{money(totals.buyInCents)}</dd></div>
                    {hasRebuys && <div><dt>Rebuys ({totals.rebuyCount})</dt><dd>{money(totals.rebuyCents)}</dd></div>}
                    {hasAddOns && <div><dt>Add-ons ({totals.addOnCount})</dt><dd>{money(totals.addOnCents)}</dd></div>}
                    <div><dt>Invested</dt><dd>{money(totals.investedCents)}</dd></div>
                    <div><dt>Prize money</dt><dd>{money(totals.prizeCents)}</dd></div>
                    {hasBounties && <div><dt>Bounties won</dt><dd>{money(totals.bountiesWonCents)}</dd></div>}
                    {hasBounties && <div><dt>Final bounties</dt><dd>{money(totals.finalBountyCents)}</dd></div>}
                    <div><dt>Total received</dt><dd>{money(totals.receivedCents)}</dd></div>
                </dl>
            </div>
        </div>
    );
}
