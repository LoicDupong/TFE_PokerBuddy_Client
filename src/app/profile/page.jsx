"use client";

import gameInviteService from '@/services/gameInvite.service.js';
import userService from '@/services/user.service.js';
import { shortDateTime } from '@/utils/date.utils.js';
import {
    faCaretUp,
    faCaretDown,
    faCheck,
    faEye,
    faPenToSquare,
    faUser,
    faUserPlus,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) setUser(data.user);
        })();
    }, []);

    useEffect(() => {
        (async () => {
            const dataInvites = await gameInviteService.getMyInvites();
            if (dataInvites) setInvites(dataInvites);
        })();
    }, []);

    if (!user) return <p>Loading...</p>;

    const handleRespond = async (inviteId, gameId, response) => {
        try {
            await gameInviteService.respond(gameId, response);

            // 🟢 supprime l'invite du tableau côté front
            setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
        } catch (err) {
            console.error("Error updating invite:", err);
            alert("Something went wrong, please try again.");
        }
    };

    return (
        <>
            <h1>
                <span className="red">Your</span> Profile
            </h1>

            {/* --- USER --- */}
            <section className="section section__user">
                <div className="cards">
                    <div className="card user">
                        <div className="user__avatar">
                            {user.avatar ? (
                                <img src={`http://localhost:8080${user.avatar}`} alt="User avatar" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                            )}
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
                                <h2 className="title title--stat">{user.stats.winRate}%</h2>
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

            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Game <span className="red">Invites</span> ({invites.length})
                    <span className="expand" onClick={() => setIsExpanded(!isExpanded)}>
                        <FontAwesomeIcon icon={isExpanded ? faCaretUp : faCaretDown} />
                    </span>
                </h2>

                <div className={`cards cards--invites ${isExpanded ? "expanded" : "collapsed"}`}>
                    {invites.length > 0 ? (
                        invites.map((invite) => (
                            <div key={invite.inviteId} className="card card--invite">
                                <div className="card__header">
                                    <h3 className="title title--card">{invite.gameName}</h3>
                                    <p className="subtitle subtitle--card">Invited by {invite.host}</p>
                                </div>
                                <div className="card__body">
                                    {/* 🔹 status de la game */}
                                    <div className="card__status">{invite.status}</div>
                                    <p className="subtitle">@{invite.location}</p>
                                    <p>{shortDateTime(invite.dateStart)}</p>

                                    <div className="btn__invites">
                                        <button
                                            className="btn btn--accept"
                                            onClick={() => handleRespond(invite.inviteId, invite.gameId, "accepted")}
                                        >
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>
                                        <button
                                            className="btn btn--decline"
                                            onClick={() => handleRespond(invite.inviteId, invite.gameId, "declined")}
                                        >
                                            <FontAwesomeIcon icon={faXmark} />
                                        </button>
                                        <Link href={`/games/${invite.gameId}`}>
                                            <button className="btn btn--info">
                                                <FontAwesomeIcon icon={faEye} /> View
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No game invites at the moment.</p>
                    )}
                </div>
            </section>

            {/* --- FRIENDS --- */}
            <section className="section section__friends">
                <h2 className="red">Friends ({user.friends.length})</h2>
                <div className="cards cards--friends">
                    {user.friends.map((f) => (
                        <Link key={f.id} href={`profile/${f.id}`}>
                            <div className="card user user--friend">
                                <div className="user__avatar user--friend__avatar">
                                    <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                </div>
                                <div className="user__infos">
                                    <h2 className="title title--friend">{f.username}</h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                <div className="btn btn--full">
                    <FontAwesomeIcon icon={faUserPlus} /> Add friends
                </div>
            </section>
        </>
    );
}
