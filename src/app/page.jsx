import styles from "./page.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faBook } from '@fortawesome/free-solid-svg-icons';
import Link from "next/link.js";
import PreviousGamesDisplay from "@/components/previous-games-display/previous-games-display/previous-games-display.jsx";
import UpcomingGamesDisplay from "@/components/upcoming-games-display/upcoming-games-display.jsx";
import LeaderboardDisplay from "@/components/leaderboard-display/leaderboard-display.jsx";
import PushNotificationManager from "@/components/pwa/pushNotificationManager.jsx";
import InstallPrompt from "@/components/pwa/installPrompt.jsx";

export default function HomePage() {
  return (
      <>
        <div className="hero__container">
            <div className="hero__header">
                <h1 className="title title--hero">Welcome, <br /> Loïc Dupong!</h1>
                <h2 className="subtitle subtitle--hero">Ready for your next poker session?</h2>
                <p className="text--hero"></p>
                <Link href={'/games/create'}>
                    <div className="btn btn--create"><FontAwesomeIcon icon={faPlus} /> Create New Game</div>
                </Link>
                {/*<PushNotificationManager/>*/} {/* bouton Subscribe / Unsubscribe */}
                {/*<InstallPrompt/>*/}  {/* option pour l’installation PWA */} 
            </div>
        </div>
        <div className="games__container">
            <h2 className="title title--games title--section">My Games</h2>
            <div className="divider"></div>
            <h3>Upcoming Games</h3>
            <UpcomingGamesDisplay/>
            <div className="divider"></div>
            <h3>Recent Games</h3>
            <PreviousGamesDisplay/>
        </div>
        <div className="divider"></div>

        <div className="leaderboard__container">
            <h2 className="title title--leaderboard title--section">My Leaderboard</h2>

            <LeaderboardDisplay/>
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
}
