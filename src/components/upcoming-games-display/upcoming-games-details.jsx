"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faCrown, faDollarSign, faFlagCheckered, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faRankingStar, faSackDollar, faStar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/useAuthStore.js';
import UpcomingGamesSkeleton from './upcoming-games-skeleton.jsx';
import gameService from '@/services/game.service.js';
import { shortDateTime } from '@/utils/date.utils.js';

export default function UpcomingGamesDetails() {

  const user = useAuthStore((state) => state.user)
  user ?? console.log(user);


  const [games, setGames] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await gameService.getAll();
      const gamesArray = data?.games || data;
      const pendingGame = gamesArray.filter(d => d.status === "pending")
      setGames(...pendingGame);

    })();
  }, []);

  if (!games || games.length === 0) return <UpcomingGamesSkeleton />;

  console.log(games);

  // Dates
  const timeStart = shortDateTime(games.dateStart);
  const timeEnd = shortDateTime(games.dateEnd);

  //Winner
  const winner = games.results?.find(r => r.rank === 1)?.player;



  return (
    <>
      <h1>Game Details</h1>
      <div className="divider"></div>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{games.name}</h3>
          <h4 className="subtitle subtitle--card">Hosted by <Link href={'/profile/' + games.host.id}>{games.host.username}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p className="card__status">{games.status}</p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Started:</span> {timeStart}</p>
            <p><FontAwesomeIcon icon={faHourglassEnd} className="fa-icon" /> <span className="gray">Ended:</span> {timeEnd}</p>
            <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span>{" "}
              {winner ? (
                <Link href={`/profile/${winner.user.id}`} className="title--winner"><span className="title--winner">{winner.user.username}</span></Link>
              ) : "N/A"}</p>
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> {games.results.length}</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">Level 1:</span> Blinds {games.smallBlind}/{games.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {games.buyIn}€</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Prize Pool:</span> {games.prizePool}€</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">Places Paid:</span> {games.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">Prize Distribution:</span></p>
            <ul>
              {games.payoutDistribution.map((p) => (
                <li key={p.place}>{p.place}. {(games.prizePool * p.percent) / 100}€</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>Players list</h3>
              <ul>
                {games.results.map((r) => (
                  <li key={r.id}>• {r.player.userName}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="card__note">
            <h3><FontAwesomeIcon icon={faComment} size="sm" /> Note:</h3>
            <p>{games.description}</p>

          </div>
        </div>
      </div>
    </>
  );
}