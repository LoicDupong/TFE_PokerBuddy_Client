"use client";

import FriendInviteDisplay from '@/components/friends-display/friends-invites.jsx';
import InvitesDisplay from '@/components/invites-display/invites-display.jsx';
import FriendInvite from '@/features/invite/friend-invite.jsx';
import userService from '@/services/user.service.js';
import {
    faPenToSquare,
    faUser,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) {
                const acceptedFriends = data.user.Friends.filter(friendship =>
                    friendship.Friend.status === "accepted"
                );
                setFriends(acceptedFriends);
                setUser(data.user);
            }
        })();
    }, []);


    if (!user) return <p>Loading...</p>;
    console.log(friends);

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
            <InvitesDisplay />

            {/* --- FRIENDS --- */}
            <section className="section section__friends">
                <h2 className="red">Friends ({friends.length})</h2>
                <div className="cards cards--friends">
                    {friends.map((f) => (
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

                <FriendInviteDisplay />

                <div className="btn btn--full" onClick={() => setShowInviteModal(true)}>
                    <FontAwesomeIcon icon={faUserPlus} /> Add friends
                </div>
            </section>

            {showInviteModal && (
                <FriendInvite onClose={() => setShowInviteModal(false)} />
            )}
        </>
    );
}
