"use client";

import ActiveGameDetails from "@/components/active-game-display/active-game-details.jsx";
import PreviousGameDetails from "@/components/previous-games-display/previous-games-details.jsx";
import UpcomingGamesDetails from "@/components/upcoming-games-display/upcoming-games-details.jsx";
import gameService from "@/services/game.service.js";
import { useParams } from "next/navigation.js";
import { useEffect, useState } from "react";


export default function GameDetailsPage() {
  const { id } = useParams();
  const [game, setGame] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await gameService.getById(id);
      setGame(data.game);
    })();
  }, [id]);

  if (!game) return <p>Loading...</p>;

  if (game.status === "finished") {
    return (<PreviousGameDetails/>)
  } 
  if (game.status === "pending") {
    return (<UpcomingGamesDetails/>)
  }
  if (game.status === "active") {
    return (<ActiveGameDetails/>)
  }

}