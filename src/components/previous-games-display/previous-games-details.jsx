"use client";

import gameService from "@/services/game.service.js";
import { shortDateTime } from "@/utils/date.utils.js";
import { faComment, faCrown, faDollarSign, faFlagCheckered, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faRankingStar, faSackDollar, faStar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useParams } from "next/navigation.js";
import { useEffect, useState } from "react";
import PreviousGamesSkeleton from "./previous-games-skeleton.jsx";

export default function PreviousGameDetails() {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  
  useEffect(() => {
      (async () => {
          const data = await gameService.getById(id);
          setGame(data.game);
        })();
    }, [id]);
    
    console.log(game);
    if (!game) return <p>Loading...</p>;
    
    if (!game || game.length === 0) return <PreviousGamesSkeleton />;
  // Dates
  const timeStart = shortDateTime(game.dateStart);
  const timeEnd = shortDateTime(game.dateEnd);

  //Winner
  const winner = game.results?.find(r => r.rank === 1)?.player;

  return (
    <>
      <h1>Game Details</h1>
      <div className="divider"></div>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <h4 className="subtitle subtitle--card">Hosted by <Link href={'/profile/' + game.host.id}>{game.host.username}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p className="card__status">{game.status}</p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Started:</span> {timeStart}</p>
            <p><FontAwesomeIcon icon={faHourglassEnd} className="fa-icon" /> <span className="gray">Ended:</span> {timeEnd}</p>
            <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span>{" "}
              {winner ? (
                <Link href={`/profile/${winner.user.id}`} className="title--winner"><span className="title--winner">{winner.user.username}</span></Link>
              ) : "N/A"}</p>
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> {game.playerLinks.length}</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">Level 1:</span> Blinds {game.smallBlind}/{game.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {game.buyIn}€</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Prize Pool:</span> {game.prizePool}€</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">Places Paid:</span> {game.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">Prize Distribution:</span></p>
            <ul>
              {game.payoutDistribution.map((p) => (
                <li key={p.place}>{p.place}. {(game.prizePool * p.percent) / 100}€</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>Players list</h3>
              <ul>
                {game.results.map((r) => (
                  <li key={r.id}>{r.rank}. {r.player.userName} {r.rank == 1 ? <FontAwesomeIcon icon={faCrown} className="fa-icon" /> : ""}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="card__stats">
            <h3><FontAwesomeIcon icon={faStar} size="sm" /> Extras</h3>
            <div className="last__hand"><p><span className="gray">Last Hand: </span>Suited AK</p></div>
            <div className="largest__allin"><p><span className="gray">Largest All in: </span>10K</p></div>
            <div className="card__note">
              <h3><FontAwesomeIcon icon={faComment} size="sm" /> Note:</h3>
              <p>{game.description}</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}