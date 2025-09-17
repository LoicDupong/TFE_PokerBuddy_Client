import { faClock, faComment, faCrown, faDollarSign, faFlagCheckered, faHashtag, faHourglassEnd, faHourglassStart, faMoneyCheckDollar, faRankingStar, faSackDollar, faStar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";


export default function GameDetailsPage() {

  const today = new Date().toLocaleString();
  return (
    <>
      <h1>Game Details</h1>
      <div className="divider"></div>
      <div className="card">
        <div className="card__header">
          <h3 className="title title--card">Game Name</h3>
          <h4 className="subtitle subtitle--card">Texas Hold'em</h4>
        </div>
        <div className="card__body">
          <div className="card__infos">
            <p><FontAwesomeIcon icon={faHashtag} className="fa-icon" /> <span className="gray">Game ID:</span> #7726951</p>
            <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Started:</span>{today}</p>
            <p><FontAwesomeIcon icon={faHourglassEnd} className="fa-icon" /> <span className="gray">Ended:</span>{today}</p>
            <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span> <span className="title--winner">Player X</span></p>
            <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> 7</p>
            <p><FontAwesomeIcon icon={faFlagCheckered} className="fa-icon" /> <span className="gray">Level 1:</span> Blinds 20/40</p>
            <div className="divider"></div>
            <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> 30€</p>
            <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Prize Pool:</span> 240€</p>
            <p><FontAwesomeIcon icon={faMoneyCheckDollar} className="fa-icon" /> <span className="gray">Places Paid:</span> 3</p>
            <p><FontAwesomeIcon icon={faRankingStar} className="fa-icon" /> <span className="gray">Prize Distribution:</span></p>
            <ul>
              <li>1. 130€</li>
              <li>2. 70€</li>
              <li>3. 40€</li>
            </ul>
          </div>

          <div className="divider"></div>

          <div className="card__details">
            <div className="card__list players__list">
              <h3>Players list</h3>
              <ul>
                <li>1. Player 1 <FontAwesomeIcon icon={faCrown} className="fa-icon" /> </li>
                <li>2. Player 2</li>
                <li>3. Player 3</li>
                <li>4. Player 4</li>
                <li>5. Player 5</li>
                <li>6. Player 6</li>
                <li>7. Player 7</li>
              </ul>
            </div>
          </div>

          <div className="divider"></div>

          <div className="card__stats">
            <h3><FontAwesomeIcon icon={faStar} size="sm"/> Extras</h3>
            <div className="last__hand"><p><span className="gray">Last Hand: </span>Suited AK</p></div>
            <div className="largest__allin"><p><span className="gray">Largest All in: </span>10K</p></div>
            <div className="card__note">
              <h3><FontAwesomeIcon icon={faComment} size="sm"/> Note:</h3>
              <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Dolorum assumenda amet facere nemo ex, cupiditate nam vero reiciendis autem nobis commodi suscipit illo quam necessitatibus pariatur accusamus provident quod quaerat.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}