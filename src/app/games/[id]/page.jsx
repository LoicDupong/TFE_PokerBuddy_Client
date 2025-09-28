"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faPenToSquare, faUserPlus, faGears } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const user = useAuthStore((state) => state.user);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data.game);
    })();
  }, [id]);

  if (!game) return <p>Loading...</p>;

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
            <div className="btn btn--edit">
              <FontAwesomeIcon icon={faPenToSquare} /> Edit
            </div>
            <div className="btn btn--edit btn--invite">
              <FontAwesomeIcon icon={faUserPlus} /> Invite
            </div>
          </div>
          <UpcomingGamesDetails />
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
            <div className="btn btn--edit">
              <FontAwesomeIcon icon={faPenToSquare} /> Edit Game
            </div>
          </div>
          <ActiveGameDetails />
        </>
      );
    }
    return <ActiveGameDetails />;
  }
}
