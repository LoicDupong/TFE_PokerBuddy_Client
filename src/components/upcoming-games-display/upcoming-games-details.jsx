"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarPlus, faComment, faDollarSign, faFlagCheckered, faHourglassStart, faMoneyCheckDollar, faPlayCircle, faRankingStar, faSackDollar, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import UpcomingGamesSkeleton from './upcoming-games-skeleton.jsx';
import gameService from '@/services/game.service.js';
import { relativeDateTime, shortDateTime, shortTime } from '@/utils/date.utils.js';
import { apiUrl } from '@/utils/media.js';
import { gameStatusLabel, currencySymbol, getConfirmedCount, getPayoutAmount, getPrizePool, inviteResponseToast } from '@/utils/game.utils.js';
import gameInviteService from '@/services/gameInvite.service.js';
import useAuthStore from '@/stores/useAuthStore.js';
import useToastStore from '@/stores/useToastStore.js';
import { useParams } from 'next/navigation.js';
import { displayPlayerName } from "@/utils/game.utils.js";

export default function UpcomingGamesDetails() {
  const { id } = useParams();



  const [game, setGame] = useState(null);
  const [saving, setSaving] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
      (async () => {
          const data = await gameService.getById(id);
          setGame(data?.game ?? null);
        })();
    }, [id]);

  if (!game || game.length === 0) return <UpcomingGamesSkeleton />;

  // Ma ligne de joueur (l'hôte n'a pas à répondre à sa propre partie)
  const me = game.host?.id === userId ? null : game.playerLinks.find((p) => p.userId === userId);

  const respond = async (action) => {
    if (saving || !me) return;
    setSaving(true);
    const res = await gameInviteService.respond(me.id, action);
    setSaving(false);
    if (res.success) {
      setGame((g) => ({ ...g, playerLinks: g.playerLinks.map((p) => (p.id === me.id ? { ...p, status: action } : p)) }));
      showToast(...inviteResponseToast(action, game.name));
    } else {
      showToast(res.errorMessage?.[0] || 'Something went wrong, please try again.');
    }
  };


  // Dates
  const timeStart = shortDateTime(game.dateStart);
  // shortTime(null) afficherait 01:00 (1er janvier 1970)
  const realStart = game.realStart ? shortTime(game.realStart) : "—";
  const prizePool = getPrizePool(game);
  const cur = currencySymbol(game.currency);


  return (
    <>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">{game.name}</h3>
          <p className="card__when">{relativeDateTime(game.dateStart)}</p>
          <h4 className="subtitle subtitle--card">Hosted by <Link href={'/profile/' + game.host.id}>{displayPlayerName(game.host.username)}</Link></h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p><span className={`chip chip--${game.status}`}>{gameStatusLabel(game.status)}</span></p>
            <div className="card__calendar">
                <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Meet up:</span> {timeStart} </p>
                <a
                  href={apiUrl(`/games/${game.id}/ics`)}
                  download
                  className="btn btn--small"
                  aria-label="Add to calendar"
                >
                  <FontAwesomeIcon icon={faCalendarPlus} />
                </a>
            </div>
            {game.realStart && <p><FontAwesomeIcon icon={faPlayCircle} className="fa-icon" /> <span className="gray">Table start:</span> {realStart}</p>}
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Players:</span> {getConfirmedCount(game)} confirmed · {game.playerLinks.length} invited</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">Level 1:</span> Blinds {game.smallBlind}/{game.bigBlind}</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {game.buyIn}{cur}</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Prize pool:</span> {prizePool}{cur}</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">Places paid:</span> {game.placesPaid}</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">Prize distribution:</span></p>
            <ul>
              {(game.payoutDistribution || []).map((p) => (
                <li key={p.place}>{p.place}. {getPayoutAmount(prizePool, p.percent)}{cur}</li>
              ))}
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>Players list</h3>
              <ul>
                {game.playerLinks.map((r) => (
                  <li key={r.id}>• {displayPlayerName(r.user?.username || r.userName || r.guestName)} <span className={`player__status player__status--${r.status}`}>{r.status}</span></li>
                ))}
              </ul>
            </div>
          </div>

          {game.description?.trim() && (
            <>
              <div className="divider"></div>
              <div className="card__note">
                <h3><FontAwesomeIcon icon={faComment} size="sm" /> Note:</h3>
                <p>{game.description}</p>
              </div>
            </>
          )}
        </div>
      </div>

      {me?.status === 'pending' && (
        <div className="answer-bar" role="group" aria-label="Answer the invitation">
          <span className="answer-bar__label">Are you in?</span>
          <button type="button" className="btn btn--primary btn--small" disabled={saving} onClick={() => respond('accepted')}>I&apos;m in</button>
          <button type="button" className="btn btn--card btn--small" disabled={saving} onClick={() => respond('refused')}>Can&apos;t make it</button>
        </div>
      )}

      {me && me.status !== 'pending' && (
        <p className="answer-change">
          You answered: {me.status === 'accepted' ? "I'm in" : "Can't make it"}.{' '}
          <button type="button" className="answer-change__btn" disabled={saving} onClick={() => respond(me.status === 'accepted' ? 'refused' : 'accepted')}>
            Change my answer
          </button>
        </p>
      )}
    </>
  );
}
