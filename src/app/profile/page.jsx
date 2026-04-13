"use client";

import FriendInviteDisplay from '@/components/friends-display/friends-invites.jsx';
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
                            <p>{user.description || "No description set."}</p>
                        </div>
                        <Link href={"/profile/edit"}>
                            <div className="btn btn--user">
                                <FontAwesomeIcon icon={faPenToSquare} /> Edit Profile
                            </div>
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FRIENDS --- */}
            <section className="section section__friends">
                <h2 className="red">Friends ({friends.length})</h2>
                <div className="cards cards--friends">
                    {friends.map((f) => (
                        <Link key={f.id} href={`/profile/${f.id}`}>
                            <div className="card user user--friend">
                                <div className="user__avatar user--friend__avatar">
                                    {f.avatar ? (
                                        <img src={serverUrl(f.avatar)} alt={f.username} />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                    )}
                                </div>
                                <div className="user__infos">
                                    <h2 className="title title--friend">{f.username}</h2>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <FriendInviteDisplay onAccept={refreshFriends} />

                <div className="btn btn--full" onClick={async () => { await refreshFriends(); setShowInviteModal(true); }}>
                    <FontAwesomeIcon icon={faUserPlus} /> Add friends
                </div>
            </section>

            {showInviteModal && (
                <FriendInvite onClose={() => setShowInviteModal(false)} friends={friends || []} />
            )}
        </>
    );
}
