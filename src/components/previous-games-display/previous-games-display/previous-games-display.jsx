

export default function PreviousGamesDisplay() {

    return (
        <div className="cards cards--previous">

            // TODO : faire un map de tout l'historique ici dans Cards
            
            <div className="card card--previous">
                <div className="card__header">
                    <h3 className="title title--card">Game Name - 30/08/25</h3>
                    <h4 className="subtitle subtitle--card">@myFriendPlace</h4>
                </div>
                <div className="card__body">
                    <p><FontAwesomeIcon icon={faTrophy} className="fa-icon" /> <span className="gray">Winner:</span> <span className="title--winner">Player X</span></p>
                    <p><FontAwesomeIcon icon={faUserGroup} className="fa-icon" /> <span className="gray">Player numbers:</span> 7</p>
                    <p><FontAwesomeIcon icon={faDollarSign} className="fa-icon" /> <span className="gray">Entry price:</span> 30€</p>
                    <p><FontAwesomeIcon icon={faSackDollar} className="fa-icon" /> <span className="gray">Total Cash Prize:</span> 240€</p>
                    <div className="btn btn--card"><FontAwesomeIcon icon={faChartBar} /> More stats</div>
                </div>
            </div>

            // TODO : Gérer en fonction de la page if '/games' alors afficher ça, sinon afficher tout l'historique 
            <div className="card card--plus">
                <p>View Game History</p>
            </div>
        </div>
    )
}