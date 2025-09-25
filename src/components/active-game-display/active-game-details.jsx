"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faDollarSign, faFlagCheckered, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faPlayCircle, faRankingStar, faSackDollar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/useAuthStore.js';
import gameService from '@/services/game.service.js';
import { shortDateTime, shortTime } from '@/utils/date.utils.js';
import ActiveGameSkeleton from './active-game-skeleton.jsx';
import { useParams } from 'next/navigation.js';

export default function ActiveGameDetails() {
  const { id } = useParams();
  const user = useAuthStore((state) => state.user)
  user ?? console.log(user);


  const [game, setGame] = useState(null);

  useEffect(() => {
      (async () => {
          const data = await gameService.getById(id);
          setGame(data.game);
        })();
    }, [id]);

  if (!game || game.length === 0) return <ActiveGameSkeleton />;

  console.log(game);

  // Dates
  const timeStart = shortDateTime(game.dateStart);
  const realStart = shortTime(game.realStart);

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <h4 className="subtitle subtitle--card">Hosted by <Link href={'/profile/' + game.host.id}>{game.host.username}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p className="card__status">{game.status}</p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Meet up:</span> {timeStart}</p>
            <p><FontAwesomeIcon icon={faPlayCircle} className="fa-icon" /> <span className="gray">Table start:</span> {realStart}</p>
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
                {game.playerLinks.map((r) => (
                  <li key={r.id}>• {r.userName || r.guestName}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="card__note">
            <h3><FontAwesomeIcon icon={faComment} size="sm" /> Note:</h3>
            <p>{game.description}</p>

          </div>
        </div>
      </div>
    </>
  );
}