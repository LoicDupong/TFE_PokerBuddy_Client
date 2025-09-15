import styles from "./page.module.css";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot,faClock } from '@fortawesome/free-solid-svg-icons';

export default function HomePage() {
  return (
      <main>
        <div className="hero__container">
            <div className="hero__header">
                <h1 className="title title--hero">Welcome, <br /> Loïc Dupong!</h1>
                <h2 className="subtitle subtitle--hero">Ready for your next poker session?</h2>
                <p className="text--hero"></p>
                <div className="btn btn--create">Create New Game</div>
            </div>
            <div className="hero__carrousel">
                <img src="#" alt=""></img>
                <img src="#" alt=""></img>
                <img src="#" alt=""></img>
            </div>
        </div>
        <div className="games__container">
            <h2 className="title title--games title--section">My Games</h2>
            <div className="divider"></div>
            <h3>Upcoming Games</h3>
            <div className="cards cards--planned">
                <div className="card card--planned">
                    <div className="card__header">
                        <h3 className="title title--card">Game Name - 30/08/25</h3>
                        <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
                    </div>
                    <div className="card__body">
                        <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon"/> My friend street 123</p>
                        <p><FontAwesomeIcon icon={faClock} className="fa-icon"/> <span className="gray">Meet up:</span> 19:00</p>
                        <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Table start:</span> 20:00</p>
                        <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon"/> <span className="gray">Entry price:</span> 30€</p>
                        <div className="btn btn--card">More infos</div>
                    </div>
                </div>
                <div className="card card--plus">
                    <p>+2 more...</p>
                </div>
            </div>
            <div className="divider"></div>
            <h3>Recent Games</h3>
            <div className="cards cards--previous">
                <div className="card card--previous">
                    <div className="card__header">
                        <h3 className="title title--card">Game Name - 30/08/25</h3>
                        <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
                    </div>
                    <div className="card__body">
                        <h4>Winner</h4>
                        <p>Player numbers : 7</p>
                        <p>Entry price : 30€</p>
                        <p>Total Cash Prize : 240€</p>
                        <a href="">More stats</a>
                    </div>
                </div>
                <div className="card card--plus">
                    <p>View Game History</p>
                </div>
            </div>
        </div>
        <div className="divider"></div>

        <div className="leaderboard__container">
            <h2 className="title title--leaderboard title--section">My Leaderboard</h2>

            <div className="leaderboard__table">
                <table>
                  <thead>
                    <tr>
                      <th>Ranking</th>
                      <th>Player Name</th>
                      <th>Games Played</th>
                      <th>Games Won</th>
                      <th>Games First</th>
                      <th>Winrate</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>1</td>
                      <td><a href="">Alice</a></td>
                      <td>120</td>
                      <td>85</td>
                      <td>30</td>
                      <td>70.8%</td>
                    </tr>
                    <tr>
                      <td>2</td>
                      <td><a href="">Bob</a></td>
                      <td>98</td>
                      <td>60</td>
                      <td>22</td>
                      <td>61.2%</td>
                    </tr>
                    <tr>
                      <td>3</td>
                      <td><a href="">Charlie</a></td>
                      <td>75</td>
                      <td>45</td>
                      <td>15</td>
                      <td>60.0%</td>
                    </tr>
                  </tbody>
                </table>
            </div>
        </div>
        <div className="divider"></div>
        
        <div className="learning__container">
            <div className="learning-new">
                <h2 className="title title--section">New to poker ?</h2>
                <p>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Vero, sed possimus. Error, qui! Praesentium ratione ab repellendus!</p>
                <div className="btn">Learn Poker</div>
            </div>
        </div>
    </main>
  );
}
