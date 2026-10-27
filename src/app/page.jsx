"use client";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faUser, faUserPlus, faDice } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link.js";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display.jsx";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import LeaderboardDisplay from "@/components/leaderboard-display/leaderboard-display.jsx";
import InstallPrompt from "@/components/pwa/installPrompt.jsx";
import useAuthStore from "@/stores/useAuthStore.js";
import ActiveGameDisplay from "@/components/active-game-display/active-game-display.jsx";
import GameInvitesDisplay from "@/components/game-invites-display/game-invites-display.jsx";
import NextGame from "@/components/next-game/next-game.jsx";
import gameService from "@/services/game.service.js";
import { useEffect, useState } from "react";

export default function HomePage() {
    const user = useAuthStore((state) => state.user);
    // Clés de rechargement : une réponse à une invitation met à jour les autres blocs
    const [listKey, setListKey] = useState(0);
    const [nextKey, setNextKey] = useState(0);
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
                        <h1 className="title title--hero">Welcome, <br /> <span className="red">{user.username}</span></h1>
                        <NextGame key={nextKey} onResponded={() => setListKey((k) => k + 1)} />
                        <div className="hero__actions">
                            <Link href={'/games/create'} className="btn btn--secondary"><FontAwesomeIcon icon={faPlus} /> Create New Game</Link>
                            <Link href={'/manager/preset'} className="btn btn--secondary"><FontAwesomeIcon icon={faDice} /> Live Game Manager</Link>
                        </div>
                    </div>
                </div>
                <div className="games__container">
                    <ActiveGameDisplay key={"a" + listKey} onResponded={() => setNextKey((k) => k + 1)} />
                    <div className="divider"></div>
                    <h3 className="title--section"><span className="red">Upcoming</span> Games</h3>
                    <GameInvitesDisplay key={"i" + listKey} onAccept={() => { setListKey((k) => k + 1); setNextKey((k) => k + 1); }} />
                    <UpcomingGamesDisplay key={"u" + listKey} />
                    <div className="divider"></div>
                    <h3 className="title--section"><span className="red">Recent</span> games</h3>
                    <PreviousGamesDisplay />
                </div>
                <div className="divider"></div>

                <div className="leaderboard__container">
                    <h2 className="title title--leaderboard title--section">My Leaderboard</h2>

                    <LeaderboardDisplay compact />
                </div>
                <div className="divider"></div>

                {hasFinished === false && (
                    <div className="learning__container">
                        <div className="learning-new">
                            <h2 className="title title--section">New to poker ?</h2>
                            <p>Looking for a quick rundown on everything you need to know to get started playing poker?</p>
                            <p>Check out our guide to poker rules to get familiar with the basics of poker, as it’s crucial to know which hands beat which other hands, for example, or what blinds are, and how betting rounds work.</p>
                            <Link href={"/learn/rules"} className="btn"><FontAwesomeIcon icon={faBook} /> How to play</Link>
                        </div>
                    </div>
                )}
                {hasFinished === true && (
                    <p><Link href={"/learn/rules"} className="btn btn--link"><FontAwesomeIcon icon={faBook} /> Poker rules</Link></p>
                )}
            </>

        );
    } else {
        return (
            <>
                <InstallPrompt />
                <div className="hero__container">
                    <div className="hero__header">
                        <h1 className="title title--hero">Welcome on<br /><span className="red">PokerBuddy</span></h1>
                        <h2 className="subtitle subtitle--hero">Ready for your next poker session?</h2>
                        <p className="text--hero">New user ? <br /> Join us to discover all our features !</p>
                        <Link href={'auth/register'} className="btn btn--login"><FontAwesomeIcon icon={faUserPlus} /> Register</Link>
                        <div className="hero__item">
                            <p className="text--hero">Already have an account ?</p>
                            <Link href={'auth/login'} className="btn btn--login"><FontAwesomeIcon icon={faUser} /> Login</Link>
                        </div>

                        {/* <PushNotificationManager />  */}
                        {/* bouton Subscribe / Unsubscribe */}
                        <div className="hero__item">
                            <p className="text--hero">Try the Game Manager now</p>
                            <Link href={'/manager/preset'} className="btn"><FontAwesomeIcon icon={faDice} /> Live Game Manager</Link>
                        </div>  {/* option pour l’installation PWA */}
                    </div>
                </div>
                <div className="divider"></div>
                <div className="learning__container">
                    <div className="learning-new">
                        <h2 className="title title--section">New to poker ?</h2>
                        <p>Looking for a quick rundown on everything you need to know to get started playing poker?</p>
                        <p>Check out our guide to poker rules to get familiar with the basics of poker, as it’s crucial to know which hands beat which other hands, for example, or what blinds are, and how betting rounds work.</p>
                        <Link href={"/learn/rules"} className="btn"><FontAwesomeIcon icon={faBook} /> How to play</Link>
                    </div>
                </div>
            </>
        );
    }



}
