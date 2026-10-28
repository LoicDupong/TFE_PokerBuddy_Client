"use client";

import { useEffect, useState } from "react";
import userService from "@/services/user.service.js";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display.jsx";
import ActiveGameDisplay from "@/components/active-game-display/active-game-display.jsx";
import InvitesDisplay from "@/components/invites-display/invites-display.jsx";

export default function GamesPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    (async () => {
      const data = await userService.getMe();
      if (data?.user?.stats) {
        setStats(data.user.stats);
      }
    })();
  }, []);

  return (
    <>
      <h1>My <span className="red">games</span></h1>

      {/* Stats en tête de page ; un squelette les remplace pendant le chargement sans bloquer les listes */}
      <section className="section section--games-stats" aria-label="My stats">
        {stats ? (
          <dl className="stat-grid">
            <div className="stat-grid__item"><dt>Games</dt><dd>{stats.totalGames}</dd></div>
            <div className="stat-grid__item"><dt>Wins</dt><dd>{stats.wins}</dd></div>
            <div className="stat-grid__item"><dt>Win rate</dt><dd>{stats.winRate}%</dd></div>
            <div className="stat-grid__item"><dt>Hosted</dt><dd>{stats.gamesHosted}</dd></div>
          </dl>
        ) : (
          <div className="skeleton" role="status" aria-busy="true" aria-label="Loading stats"></div>
        )}
      </section>

      <InvitesDisplay />

      <section className="section section--current-games">
        <ActiveGameDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--current-games">
        <h3 className="title--section">
          <span className="red">Upcoming</span> games
        </h3>
        <UpcomingGamesDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--previous-games">
        <h3 className="title--section">
          <span className="red">Recent</span> games
        </h3>
        <PreviousGamesDisplay />
      </section>
    </>
  );
}
