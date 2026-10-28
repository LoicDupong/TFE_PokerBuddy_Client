"use client";

import FriendInviteDisplay from '@/components/friends-display/friends-invites.jsx';
import FriendInvite from '@/features/invite/friend-invite.jsx';
import FriendCard from '@/components/friend-card/friend-card.jsx';
import userService from '@/services/user.service.js';
import {
    faPenToSquare,
    faUser,
    faUserPlus,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import { serverUrl } from '@/utils/media.js';

export default function ProfilePage() {
    const [user, setUser] = useState(null);
    const [friends, setFriends] = useState(null);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const refreshFriends = async () => {
        const data = await userService.getMe();
        if (data) setFriends(data.user.friends || []);
    };

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) {
                setFriends(data.user.friends || []);
                setUser(data.user);
            }
        })();
    }, []);


    if (!user) return <p>Loading...</p>;

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
                                <img src={serverUrl(user.avatar)} alt="User avatar" />
                            ) : (
                                <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                            )}
                        </div>
                        <div className="user__infos">
                            <h2 className="title title--user red">{user.username}</h2>
                            <p className="subtitle subtitle--email">{user.email}</p>
                        </div>
                        <div className="user__description">
                            {user.description ? (
                                <p>{user.description}</p>
                            ) : (
                                <p className="gray">
                                    Tell your friends who they are playing with.{" "}
                                    <Link href="/profile/edit" className="link">Add a short bio</Link>
                                </p>
                            )}
                        </div>
                        {/* Sur ordinateur, seules les 4 stats principales restent (les --extra sont masquées) */}
                        <div className="user__stats">
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.totalGames || 0}</h2>
                                <p className="subtitle">Games Played</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.winRate ? `${user.stats.winRate}%` : "0%"}</h2>
                                <p className="subtitle">Win Rate</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.wins || 0}</h2>
                                <p className="subtitle">Wins</p>
                            </div>
                            <div className="user__stat user__stat--extra">
                                <h2 className="title title--stat">{user.stats?.avgPlacement ?? "-"}</h2>
                                <p className="subtitle">Avg. Place</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.gamesHosted || 0}</h2>
                                <p className="subtitle">Hosted</p>
                            </div>
                            <div className="user__stat user__stat--extra">
                                <h2 className="title title--stat">{user.stats?.bestStreak || 0}</h2>
                                <p className="subtitle">Best Streak</p>
                            </div>
                        </div>
                        <Link href={"/profile/edit"} className="btn btn--user">
                            <FontAwesomeIcon icon={faPenToSquare} /> Edit Profile
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FRIENDS --- */}
            <section className="section section__friends">
                <h2 className="red" id="friends-title">Friends ({friends.length})</h2>
                {friends.length > 0 ? (
                    <ul className="friend-grid" aria-labelledby="friends-title">
                        {friends.map((f) => (
                            <li key={f.id}>
                                <FriendCard user={f} href={`/profile/${f.id}`} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">No friends yet. Add your poker crew below.</p>
                )}

                <FriendInviteDisplay onAccept={refreshFriends} />

                <button type="button" className="btn btn--full" onClick={async () => { await refreshFriends(); setShowInviteModal(true); }}>
                    <FontAwesomeIcon icon={faUserPlus} /> Add friends
                </button>
            </section>

            {showInviteModal && (
                <FriendInvite onClose={() => setShowInviteModal(false)} friends={friends || []} />
            )}
        </>
    );
}
