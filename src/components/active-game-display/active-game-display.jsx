"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot, faCircleInfo, faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import gameService from '@/services/game.service.js';
import gameInviteService from '@/services/gameInvite.service.js';
import useAuthStore from '@/stores/useAuthStore.js';
import useToastStore from '@/stores/useToastStore.js';
import { currencySymbol } from '@/utils/game.utils.js';
import { useGameT, useInviteResponseToast, useGameStatusLabel } from "@/utils/game-labels.utils.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { relativeDateTime } from '@/utils/date.utils.js';
import { useEffect, useState } from 'react';
import ActiveGameSkeleton from './active-game-skeleton.jsx';

export default function ActiveGameDisplay({ onResponded }) {
    const { t, locale, intlLocale } = useGameT();
    const displayName = useDisplayName();
    const inviteToast = useInviteResponseToast();
    const [games, setGames] = useState(null);
    const [actingId, setActingId] = useState(null);
    const userId = useAuthStore((state) => state.user?.id);
    const { showToast } = useToastStore();

    useEffect(() => {
        (async () => {
            const data = await gameService.getAll("today");
            const gamesArray = data?.games || data || [];
            setGames(gamesArray);
        })();
    }, []);

    // Réponse à l'invitation directement depuis la carte (sans passer par les notifications)
    const handleRespond = async (game, invite, action) => {
        if (actingId) return;
        setActingId(invite.id);
        const res = await gameInviteService.respond(invite.id, action);
        setActingId(null);
        if (!res.success) {
            showToast(t("genericError"));
            return;
        }
        showToast(...inviteToast(action, game.name));
        onResponded?.();
        // Refusée : la partie quitte la liste ; acceptée : les boutons disparaissent
        setGames((prev) => action === "refused"
            ? prev.filter((g) => g.id !== game.id)
            : prev.map((g) => g.id !== game.id ? g : {
                ...g,
                playerLinks: g.playerLinks.map((p) => p.id === invite.id ? { ...p, status: action } : p),
            }));
    };

    if (!games) return <ActiveGameSkeleton />
    // Aucune partie aujourd'hui : on ne montre ni titre ni cadre vide (la prochaine partie est en haut de l'accueil)
    if (games.length === 0) return null

    return (
        <>
            <div className="divider"></div>
            <h3 className="title--section">
                <span className="red">{t("todaysRed")}</span> {t("todays")}
            </h3>
            <div className="cards cards--active">

                {games.map((g) => {
                                        const myInvite = g.playerLinks?.find((p) => p.userId === userId && p.status === "pending");
                    return (
                        <div key={g.id} className="card card--active">
                            <div className="card__header">
                                <h3 className="title title--card">{g.name}</h3>
                                <p className="card__when">{relativeDateTime(g.dateStart, locale)}</p>
                                <h4 className="subtitle subtitle--card">{t("host", { name: displayName(g.host.username) })}</h4>
                            </div>
                            <div className="card__body">
                                <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {g.location}</p>
                                {g.realStart && (
                                    <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">{t("tableStart")}</span> {new Date(g.realStart).toLocaleTimeString(intlLocale, { hour: "2-digit", minute: "2-digit" })}</p>
                                )}
                                <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">{t("entry")}</span> {g.buyIn}{currencySymbol(g.currency)}</p>
                                {myInvite && (
                                    <p className="card__answer">
                                        <span className="player__status player__status--pending">{t("playerStatus.pending")}</span>
                                        <span className="gray">{t("willYouPlay")}</span>
                                    </p>
                                )}
                                <div className="card__actions">
                                    {myInvite && (
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn--card"
                                                disabled={!!actingId}
                                                onClick={() => handleRespond(g, myInvite, "accepted")}
                                            >
                                                <FontAwesomeIcon icon={faCheck} /> {t("accept")}
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--card btn--secondary"
                                                disabled={!!actingId}
                                                onClick={() => handleRespond(g, myInvite, "refused")}
                                            >
                                                <FontAwesomeIcon icon={faXmark} /> {t("refuse")}
                                            </button>
                                        </>
                                    )}
                                    <Link href={"/games/" + g.id} className="btn btn--card btn--secondary"><FontAwesomeIcon icon={faCircleInfo} /> {t("moreInfos")}</Link>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}