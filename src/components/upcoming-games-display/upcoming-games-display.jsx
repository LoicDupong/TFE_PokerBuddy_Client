"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot, faClock, faPlus, faCircleInfo, faMinus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import gameService from '@/services/game.service.js';
import { useEffect, useState } from 'react';
import UpcomingGamesSkeleton from './upcoming-games-skeleton.jsx';
import { usePathname } from 'next/navigation.js';

export default function UpcomingGamesDisplay() {
  const [games, setGames] = useState(null);
  const [isExpand, setIsExpand] = useState(false);
  const pathname = usePathname();
  console.log(games);

  useEffect(() => {
    (async () => {
      const data = await gameService.getAll("upcoming");
      const gamesArray = data?.games || data;
      const pendingGame = gamesArray.filter(d => d.status === "pending")
      setGames(pendingGame);

    })();
  }, []);

  if (!games || games.length === 0) return <UpcomingGamesSkeleton />;

  if (pathname !== "games") {
    const dateStart = new Date(games[0].dateStart);
    return (
      <div className="cards cards--planned">
        <div className="card card--planned">
          <div className="card__header">
            <h3 className="title title--card">{games[0].name} <br /> -{" "}
              {dateStart.toLocaleDateString("fr-FR", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
              })}</h3>
            <h4 className="subtitle subtitle--card">Host: {games[0].host.username}</h4>
          </div>
          <div className="card__body">
            <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {games[0].location}</p>
            <p><FontAwesomeIcon icon={faClock} className="fa-icon" /> <span className="gray">Meet up:</span> {dateStart.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Table start:</span> {dateStart.toLocaleTimeString("fr-FR", {
              hour: "2-digit",
              minute: "2-digit",
            })}</p>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {games[0].buyIn}€</p>
            <Link href={"games/" + games[0].id}>
              <div className="btn btn--card"><FontAwesomeIcon icon={faCircleInfo} /> More infos</div>
            </Link>
          </div>
        </div>
        {/* Si expand est actif → on affiche toutes sauf la première */}
        {isExpand && games.slice(1).map((g) => {
          const dateStart = new Date(g.dateStart);
          return (
            <div key={g.id} className="card card--planned">
              <div className="card__header">
                <h3 className="title title--card">
                  {g.name} <br /> -{" "}
                  {dateStart.toLocaleDateString("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                </h3>
                <h4 className="subtitle subtitle--card">Host: {g.host.username}</h4>
              </div>
              <div className="card__body">
                <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {g.location}</p>
                <p><FontAwesomeIcon icon={faClock} className="fa-icon" />
                  <span className="gray"> Meet up:</span> {dateStart.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" />
                  <span className="gray"> Table start:</span> {dateStart.toLocaleTimeString("fr-FR", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" />
                  <span className="gray"> Entry price:</span> {g.buyIn}€
                </p>
                <Link href={"games/" + g.id}>
                  <div className="btn btn--card"><FontAwesomeIcon icon={faCircleInfo} /> More infos</div>
                </Link>
              </div>
            </div>
          )
        })}

        {/* Bouton toggle */}
        {games.length > 1 && (
          <div className="card card--plus" onClick={() => setIsExpand(!isExpand)}>
            {isExpand ? (
              <p><FontAwesomeIcon icon={faMinus} /> Show less</p>
            ) : (
              <p><FontAwesomeIcon icon={faPlus} /> Show more ({games.length - 1})</p>
            )}
          </div>
        )}


      </div>
    )
  }

  return (
    <div className="cards cards--planned">

      {games.map((g) => {
        const dateStart = new Date(g.dateStart);
        return (
          <div key={g.id} className="card card--planned">
            <div className="card__header">
              <h3 className="title title--card">{g.name} <br /> -{" "}
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