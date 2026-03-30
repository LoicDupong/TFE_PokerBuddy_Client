"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot, faClock, faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import gameService from '@/services/game.service.js';
import { useEffect, useState } from 'react';
import ActiveGameSkeleton from './active-game-skeleton.jsx';

export default function ActiveGameDisplay() {
    const [games, setGames] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await gameService.getAll("today");
            const gamesArray = data?.games || data || [];
            setGames(gamesArray);
        })();
    }, []);

    if (!games || games.length === 0) return <ActiveGameSkeleton />

    return (
        <>
            <h3 className="title--section">
                <span className="red">Today's</span> Games
            </h3>
            <div className="cards cards--active">

                {games.map((g) => {
                    const dateStart = new Date(g.dateStart);
                    return (
                        <div key={g.id} className="card card--active">
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
            </div>
        </>
    )
}