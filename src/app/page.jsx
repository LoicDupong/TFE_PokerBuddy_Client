"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faUser, faUserPlus, faDice } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link.js";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display.jsx";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import LeaderboardDisplay from "@/components/leaderboard-display/leaderboard-display.jsx";
import InstallPrompt from "@/components/pwa/installPrompt.jsx";
import useAuthStore from "@/stores/useAuthStore.js";
import GameInvitesDisplay from "@/components/game-invites-display/game-invites-display.jsx";
import NextGame from "@/components/next-game/next-game.jsx";
import gameService from "@/services/game.service.js";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/i18n-provider.jsx";

const MESSAGES = {
    en: {
        welcome: "Welcome,", createGame: "Create New Game", liveManager: "Live Game Manager",
        upcoming: "Upcoming", games: "Games", recent: "Recent", recentGames: "games", myLeaderboard: "My Leaderboard",
        newTitle: "New to poker ?",
        newText1: "Looking for a quick rundown on everything you need to know to get started playing poker?",
        newText2: "Check out our guide to poker rules to get familiar with the basics of poker, as it's crucial to know which hands beat which other hands, for example, or what blinds are, and how betting rounds work.",
        howToPlay: "How to play", pokerRules: "Poker rules",
        welcomeOn: "Welcome on", subtitle: "Ready for your next poker session?",
        newUser: "New user ?", joinUs: "Join us to discover all our features !", register: "Register",
        haveAccount: "Already have an account ?", login: "Login", tryManager: "Try the Game Manager now",
    },
    fr: {
        welcome: "Bienvenue,", createGame: "Créer une partie", liveManager: "Game Manager en direct",
        upcoming: "Parties", games: "à venir", recent: "Parties", recentGames: "récentes", myLeaderboard: "Mon classement",
        newTitle: "Nouveau au poker ?",
        newText1: "Tu cherches un résumé rapide de tout ce qu'il faut savoir pour te lancer au poker ?",
        newText2: "Jette un œil à notre guide des règles pour te familiariser avec les bases : savoir quelle main bat quelle autre, ce que sont les blinds, ou comment fonctionnent les tours de mise, par exemple, c'est essentiel.",
        howToPlay: "Comment jouer", pokerRules: "Règles du poker",
        welcomeOn: "Bienvenue sur", subtitle: "Prêt pour ta prochaine session de poker ?",
        newUser: "Nouveau ?", joinUs: "Rejoins-nous pour découvrir toutes les fonctionnalités !", register: "Inscription",
        haveAccount: "Tu as déjà un compte ?", login: "Connexion", tryManager: "Essaie le Game Manager dès maintenant",
    },
};

export default function HomePage() {
    const { t } = useT(MESSAGES);
    const user = useAuthStore((state) => state.user);
    // Clés de rechargement : une réponse à une invitation met à jour les autres blocs
    const [listKey, setListKey] = useState(0);
    const [nextKey, setNextKey] = useState(0);
    // Partie déjà affichée dans "Your next game" : les listes en dessous ne la répètent pas
    const [nextId, setNextId] = useState(null);
    // null = inconnu (on n'affiche rien plutôt que de faire clignoter le bloc débutant)
    const [hasFinished, setHasFinished] = useState(null);

    useEffect(() => {
        if (!user) return;
        (async () => {
            const data = await gameService.getAll("finished");
            const list = data?.games || data || [];
            setHasFinished(list.length > 0);
        })();
    }, [user]);

    if (user) {
        return (
            <>
                <InstallPrompt />
                <div className="hero__container">
                    <div className="hero__header">
                        <h1 className="title title--hero">{t("welcome")} <br /> <span className="red">{user.username}</span></h1>
                        <NextGame key={nextKey} onLoaded={setNextId} onResponded={() => setListKey((k) => k + 1)} />
                        <div className="hero__actions">
                            <Link href={'/games/create'} className="btn btn--secondary"><FontAwesomeIcon icon={faPlus} /> {t("createGame")}</Link>
                            <Link href={'/manager/preset'} className="btn btn--secondary"><FontAwesomeIcon icon={faDice} /> {t("liveManager")}</Link>
                        </div>
                    </div>
                </div>
                <div className="games__container">
                    <div className="divider"></div>
                    <h3 className="title--section">{/* le mot en rouge vient en premier en anglais, en second en français */}<span className="red">{t("upcoming")}</span> {t("games")}</h3>
                    <GameInvitesDisplay key={"i" + listKey} excludeId={nextId} onAccept={() => { setListKey((k) => k + 1); setNextKey((k) => k + 1); }} />
                    <UpcomingGamesDisplay key={"u" + listKey} excludeId={nextId} includeToday />
                    <div className="divider"></div>
                    <h3 className="title--section"><span className="red">{t("recent")}</span> {t("recentGames")}</h3>
                    <PreviousGamesDisplay />
                </div>
                <div className="divider"></div>

                <div className="leaderboard__container">
                    <h2 className="title title--leaderboard title--section">{t("myLeaderboard")}</h2>

                    <LeaderboardDisplay compact />
                </div>
                <div className="divider"></div>

                {hasFinished === false && (
                    <div className="learning__container">
                        <div className="learning-new">
                            <h2 className="title title--section">{t("newTitle")}</h2>
                            <p>{t("newText1")}</p>
                            <p>{t("newText2")}</p>
                            <Link href={"/learn/rules"} className="btn"><FontAwesomeIcon icon={faBook} /> {t("howToPlay")}</Link>
                        </div>
                    </div>
                )}
                {hasFinished === true && (
                    <p><Link href={"/learn/rules"} className="btn btn--link"><FontAwesomeIcon icon={faBook} /> {t("pokerRules")}</Link></p>
                )}
            </>

        );
    } else {
        return (
            <>
                <InstallPrompt />
                <div className="hero__container">
                    <div className="hero__header">
                        <h1 className="title title--hero">{t("welcomeOn")}<br /><span className="red">PokerBuddy</span></h1>
                        <h2 className="subtitle subtitle--hero">{t("subtitle")}</h2>
                        <p className="text--hero">{t("newUser")} <br /> {t("joinUs")}</p>
                        <Link href={'auth/register'} className="btn btn--login"><FontAwesomeIcon icon={faUserPlus} /> {t("register")}</Link>
                        <div className="hero__item">
                            <p className="text--hero">{t("haveAccount")}</p>
                            <Link href={'auth/login'} className="btn btn--login"><FontAwesomeIcon icon={faUser} /> {t("login")}</Link>
                        </div>

                        {/* <PushNotificationManager />  */}
                        {/* bouton Subscribe / Unsubscribe */}
                        <div className="hero__item">
                            <p className="text--hero">{t("tryManager")}</p>
                            <Link href={'/manager/preset'} className="btn"><FontAwesomeIcon icon={faDice} /> {t("liveManager")}</Link>
                        </div>  {/* option pour l’installation PWA */}
                    </div>
                </div>
                <div className="divider"></div>
                <div className="learning__container">
                    <div className="learning-new">
                        <h2 className="title title--section">{t("newTitle")}</h2>
                        <p>{t("newText1")}</p>
                        <p>{t("newText2")}</p>
                        <Link href={"/learn/rules"} className="btn"><FontAwesomeIcon icon={faBook} /> {t("howToPlay")}</Link>
                    </div>
                </div>
            </>
        );
    }



}
