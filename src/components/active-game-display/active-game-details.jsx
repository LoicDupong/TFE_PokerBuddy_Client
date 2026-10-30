"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faComment, faDollarSign, faFlagCheckered, faHourglassStart, faMoneyCheckDollar, faPlayCircle, faRankingStar, faSackDollar, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import gameService from '@/services/game.service.js';
import { relativeDateTime, shortDateTime, shortTime } from '@/utils/date.utils.js';
import { apiUrl } from '@/utils/media.js';
import { currencySymbol, getConfirmedCount, getPayoutAmount, getPrizePool } from '@/utils/game.utils.js';
import ActiveGameSkeleton from './active-game-skeleton.jsx';
import { useParams } from 'next/navigation.js';
import { useGameT, useInviteResponseToast, useGameStatusLabel } from "@/utils/game-labels.utils.js";
import { useDisplayName } from "@/utils/player-name.utils.js";

export default function ActiveGameDetails() {
  const { t, locale, intlLocale } = useGameT();
  const displayName = useDisplayName();
  const statusLabel = useGameStatusLabel();
  const { id } = useParams();


  const [game, setGame] = useState(null);

  useEffect(() => {
      (async () => {
          const data = await gameService.getById(id);
          setGame(data?.game ?? null);
        })();
    }, [id]);

  if (!game || game.length === 0) return <ActiveGameSkeleton />;


  // Dates
  const timeStart = shortDateTime(game.dateStart, intlLocale);
  // shortTime(null) afficherait 01:00 (1er janvier 1970)
  const realStart = game.realStart ? shortTime(game.realStart, intlLocale) : "—";
  const prizePool = getPrizePool(game);
  const cur = currencySymbol(game.currency);

  return (
    <>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <p className="card__when">{relativeDateTime(game.dateStart, locale)}</p>
          <h4 className="subtitle subtitle--card">{t("hostedBy")} <Link href={'/profile/' + game.host.id}>{displayName(game.host.username)}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p><span className={`chip chip--${game.status}`}>{statusLabel(game.status)}</span></p>
            <div className="card__calendar">
                <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">{t("meetUp")}</span> {timeStart} </p>
                <a
                  href={apiUrl(`/games/${game.id}/ics`)}
                  download
                  className="btn btn--small"
                  aria-label={t("addToCalendar")}
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                </a>
            </div>
            {game.realStart && <p><FontAwesomeIcon icon={faPlayCircle} className="fa-icon" /> <span className="gray">{t("tableStart")}</span> {realStart}</p>}
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">{t("players")}</span> {t("confirmedInvited", { confirmed: getConfirmedCount(game), invited: game.playerLinks.length })}</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">{t("level1")}</span> {t("blinds")} {game.smallBlind}/{game.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">{t("entry")}</span> {game.buyIn}{cur}</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">{t("prizePool")}</span> {prizePool}{cur}</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">{t("placesPaid")}</span> {game.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">{t("distribution")}</span></p>
            <ul>
              {(game.payoutDistribution || []).map((p) => (
                <li key={p.place}>{p.place}. {getPayoutAmount(prizePool, p.percent)}{cur}</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>{t("playersList")}</h3>
              <ul>
                {game.playerLinks.map((r) => (
                  <li key={r.id}>• {displayName(r.user?.username || r.userName || r.guestName)} <span className={`player__status player__status--${r.status}`}>{t(`playerStatus.${r.status}`)}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {game.description?.trim() && (
            <>
              <div className="divider"></div>
              <div className="card__note">
                <h3><FontAwesomeIcon icon={faComment} size="sm" /> {t("note")}</h3>
                <p>{game.description}</p>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}
