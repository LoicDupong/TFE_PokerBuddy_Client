"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faPenToSquare, faUserPlus, faGears, faDice } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import GameInvite from "@/features/invite/game-invite.jsx";
import gameInviteService from "@/services/gameInvite.service.js";

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [invites, setInvites] = useState({ friends: [], guests: [] });
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace('/');
  }, [user]);

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data.game);
    })();
  }, [id]);

  if (!game) return <p>Loading...</p>;
  if (!user) return null;

  const handleInviteConfirm = async () => {
    for (const f of invites.friends) {
      await gameInviteService.invite(id, { userId: f.id });
    }
    for (const g of invites.guests) {
      await gameInviteService.invite(id, { guestName: g });
    }
    setShowInviteModal(false);
    setInvites({ friends: [], guests: [] });
  };

  if (game.status === "finished") {
    return <PreviousGameDetails />;
  }

  if (game.status === "pending") {
    if (user.id === game.host.id) {
      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn__container">
            <Link href={`/games/${id}/edit`}>
              <div className="btn btn--edit">
                <FontAwesomeIcon icon={faPenToSquare} /> Edit
              </div>
            </Link>
            <div className="btn btn--edit btn--invite" onClick={() => setShowInviteModal(true)}>
              <FontAwesomeIcon icon={faUserPlus} /> Invite
            </div>
            <div className="btn btn--edit" onClick={() => router.push(`/manager/preset?gameId=${game.id}`)}>
              <FontAwesomeIcon icon={faDice} /> Use Preset
            </div>
          </div>
          <UpcomingGamesDetails />
          {showInviteModal && (
            <GameInvite
              invites={invites}
              setInvites={setInvites}
              onClose={() => setShowInviteModal(false)}
              onConfirm={handleInviteConfirm}
            />
          )}
        </>
      );
    }
    return <UpcomingGamesDetails />;
  }

  if (game.status === "active") {
    if (user.id === game.host.id) {
      const handleGameManager = () => {
        // 🔹 On push vers /manager/preset avec l'ID de la game en query param
        router.push(`/manager/preset?gameId=${game.id}`);
      };

      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn__container">
            <div className="btn btn--edit" onClick={handleGameManager}>
              <FontAwesomeIcon icon={faGears} /> Game Manager
            </div>
            <Link href={`/games/${id}/edit`}>
              <div className="btn btn--edit">
                <FontAwesomeIcon icon={faPenToSquare} /> Edit Game
              </div>
            </Link>
          </div>
          <ActiveGameDetails />
        </>
      );
    }
    return <ActiveGameDetails />;
  }
}
