"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot, faUserGroup, faCheck, faXmark, faPlus } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import gameService from '@/services/game.service.js';
import gameInviteService from '@/services/gameInvite.service.js';
import useAuthStore from '@/stores/useAuthStore.js';
import useToastStore from '@/stores/useToastStore.js';
import { getConfirmedCount } from '@/utils/game.utils.js';
import { useGameT, useInviteResponseToast } from '@/utils/game-labels.utils.js';
import { isSameLocalDay, relativeDateTime } from '@/utils/date.utils.js';

// Prochaine partie de l'utilisateur : la plus proche parmi aujourd'hui, invitations en attente et à venir
export default function NextGame({ onLoaded, onResponded }) {
  const { t, locale } = useGameT();
  const inviteToast = useInviteResponseToast();
  const [candidates, setCandidates] = useState(null);
  const [acting, setActing] = useState(false);
  const userId = useAuthStore((state) => state.user?.id);
  const showToast = useToastStore((state) => state.showToast);

  useEffect(() => {
    (async () => {
      const [today, upcoming, invites] = await Promise.all([
        gameService.getAll("today"),
        gameService.getAll("upcoming"),
        gameInviteService.getMyInvites(),
      ]);
      const toList = (d) => d?.games || (Array.isArray(d) ? d : []);
      const byId = new Map();
      for (const g of [...toList(today), ...toList(upcoming)]) {
        if (g.status === "finished" || byId.has(g.id)) continue;
        const mine = g.playerLinks?.find((p) => p.userId === userId);
        if (mine?.status === "refused") continue;
        byId.set(g.id, {
          gameId: g.id,
          name: g.name,
          dateStart: g.dateStart,
          location: g.location,
          status: g.status,
          isHost: g.host?.id === userId,
          confirmed: getConfirmedCount(g),
          invited: g.playerLinks?.length ?? 0,
          myInvite: mine && g.host?.id !== userId ? { id: mine.id, status: mine.status } : null,
        });
      }
      // Invitations en attente (le détail des joueurs n'est pas fourni : pas de compteur)
      for (const i of invites || []) {
        if (byId.has(i.gameId)) continue;
        byId.set(i.gameId, {
          gameId: i.gameId,
          name: i.gameName,
          dateStart: i.dateStart,
          location: i.location,
          status: "pending",
          isHost: false,
          confirmed: null,
          invited: null,
          myInvite: { id: i.inviteId, status: "pending" },
        });
      }
      setCandidates([...byId.values()]);
    })();
  }, [userId]);

  const next = candidates && [...candidates].sort((a, b) => new Date(a.dateStart) - new Date(b.dateStart))[0];

  // L'accueil retire cette partie des listes en dessous (pas de doublon)
  useEffect(() => {
    if (candidates) onLoaded?.(next?.gameId ?? null);
  }, [candidates, next?.gameId, onLoaded]);

  if (!candidates) return <div className="next-game"><div className="skeleton" role="status" aria-busy="true" aria-label={t("loadingNext")}></div></div>;

  if (!next) {
    return (
      <section className="next-game next-game--empty" aria-labelledby="next-game-title">
        <p className="next-game__label" id="next-game-title">{t("yourNext")}</p>
        <p>{t("noGame")}</p>
        <Link href="/games/create" className="btn"><FontAwesomeIcon icon={faPlus} /> {t("createGame")}</Link>
      </section>
    );
  }

  const respond = async (action) => {
    if (acting) return;
    setActing(true);
    const res = await gameInviteService.respond(next.myInvite.id, action);
    setActing(false);
    if (!res.success) {
      showToast(t("genericError"));
      return;
    }
    showToast(...inviteToast(action, next.name));
    // Refusée : la partie quitte la liste ; acceptée : on garde la partie et on met à jour ma réponse
    setCandidates((prev) => action === "refused"
      ? prev.filter((c) => c.gameId !== next.gameId)
      : prev.map((c) => c.gameId !== next.gameId ? c : {
        ...c,
        confirmed: c.confirmed === null ? null : c.confirmed + 1,
        myInvite: { ...c.myInvite, status: action },
      }));
    onResponded?.();
  };

  const gameDay = isSameLocalDay(next.dateStart) || new Date(next.dateStart) <= new Date() || next.status === "active";
  const pending = next.myInvite?.status === "pending";

  let primary;
  if (next.isHost) {
    primary = gameDay
      ? <Link href={`/manager/preset?gameId=${next.gameId}`} className="btn">{t("startManager")}</Link>
      : <Link href={`/games/${next.gameId}`} className="btn">{t("inviteFriends")}</Link>;
  } else if (!pending) {
    primary = <Link href={`/games/${next.gameId}`} className="btn">{t("viewGame")}</Link>;
  }

  return (
    <section className="next-game" aria-labelledby="next-game-title">
      <p className="next-game__label" id="next-game-title">{t("yourNext")}</p>
      <h2 className="next-game__name">{next.name}</h2>
      <p className="next-game__when">{relativeDateTime(next.dateStart, locale)}</p>
      <ul className="next-game__facts">
        {next.location && <li><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {next.location}</li>}
        {next.confirmed !== null && (
          <li><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> {t("playersFact", { confirmed: next.confirmed, invited: next.invited })}</li>
        )}
        <li>
          <span className="gray">{next.isHost ? t("hosting") : t("yourAnswer")}</span>{" "}
          {!next.isHost && <span className={`player__status player__status--${next.myInvite?.status ?? "accepted"}`}>{t(`playerStatus.${next.myInvite?.status ?? "accepted"}`)}</span>}
        </li>
      </ul>
      <div className="next-game__actions">
        {pending ? (
          <>
            <button type="button" className="btn" disabled={acting} onClick={() => respond("accepted")}>
              <FontAwesomeIcon icon={faCheck} /> {t("accept")}
            </button>
            <button type="button" className="btn btn--secondary" disabled={acting} onClick={() => respond("refused")}>
              <FontAwesomeIcon icon={faXmark} /> {t("refuse")}
            </button>
            <Link href={`/games/${next.gameId}`} className="btn btn--link">{t("viewGame")}</Link>
          </>
        ) : (
          <>
            {primary}
            {next.isHost && <Link href={`/games/${next.gameId}`} className="btn btn--secondary">{t("viewGame")}</Link>}
          </>
        )}
      </div>
    </section>
  );
}
