"use client";

import gameService from "@/services/game.service.js";
import gameFinanceService from "@/services/gameFinance.service.js";
import FinanceRecap from "@/features/game/finance-recap.jsx";
import { formatCents } from "@/utils/money.utils.js";
import { relativeDateTime, shortDateTime } from "@/utils/date.utils.js";
import { currencySymbol, getPayouts, getPrizePool, resultPrize } from "@/utils/game.utils.js";
import { faComment, faCrown, faDollarSign, faFlagCheckered, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faRankingStar, faSackDollar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useParams } from "next/navigation.js";
import { useEffect, useState } from "react";
import PreviousGamesSkeleton from "./previous-games-skeleton.jsx";
import { useGameT, useGameStatusLabel } from "@/utils/game-labels.utils.js";
import { useDisplayName } from "@/utils/player-name.utils.js";

// actions : boutons affichés sous le titre (ex: "Submit results" pour l'hôte)
export default function PreviousGameDetails({ actions = null }) {
  const { t, locale, intlLocale } = useGameT();
  const displayName = useDisplayName();
  const statusLabel = useGameStatusLabel();
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [recap, setRecap] = useState(null);


  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data?.game ?? null);
    })();
  }, [id]);

  // Recap financier (parties suivies par le Game Manager) ; les anciennes parties n'en ont pas
  const finished = game?.status === "finished";
  useEffect(() => {
    if (!finished) return;
    let cancelled = false;
    gameFinanceService.get(id).then((res) => {
      if (!cancelled && res.success) setRecap(res.data.finance.recap ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [id, finished]);

  if (!game || game.length === 0) return <PreviousGamesSkeleton />;
  // Dates
  const timeStart = shortDateTime(game.dateStart, intlLocale);
  const timeEnd = shortDateTime(game.dateEnd, intlLocale);

  //Winner
  const winner = game.results?.find(r => r.rank === 1)?.player;
  // Gains réellement distribués (ou estimation si les résultats ne sont pas encore saisis)
  const prizePool = getPrizePool(game);
  const payouts = getPayouts(game, prizePool);
  const cur = currencySymbol(game.currency);
  // Parties avec centimes : montants a 2 decimales ; anciennes parties : affichage inchange
  const hasCents = (game.results || []).some((r) => r.prizeCents != null);
  const money = (units) => (hasCents ? formatCents(Math.round(units * 100), game.currency) : `${units}${cur}`);

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <p className="card__when">{relativeDateTime(game.dateEnd || game.dateStart, locale)}</p>
          <h4 className="subtitle subtitle--card">{t("hostedBy")} <Link href={'/profile/' + game.host.id}>{displayName(game.host.username)}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p><span className={`chip chip--${game.status}`}>{statusLabel(game.status)}</span></p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">{t("started")}</span> {timeStart}</p>
            <p><FontAwesomeIcon icon={faHourglassEnd} className="fa-icon" /> <span className="gray">{t("ended")}</span> {timeEnd}</p>
            <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">{t("winner")}</span>{" "}
              {winner ? (
                winner.user
                  ? <Link href={`/profile/${winner.user.id}`} className="title--winner"><span className="title--winner">{displayName(winner.user.username)}</span></Link>
                  : <span className="title--winner">{displayName(winner.guestName)}</span>
              ) : t("na")}</p>
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">{t("players")}</span> {game.results?.length || game.playerLinks.length}</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">{t("level1")}</span> {t("blinds")} {game.smallBlind}/{game.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">{t("entry")}</span> {game.buyIn}{cur}</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">{t("prizePool")}</span> {money(prizePool)}</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">{t("placesPaid")}</span> {payouts.length || game.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">{t("distribution")}</span></p>
            <ul>
              {payouts.map((p) => (
                <li key={p.place}>{p.place}. {money(p.amount)}</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>{t("playersList")}</h3>
              <ul>
                {game.results
                  .slice()
                  .sort((a, b) => a.rank - b.rank)
                  .map((r) => (
                    <li key={r.id}>
                      {r.rank}. {displayName(r.player.user?.username || r.player.guestName)}
                      {r.rank === 1 && <FontAwesomeIcon icon={faCrown} className="fa-icon" />}
                      {resultPrize(r) > 0 && <span className="gray"> — {money(resultPrize(r))}</span>}
                    </li>
                  ))}
              </ul>

            </div>
          </div>

          {recap && (
            <>
              <div className="divider"></div>
              <div className="card__list">
                <h3>{t("money")}</h3>
                <FinanceRecap recap={recap} currency={game.currency} />
              </div>
            </>
          )}

          {game.description?.trim() && (
            <>
              <div className="divider"></div>
              <div className="card__note">
                <h3><FontAwesomeIcon icon={faComment} size="sm" /> {t("note")}</h3>
                <p>{game.description}</p>
              </div>
            </>
          )}
        </div>
      </div>
      {actions}
    </>
  );
}