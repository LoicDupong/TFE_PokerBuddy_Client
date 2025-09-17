import { faChartBar, faDollarSign, faSackDollar, faTrophy, faUserGroup } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link.js";

export default function GameDetailsPage() {
  return (
    <>
      <h1>Game Details</h1>
      <h3 className="title title--card">Game Name - 30/08/25</h3>
      <div className="divider"></div>
      <div className="card">
        <div className="card__header">
          <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
        </div>
        <div className="card__body">
          <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span> <span className="title--winner">Player X</span></p>
          <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> 7</p>
          <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> 30€</p>
          <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Total Cash Prize:</span> 240€</p>
        </div>
      </div>
    </>
  );
}