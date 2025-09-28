"use client";

import styles from "./page.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook, faUser, faUserPlus, faDice } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link.js";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display.jsx";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import LeaderboardDisplay from "@/components/leaderboard-display/leaderboard-display.jsx";
import PushNotificationManager from "@/components/pwa/pushNotificationManager.jsx";
import InstallPrompt from "@/components/pwa/installPrompt.jsx";
import useAuthStore from "@/stores/useAuthStore.js";
import ActiveGameDisplay from "@/components/active-game-display/active-game-display.jsx";

export default function HomePage() {
    const user = useAuthStore((state) => state.user);

    if (user) {
        console.log(user);

        return (
            <>
                <InstallPrompt />
                <div className="hero__container">
                    <div className="hero__header">
                        <h1 className="title title--hero">Welcome, <br /> <span className="red">{user.username}</span></h1>
                        <h2 className="subtitle subtitle--hero">Ready for your next poker session?</h2>
                        <p className="text--hero"></p>
                        <Link href={'/games/create'}>
                            <div className="btn btn--create"><FontAwesomeIcon icon={faPlus} /> Create New Game</div>
                        </Link>
                        <div className="hero__item">
                            <p className="text--hero">Start managing your poker games now</p>
                            <Link href={'/manager'}>
                                <div className="btn"><FontAwesomeIcon icon={faDice} /> Live Game Manager</div>
                            </Link>
                        </div>
                        {/* <PushNotificationManager />  */}
                        {/* bouton Subscribe / Unsubscribe */}
                        <div className="hero__item">
                        </div>  {/* option pour l’installation PWA */}
                    </div>
                </div>
                <div className="games__container">
                    <div className="divider"></div>
                    <ActiveGameDisplay />
                    <div className="divider"></div>
                    <h3 className="title--section"><span className="red">Upcoming</span> Games</h3>
                    <UpcomingGamesDisplay />
                    <div className="divider"></div>
                    <h3 className="title--section"><span className="red">Recent</span> Games</h3>
                    <PreviousGamesDisplay />
                </div>
                <div className="divider"></div>

                <div className="leaderboard__container">
                    <h2 className="title title--leaderboard title--section">My Leaderboard</h2>

                    <LeaderboardDisplay />
                </div>
                <div className="divider"></div>

                <div className="learning__container">
                    <div className="learning-new">
                        <h2 className="title title--section">New to poker ?</h2>
                        <p>Looking for a quick rundown on everything you need to know to get started playing poker?</p>
                        <p>Check out our guide to poker rules to get familiar with the basics of poker, as it’s crucial to know which hands beat which other hands, for example, or what blinds are, and how betting rounds work.</p>
                        <div className="btn"><FontAwesomeIcon icon={faBook} /> How to play</div>
                    </div>
                </div>
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
                        <Link href={'auth/register'}>
                            <div className="btn btn--login"><FontAwesomeIcon icon={faUserPlus} /> Register</div>
                        </Link>
                        <div className="hero__item">
                            <p className="text--hero">Already have an account ?</p>
                            <Link href={'auth/login'}>
                                <div className="btn btn--login"><FontAwesomeIcon icon={faUser} /> Login</div>
                            </Link>
                        </div>

                        {/* <PushNotificationManager />  */}
                        {/* bouton Subscribe / Unsubscribe */}
                        <div className="hero__item">
                            <p className="text--hero">Try the Game Manager now</p>
                            <Link href={'/manager'}>
                                <div className="btn"><FontAwesomeIcon icon={faDice} /> Live Game Manager</div>
                            </Link>
                        </div>  {/* option pour l’installation PWA */}
                    </div>
                </div>
                <div className="divider"></div>
                <div className="learning__container">
                    <div className="learning-new">
                        <h2 className="title title--section">New to poker ?</h2>
                        <p>Looking for a quick rundown on everything you need to know to get started playing poker?</p>
                        <p>Check out our guide to poker rules to get familiar with the basics of poker, as it’s crucial to know which hands beat which other hands, for example, or what blinds are, and how betting rounds work.</p>
                        <Link href={"/learn/rules"}>
                            <div className="btn"><FontAwesomeIcon icon={faBook} /> How to play</div>
                        </Link>
                    </div>
                </div>
            </>
        );
    }



}
