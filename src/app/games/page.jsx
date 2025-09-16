import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartBar, faCircleInfo, faClock, faDollarSign, faHourglassStart, faLocationDot, faPlus, faSackDollar, faTrophy, faUserGroup } from '@fortawesome/free-solid-svg-icons';
import UpcomingGamesDisplay from '@/components/upcoming-games-display/upcoming-games-display.jsx';
import PreviousGamesDisplay from '@/components/previous-games-display/previous-games-display/previous-games-display.jsx';

export default function GamesPage() {
  const gamePlayed = 15;
  const gameWon = 4;
  const winRate = (gamePlayed / gameWon) * 10;
  const gameHosted = 2;
  return (
    <>
      <h1>Dashboard <br /><span className="red">My Games</span></h1>
      <div className="divider"></div>

      <section className="section section--games-stats">
        <div className="cards cards--stat">
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Total Games</h3>
            </div>
            <div className="card__body">
              <p>{gamePlayed}</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Total Win</h3>
            </div>
            <div className="card__body">
              <p>{gameWon}</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Win Rate</h3>
            </div>
            <div className="card__body">
              <p>{winRate}%</p>
            </div>
          </div>
          <div className="card card--stat">
            <div className="card__header">
              <h3 className="title title--card">Games Hosted</h3>
            </div>
            <div className="card__body">
              <p>{gameHosted}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"></div>

      <section className="section section--current-games">
        <h3><span className="red">Upcoming</span> Games</h3>
        <UpcomingGamesDisplay/>
      </section>
      <div className="divider"></div>
      <section className="section section--previous-games">
        <h3><span className="red">Previous</span> Games</h3>
        <PreviousGamesDisplay/>
      </section>
    </>
  );
}