import { faPenToSquare, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function ProfilePage() {
  return (
    <>
      <h1><span className="red">UserName</span> Profile</h1>
      <section className="section section__user">
        <div className="cards">
            <div className="card user">
                <div className="user__avatar"><FontAwesomeIcon icon={faUser} size='xl' className='icon--avatar'/></div>
                <div className="user__infos">
                    <h2 className="title title--user red">UserName</h2>
                    <p className="subtitle subtitle--email">user@email.com</p>
                </div>
                <div className="user__description"><p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Error pariatur tenetur, ea provident dolor officia, fugit voluptas non esse et quae rerum delectus aliquam nihil expedita similique possimus porro molestias!</p></div>
                <div className="user__stats">
                    <div className="user__stat">
                        <h2 className="title title--stat">14</h2>
                        <p className="subtitle">Game Played</p>
                    </div>
                    <div className="user__stat">
                        <h2 className="title title--stat">37.5%</h2>
                        <p className="subtitle">Win Rate</p>
                    </div>
                </div>
                <div className="btn btn--user"><FontAwesomeIcon icon={faPenToSquare}/> Edit Profile</div>
            </div>
        </div>
      </section>
      <section className="section section__friends">
        <h2>Friends (4)</h2>
        <div className="cards cards--friends">
            <div className="card user user--friend">
                <div className="user__avatar user--friend__avatar"><FontAwesomeIcon icon={faUser} size='xl' className='icon--avatar'/></div>
                <div className="user__infos">
                    <h2 className="title title--friend">UserName</h2>
                </div>
            </div>
            <div className="card user user--friend">
                <div className="user__avatar user--friend__avatar"><FontAwesomeIcon icon={faUser} size='xl' className='icon--avatar'/></div>
                <div className="user__infos">
                    <h2 className="title title--friend">UserName</h2>
                </div>
            </div>
            <div className="card user user--friend">
                <div className="user__avatar user--friend__avatar"><FontAwesomeIcon icon={faUser} size='xl' className='icon--avatar'/></div>
                <div className="user__infos">
                    <h2 className="title title--friend">UserName</h2>
                </div>
            </div>
            <div className="card user user--friend">
                <div className="user__avatar user--friend__avatar"><FontAwesomeIcon icon={faUser} size='xl' className='icon--avatar'/></div>
                <div className="user__infos">
                    <h2 className="title title--friend">UserName</h2>
                </div>
            </div>
        </div>
        <div className="btn btn--full"><FontAwesomeIcon icon={faUserPlus}/> Add friends</div>
      </section>
    </>
  );
}