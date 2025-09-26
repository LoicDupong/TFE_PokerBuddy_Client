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

  console.log(stats);


  if (!stats) {
    return <p>Loading stats...</p>;
  }

  return (
    <>
      <h1>
        Dashboard <br />
        <span className="red">My Games</span>
      </h1>
      <div className="divider"></div>

      <section className="section section--games-stats">
        <div className="cards cards--stat">
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Total Games</h3>
            </div>
            <div className="card__body">
              <p>{stats.totalGames}</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Total Win</h3>
            </div>
            <div className="card__body">
              <p>{stats.totalGamesWon}</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Win Rate</h3>
            </div>
            <div className="card__body">
              <p>{stats.winRate}%</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Games Hosted</h3>
            </div>
            <div className="card__body">
              <p>{stats.gamesHosted}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <InvitesDisplay />
      
      <div className="divider"></div>

      <section className="section section--current-games">
        <ActiveGameDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--current-games">
        <h3 className="title--section">
          <span className="red">Upcoming</span> Games
        </h3>
        <UpcomingGamesDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--previous-games">
        <h3 className="title--section">
          <span className="red">Previous</span> Games
        </h3>
        <PreviousGamesDisplay />
      </section>
    </>
  );
}
