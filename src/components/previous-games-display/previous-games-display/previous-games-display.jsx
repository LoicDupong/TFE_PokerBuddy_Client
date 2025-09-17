import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDollarSign, faTrophy,faUserGroup, faSackDollar,faChartBar } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link.js';

export default function PreviousGamesDisplay() {

    return (
        <div className="cards cards--previous">


            {/* //TODO: faire un map de tout l'historique ici dans Cards */}

            <div className="card card--previous">
                <div className="card__header">
                    <h3 className="title title--card">Game Name - 30/08/25</h3>
                    <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
                </div>
                <div className="card__body">
                    <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span> <Link href={'/profile/user123'}><span className="title--winner">Player X</span></Link></p>
                    <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> 7</p>
                    <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> 30€</p>
                    <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Total Cash Prize:</span> 240€</p>
                    <Link href={'/games/thisId'}>
                        <div className="btn btn--card"><FontAwesomeIcon icon={faChartBar} /> More stats</div>
                    </Link>
                </div>
            </div>

            {/* //TODO: Gérer en fonction de la page if '/games/' alors afficher ça, sinon afficher tout l'historique  */}
            
            <Link href={'/games/history'}>
                <div className="card card--plus">
                    <p>View Game History</p>
                </div>
            </Link>
        </div>
    )
}