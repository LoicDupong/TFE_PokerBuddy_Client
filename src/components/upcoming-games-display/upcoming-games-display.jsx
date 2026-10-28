"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faLocationDot, faPlus, faCircleInfo, faMinus, faCalendarPlus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import gameService from '@/services/game.service.js';
import { useEffect, useState } from 'react';
import UpcomingGamesSkeleton from './upcoming-games-skeleton.jsx';
import { usePathname } from 'next/navigation.js';
import { apiUrl } from '@/utils/media.js';
import { currencySymbol } from '@/utils/game.utils.js';
import { relativeDateTime } from '@/utils/date.utils.js';
import gameInviteService from "@/services/gameInvite.service.js";
import useAuthStore from "@/stores/useAuthStore.js";

function UpcomingCard({ g }) {
  return (
    <div className="card card--planned">
      <div className="card__header">
        <h3 className="title title--card">{g.name}</h3>
        <p className="card__when">{relativeDateTime(g.dateStart)}</p>
        <h4 className="subtitle subtitle--card">Host: {g.host.username}</h4>
      </div>
      <div className="card__body">
        <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {g.location}</p>
        <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> {g.buyIn}{currencySymbol(g.currency)}</p>
        <div className="card__actions">
          <Link href={"/games/" + g.id} className="btn btn--card btn--secondary"><FontAwesomeIcon icon={faCircleInfo} /> More infos</Link>
          <a
            href={apiUrl(`/games/${g.id}/ics`)}
            download
            className="btn btn--small btn--secondary"
            aria-label="Add to calendar"
          >
            <FontAwesomeIcon icon={faCalendarPlus} />
          </a>
        </div>
      </div>
    </div>
  );
}

export default function UpcomingGamesDisplay({ excludeId = null, includeToday = false }) {
  const [games, setGames] = useState(null);
  const [isExpand, setIsExpand] = useState(false);
  // Invitations en attente : on n'affiche pas "No upcoming games yet." tant qu'il y en a
  const [invites, setInvites] = useState([]);
  const userId = useAuthStore((state) => state.user?.id);
  const pathname = usePathname();

  useEffect(() => {
    (async () => {
      const toList = (d) => d?.games || (Array.isArray(d) ? d : []);
      const [upcoming, today, myInvites] = await Promise.all([
        gameService.getAll("upcoming"),
        includeToday ? gameService.getAll("today") : null,
        gameInviteService.getMyInvites(),
      ]);
      // Accueil (sans section "Today's games") : les parties du jour où je joue ou que j'organise.
      // Les invitations du jour en attente sont déjà dans les cartes d'invitation.
      const todayGames = toList(today).filter((g) =>
        g.host?.id === userId || g.playerLinks?.some((p) => p.userId === userId && p.status === "accepted"));
      setInvites(myInvites || []);
      setGames([...todayGames, ...toList(upcoming)]);
    })();
  }, [includeToday, userId]);

  if (!games) return <UpcomingGamesSkeleton />;

  const list = games.filter((g) => g.id !== excludeId);
  const hasInvites = invites.some((i) => i.gameId !== excludeId);
  if (list.length === 0) {
    if (hasInvites) return null;
    // La seule partie prévue est déjà affichée en haut de l'accueil
    return <p className="empty-state">{excludeId ? "Nothing else planned yet." : "No upcoming games yet."}</p>;
  }

  // Sur l'accueil : une carte + "Show more" ; sur /games : toutes
  const collapsible = pathname !== "/games";
  const visible = collapsible && !isExpand ? list.slice(0, 1) : list;

  return (
    <div className="cards cards--planned">
      {visible.map((g) => <UpcomingCard key={g.id} g={g} />)}
      {collapsible && list.length > 1 && (
        <button type="button" className="btn btn--secondary btn--card" style={{ gridColumn: "1 / -1" }} onClick={() => setIsExpand(!isExpand)} aria-expanded={isExpand}>
          {isExpand
            ? <><FontAwesomeIcon icon={faMinus} /> Show less</>
            : <><FontAwesomeIcon icon={faPlus} /> Show more ({list.length - 1})</>}
        </button>
      )}
    </div>
  );
}
