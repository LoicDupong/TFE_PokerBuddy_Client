"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTrophy, faUserGroup, faSackDollar, faChartBar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import gameService from '@/services/game.service.js';
import { currencySymbol, getPrizePool } from '@/utils/game.utils.js';
import { useGameT, useInviteResponseToast, useGameStatusLabel } from "@/utils/game-labels.utils.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { relativeDateTime } from '@/utils/date.utils.js';
import PreviousGamesSkeleton from './previous-games-skeleton.jsx';
import { usePathname } from 'next/navigation.js';

function PreviousCard({ g }) {
    const { t, locale } = useGameT();
    const displayName = useDisplayName();
    const winner = g.results?.find(r => r.rank === 1)?.player;
    return (
        <div className="card card--previous">
            <div className="card__header">
                <h3 className="title title--card">{g.name}</h3>
                <p className="card__when">{relativeDateTime(g.dateEnd || g.dateStart, locale)}</p>
                <h4 className="subtitle subtitle--card">{t("host", { name: displayName(g.host.username) })}</h4>
            </div>
            <div className="card__body">
                {g.status === "finished" ? (
                    <>
                        <p>
                            <FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">{t("winner")}</span>{" "}
                            {winner ? (
                                winner.user
                                    ? <Link href={`/profile/${winner.user.id}`}><span className="title--winner">{displayName(winner.user.username)}</span></Link>
                                    : <span className="title--winner">{displayName(winner.guestName) || t("guest")}</span>
                            ) : t("na")}
                        </p>
                        <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">{t("players")}</span> {g.results?.length || 0}</p>
                        <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">{t("entry")}</span> {g.buyIn}{currencySymbol(g.currency)}</p>
                        <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">{t("prizePool")}</span> {getPrizePool(g)}{currencySymbol(g.currency)}</p>
                        <div className="card__actions">
                            <Link href={`/games/${g.id}`} className="btn btn--card btn--secondary"><FontAwesomeIcon icon={faChartBar} /> {t("moreStats")}</Link>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text--pending">{t("inProgress")}</p>
                        <div className="card__actions">
                            <Link href={`/games/${g.id}`} className="btn btn--card btn--secondary">{t("viewGame")}</Link>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default function PreviousGamesDisplay() {
    const { t } = useGameT();
    const [games, setGames] = useState(null);
    const pathname = usePathname();

    useEffect(() => {
        (async () => {
            const data = await gameService.getAll("finished");
            const gamesArray = data?.games || data || [];
            setGames(gamesArray);
        })();
    }, []);

    if (!games) return <PreviousGamesSkeleton />;
    if (games.length === 0) return <p className="empty-state">{t("noFinished")}</p>;

    // Accueil : la dernière partie + lien vers l'historique ; historique : toutes
    const onHistory = pathname === "/games/history";
    const visible = onHistory ? games : games.slice(0, 1);

    return (
        <div className="cards cards--previous">
            {visible.map((g) => <PreviousCard key={g.id} g={g} />)}
            {!onHistory && (
                <Link href="/games/history" className="btn btn--secondary btn--card" style={{ gridColumn: "1 / -1" }}>{t("history")}</Link>
            )}
        </div>
    );
}
