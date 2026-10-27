"use client";

import gameService from "@/services/game.service.js";
import { relativeDateTime, shortDateTime } from "@/utils/date.utils.js";
import { gameStatusLabel, currencySymbol, getPayouts, getPrizePool } from "@/utils/game.utils.js";
import { faComment, faCrown, faDollarSign, faFlagCheckered, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faRankingStar, faSackDollar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useParams } from "next/navigation.js";
import { useEffect, useState } from "react";
import PreviousGamesSkeleton from "./previous-games-skeleton.jsx";

// actions : boutons affichés sous le titre (ex: "Submit results" pour l'hôte)
export default function PreviousGameDetails({ actions = null }) {
  const { id } = useParams();
  const [game, setGame] = useState(null);


  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data?.game ?? null);
    })();
  }, [id]);

  if (!game || game.length === 0) return <PreviousGamesSkeleton />;
  // Dates
  const timeStart = shortDateTime(game.dateStart);
  const timeEnd = shortDateTime(game.dateEnd);

  //Winner
  const winner = game.results?.find(r => r.rank === 1)?.player;
  // Gains réellement distribués (ou estimation si les résultats ne sont pas encore saisis)
  const prizePool = getPrizePool(game);
  const payouts = getPayouts(game, prizePool);
  const cur = currencySymbol(game.currency);

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <p className="card__when">{relativeDateTime(game.dateEnd || game.dateStart)}</p>
          <h4 className="subtitle subtitle--card">Hosted by <Link href={'/profile/' + game.host.id}>{game.host.username}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p><span className={`chip chip--${game.status}`}>{gameStatusLabel(game.status)}</span></p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Started:</span> {timeStart}</p>
            <p><FontAwesomeIcon icon={faHourglassEnd} className="fa-icon" /> <span className="gray">Ended:</span> {timeEnd}</p>
            <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span>{" "}
              {winner ? (
                winner.user
                  ? <Link href={`/profile/${winner.user.id}`} className="title--winner"><span className="title--winner">{winner.user.username}</span></Link>
                  : <span className="title--winner">{winner.guestName}</span>
              ) : "N/A"}</p>
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Players:</span> {game.results?.length || game.playerLinks.length}</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">Level 1:</span> Blinds {game.smallBlind}/{game.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {game.buyIn}{cur}</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Prize pool:</span> {prizePool}{cur}</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">Places paid:</span> {payouts.length || game.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">Prize distribution:</span></p>
            <ul>
              {payouts.map((p) => (
                <li key={p.place}>{p.place}. {p.amount}{cur}</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>Players list</h3>
              <ul>
                {game.results
                  .slice()
                  .sort((a, b) => a.rank - b.rank)
                  .map((r) => (
                    <li key={r.id}>
                      {r.rank}. {r.player.user?.username || r.player.guestName}
                      {r.rank === 1 && <FontAwesomeIcon icon={faCrown} className="fa-icon" />}
                      {r.prize > 0 && <span className="gray"> — {r.prize}{cur}</span>}
                    </li>
                  ))}
              </ul>

            </div>
          </div>

          {game.description?.trim() && (
            <>
              <div className="divider"></div>
              <div className="card__note">
                <h3><FontAwesomeIcon icon={faComment} size="sm" /> Note:</h3>
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