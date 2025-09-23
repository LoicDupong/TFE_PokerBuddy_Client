"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot, faClock, faPlus, faCircleInfo, faBorderNone } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import gameService from '@/services/game.service.js';
import { useEffect, useState } from 'react';
import useAuthStore from '@/stores/useAuthStore.js';

export function UpcomingGamesSkeleton() {
  return (
    <div className="cards cards--planned">
      <div className="card card--planned">
        <div className="card__body">
          <p><FontAwesomeIcon icon={faBorderNone} className="fa-icon" /> No upcoming games found...</p>
        </div>
      </div>
    </div>
  )
}

export default function UpcomingGamesDisplay() {

  const user = useAuthStore((state) => state.user)
  user ?? console.log(user);


  const [games, setGames] = useState(null);
  console.log(games);

  useEffect(() => {
    (async () => {
      const data = await gameService.getAll();
      const gamesArray = data?.games || data;
      const pendingGame = gamesArray.filter(d => d.status === "pending")
      setGames(pendingGame);

    })();
  }, []);

  if (!games || games.length === 0) return <UpcomingGamesSkeleton />;

  return (
    <div className="cards cards--planned">

      {games.map((g) => {
        const dateStart = new Date(g.dateStart);
        return (
          <div key={g.id} className="card card--planned">
            <div className="card__header">
              <h3 className="title title--card">{g.name} -{" "}
                {dateStart.toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}</h3>
              <h4 className="subtitle subtitle--card">Host: {g.host.username}</h4>
            </div>
            <div className="card__body">
              <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {g.location}</p>
              <p><FontAwesomeIcon icon={faClock} className="fa-icon" /> <span className="gray">Meet up:</span> {dateStart.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Table start:</span> {dateStart.toLocaleTimeString("fr-FR", {
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
              <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {g.buyIn}€</p>
              <Link href={"games/" + g.id}>
                <div className="btn btn--card"><FontAwesomeIcon icon={faCircleInfo} /> More infos</div>
              </Link>
            </div>
          </div>
        )
      })}


      {/* // Si + d'une game, affiche le bouton "more" */}
      {games.length > 1 && (
        <div className="card card--plus">
          <p><FontAwesomeIcon icon={faPlus} /> {games.length - 1} more...</p>
        </div>
      )}

    </div>
  )
}