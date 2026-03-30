"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTrophy, faUserGroup, faSackDollar, faChartBar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import gameService from '@/services/game.service.js';
import PreviousGamesSkeleton from './previous-games-skeleton.jsx';
import { usePathname } from 'next/navigation.js';


export default function PreviousGamesDisplay() {
    const [games, setGames] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        (async () => {
            const data = await gameService.getAll("finished");
            const gamesArray = data?.games || data || [];
            setGames(gamesArray);
        })();
    }, []);

    if (!games || games.length === 0) return <PreviousGamesSkeleton />;

    if (pathname !== "/games/history") {
        const displayDate = new Date(games[0].dateEnd || games[0].dateStart);
        const winner = games[0].results?.find(r => r.rank === 1)?.player;

        return (
            <div className="cards cards--previous">

                <div className="card card--previous">
                    <div className="card__header">
                        <h3 className="title title--card">{games[0].name} -{" "}
                            {displayDate.toLocaleDateString("fr-FR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                            })}
                        </h3>
                        <h4 className="subtitle subtitle--card">Host: {games[0].host.username}</h4>
                    </div>
                    <div className="card__body">
                        {games[0].status === "finished" ? (
                            <>
                                <p>
                                    <FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span>{" "}
                                    {winner ? (
                                        winner.user
                                            ? <Link href={`/profile/${winner.user.id}`}><span className="title--winner">{winner.user.username}</span></Link>
                                            : <span className="title--winner">{winner.guestName || "Guest"}</span>
                                    ) : "N/A"}
                                </p>
                                <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> {games[0].results?.length || 0}</p>
                                <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {games[0].buyIn}€</p>
                                <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Total Cash Prize:</span> {games[0].prizePool}€</p>
                                <div className="card__actions">
                                    <Link href={`/games/${games[0].id}`}>
                                        <div className="btn btn--card"><FontAwesomeIcon icon={faChartBar} /> More stats</div>
                                    </Link>
                                </div>
                            </>
                        ) : (
                            <>
                                <p className="text--pending">Details update in progress...</p>
                                <Link href={`/games/${games[0].id}`}>
                                    <div className="btn btn--card">View game</div>
                                </Link>
                            </>
                        )}
                    </div>
                </div>
                <Link href={"/games/history"}>
                    <div className="card card--plus">
                        <p>View Game History</p>
                    </div>
                </Link>
            </div>
        )
    }


    return (
        <div className="cards cards--previous">
            {games.map((g) => {
                const displayDate = new Date(g.dateEnd || g.dateStart);
                const winner = g.results?.find(r => r.rank === 1)?.player;

                return (
                    <div key={g.id} className="card card--previous">
                        <div className="card__header">
                            <h3 className="title title--card">{g.name} -{" "}
                                {displayDate.toLocaleDateString("fr-FR", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                })}
                            </h3>
                            <h4 className="subtitle subtitle--card">Host: {g.host.username}</h4>
                        </div>
                        <div className="card__body">
                            {g.status === "finished" ? (
                                <>
                                    <p>
                                        <FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span>{" "}
                                        {winner ? (
                                            winner.user
                                                ? <Link href={`/profile/${winner.user.id}`}><span className="title--winner">{winner.user.username}</span></Link>
                                                : <span className="title--winner">{winner.guestName || "Guest"}</span>
                                        ) : "N/A"}
                                    </p>
                                    <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> {g.results?.length || 0}</p>
                                    <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {g.buyIn}€</p>
                                    <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Total Cash Prize:</span> {g.prizePool}€</p>
                                    <Link href={`/games/${g.id}`}>
                                        <div className="btn btn--card"><FontAwesomeIcon icon={faChartBar} /> More stats</div>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <p className="text--pending">Details update in progress...</p>
                                    <Link href={`/games/${g.id}`}>
                                        <div className="btn btn--card">View game</div>
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                )
            })}
        </div>
    )
}
