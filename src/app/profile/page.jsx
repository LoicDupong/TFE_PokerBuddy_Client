"use client";

import userService from '@/services/user.service.js';
import { faPenToSquare, faUser, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) setUser(data.user);
        })();
    }, []);

    if (!user) return <p>Loading...</p>;
    console.log(user);



    return (
        <>
            <h1>
                <span className="red">Your</span> Profile
            </h1>
            <section className="section section__user">
                <div className="cards">
                    <div className="card user">
                        <div className="user__avatar">
                            {user.avatar
                                ? <img src={`http://localhost:8080${user.avatar}`} alt="User avatar" />
                                : <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                            }
                        </div>
                        <div className="user__infos">
                            <h2 className="title title--user red">{user.username}</h2>
                            <p className="subtitle subtitle--email">{user.email}</p>
                        </div>
                        <div className="user__description">
                            <p>{user.description || "No description set."}</p>
                        </div>
                        <div className="user__stats">
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats.totalGames}</h2>
                                <p className="subtitle">Games Played</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">
                                    {user.stats.winRate.toFixed(2)}%
                                </h2>
                                <p className="subtitle">Win Rate</p>
                            </div>
                        </div>
                        <Link href={"/profile/edit"}>
                            <div className="btn btn--user">
                                <FontAwesomeIcon icon={faPenToSquare} /> Edit Profile
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            <section className="section section__friends">
                <h2>Friends ({user.friends.length})</h2>
                <div className="cards cards--friends">
                    {user.friends.map((f) => (
                        <div key={f.id} className="card user user--friend">
                            <div className="user__avatar user--friend__avatar">
                                <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                            </div>
                            <div className="user__infos">
                                <h2 className="title title--friend">{f.username}</h2>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="btn btn--full">
                    <FontAwesomeIcon icon={faUserPlus} /> Add friends
                </div>
            </section>
        </>
    );
}