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
import { useT } from "@/i18n/i18n-provider.jsx";
import { PROFILE_MESSAGES } from "@/app/profile/profile.messages.js";
import { useDisplayName } from "@/utils/player-name.utils.js";
import { useServerError } from "@/utils/server-errors.utils.js";

export default function ProfilePage() {
    const { t } = useT(PROFILE_MESSAGES);
    const displayName = useDisplayName();
    const serverError = useServerError();
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


    if (!user) return <p>{t("loading")}</p>;

    return (
        <>
            <h1>
                <span className="red">{t("yourRed")}</span> {t("profile")}
            </h1>

            {/* --- USER --- */}
            <section className="section section__user">
                <div className="cards">
                    <div className="card user">
                        <div className="user__avatar">
                            {user.avatar ? (
                                <img src={serverUrl(user.avatar)} alt={t("avatarAlt")} />
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
                                    {t("tellFriends")}{" "}
                                    <Link href="/profile/edit" className="link">{t("addBio")}</Link>
                                </p>
                            )}
                        </div>
                        {/* Sur ordinateur, seules les 4 stats principales restent (les --extra sont masquées) */}
                        <div className="user__stats">
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.totalGames || 0}</h2>
                                <p className="subtitle">{t("gamesPlayed")}</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.winRate ? `${user.stats.winRate}%` : "0%"}</h2>
                                <p className="subtitle">{t("winRate")}</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.wins || 0}</h2>
                                <p className="subtitle">{t("wins")}</p>
                            </div>
                            <div className="user__stat user__stat--extra">
                                <h2 className="title title--stat">{user.stats?.avgPlacement ?? "-"}</h2>
                                <p className="subtitle">{t("avgPlace")}</p>
                            </div>
                            <div className="user__stat">
                                <h2 className="title title--stat">{user.stats?.gamesHosted || 0}</h2>
                                <p className="subtitle">{t("hosted")}</p>
                            </div>
                            <div className="user__stat user__stat--extra">
                                <h2 className="title title--stat">{user.stats?.bestStreak || 0}</h2>
                                <p className="subtitle">{t("bestStreak")}</p>
                            </div>
                        </div>
                        <Link href={"/profile/edit"} className="btn btn--user">
                            <FontAwesomeIcon icon={faPenToSquare} /> {t("editProfile")}
                        </Link>
                    </div>
                </div>
            </section>

            {/* --- FRIENDS --- */}
            <section className="section section__friends">
                <h2 className="red" id="friends-title">{t("friends")} ({friends.length})</h2>
                {friends.length > 0 ? (
                    <ul className="friend-grid" aria-labelledby="friends-title">
                        {friends.map((f) => (
                            <li key={f.id}>
                                <FriendCard user={f} href={`/profile/${f.id}`} />
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="empty-state">{t("noFriends")}</p>
                )}

                <FriendInviteDisplay onAccept={refreshFriends} />

                <button type="button" className="btn btn--full" onClick={async () => { await refreshFriends(); setShowInviteModal(true); }}>
                    <FontAwesomeIcon icon={faUserPlus} /> {t("addFriends")}
                </button>
            </section>

            {showInviteModal && (
                <FriendInvite onClose={() => setShowInviteModal(false)} friends={friends || []} />
            )}
        </>
    );
}
