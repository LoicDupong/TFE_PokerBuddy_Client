import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCircleInfo, faClock, faDollarSign, faHourglassStart, faLocationDot, faPlus, faSackDollar, faTrophy, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import UpcomingGamesDisplay from '@/components/upcoming-games-display/upcoming-games-display.jsx';
import PreviousGamesDisplay from '@/components/previous-games-display/previous-games-display.jsx';

export default function GamesPage() {
  const gamePlayed = 15;
  const gameWon = 4;
  const winRate = (gamePlayed / gameWon) * 10;
  const gameHosted = 2;
  return (
    <>
      <h1>Games <br /><span className="red">History</span></h1>

      <section className="section section--previous-games">
        <PreviousGamesDisplay/>
      </section>
    </>
  );
}