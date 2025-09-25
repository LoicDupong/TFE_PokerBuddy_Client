"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import useAuthStore from "@/stores/useAuthStore.js";
import { faPenToSquare, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";
import { useParams } from "next/navigation.js";
import { useEffect, useState } from "react";


export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data.game);
    })();
  }, [id]);

  if (!game) return <p>Loading...</p>;


  if (game.status === "finished") {
    return (<PreviousGameDetails />)
  }
  if (game.status === "pending") {
    if (user.id === game.host.id) {
      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn__container">
            <Link href={`/games/${game.id}/edit`} className="btn btn--edit">  <FontAwesomeIcon icon={faPenToSquare} /> Edit
            </Link>
            <div className="btn btn--edit btn--invite"><FontAwesomeIcon icon={faUserPlus} /> Invite</div>
          </div>
          <UpcomingGamesDetails />
        </>
      )
    }
    return (<UpcomingGamesDetails />)
  }
  if (game.status === "active") {
    if (user.id === game.host.id) {
      return (
        <>
          <h1>Game Details</h1>
          <div className="divider"></div>
          <div className="btn btn--edit"><FontAwesomeIcon icon={faPenToSquare} /> Edit Game</div>
          <ActiveGameDetails />
        </>
      )
    }
    return (<ActiveGameDetails />)
  }



}