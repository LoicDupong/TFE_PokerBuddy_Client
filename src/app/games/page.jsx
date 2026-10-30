"use client";

import { useEffect, useState } from "react";
import userService from "@/services/user.service.js";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display.jsx";
import ActiveGameDisplay from "@/components/active-game-display/active-game-display.jsx";
import InvitesDisplay from "@/components/invites-display/invites-display.jsx";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
  en: {
    statsLabel: "My stats",
    statsLoading: "Loading stats",
    games: "Games",
    wins: "Wins",
    winRate: "Win rate",
    hosted: "Hosted",
  },
  fr: {
    statsLabel: "Mes stats",
    statsLoading: "Chargement des stats",
    games: "Parties",
    wins: "Victoires",
    winRate: "Taux de victoire",
    hosted: "Organisées",
  },
};

export default function GamesPage() {
  const [stats, setStats] = useState(null);
  const { t, locale } = useT(MESSAGES);

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
      <h1>{locale === "fr" ? <>Mes <span className="red">parties</span></> : <>My <span className="red">games</span></>}</h1>

      {/* Stats en tête de page ; un squelette les remplace pendant le chargement sans bloquer les listes */}
      <section className="section section--games-stats" aria-label={t("statsLabel")}>
        {stats ? (
          <dl className="stat-grid">
            <div className="stat-grid__item"><dt>{t("games")}</dt><dd>{stats.totalGames}</dd></div>
            <div className="stat-grid__item"><dt>{t("wins")}</dt><dd>{stats.wins}</dd></div>
            <div className="stat-grid__item"><dt>{t("winRate")}</dt><dd>{stats.winRate}%</dd></div>
            <div className="stat-grid__item"><dt>{t("hosted")}</dt><dd>{stats.gamesHosted}</dd></div>
          </dl>
        ) : (
          <div className="skeleton" role="status" aria-busy="true" aria-label={t("statsLoading")}></div>
        )}
      </section>

      <InvitesDisplay />

      <section className="section section--current-games">
        <ActiveGameDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--current-games">
        <h3 className="title--section">
          {locale === "fr" ? <>Parties <span className="red">à venir</span></> : <><span className="red">Upcoming</span> games</>}
        </h3>
        <UpcomingGamesDisplay />
      </section>

      <div className="divider"></div>

      <section className="section section--previous-games">
        <h3 className="title--section">
          {locale === "fr" ? <>Parties <span className="red">récentes</span></> : <><span className="red">Recent</span> games</>}
        </h3>
        <PreviousGamesDisplay />
      </section>
    </>
  );
}
