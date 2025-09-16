import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faHourglassStart, faLocationDot,faClock, faPlus, faCircleInfo} from '@fortawesome/free-solid-svg-icons';

export default function UpcomingGamesDisplay() {

    return(
        <div className="cards cards--planned">

            {/* // TODO : faire un map de toutes les games à venir ici dans Cards */}

          <div className="card card--planned">
            <div className="card__header">
              <h3 className="title title--card">Game Name - 30/08/25</h3>
              <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
            </div>
            <div className="card__body">
              <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> My friend street 123</p>
              <p><FontAwesomeIcon icon={faClock} className="fa-icon" /> <span className="gray">Meet up:</span> 19:00</p>
              <p><FontAwesomeIcon icon={faHourglassStart} className="fa-icon" /> <span className="gray">Table start:</span> 20:00</p>
              <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> 30€</p>
              <div className="btn btn--card"><FontAwesomeIcon icon={faCircleInfo} /> More infos</div>
            </div>
          </div>

          {/* // TODO : Gérer le onClick du Card--plus pour afficer le reste des games à venir si plusieurs  */}

          <div className="card card--plus">
            <p><FontAwesomeIcon icon={faPlus} /> 2 more...</p>
          </div>
        </div>
    )
}