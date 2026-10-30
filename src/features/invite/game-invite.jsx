"use client";

import userService from "@/services/user.service.js";
import FriendCard from "@/components/friend-card/friend-card.jsx";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { useT } from "@/i18n/i18n-provider.jsx";
import { PROFILE_MESSAGES } from "@/app/profile/profile.messages.js";

// invitedIds : amis déjà dans la partie (affichés "Invited", non sélectionnables)
export default function GameInvite({ invites, setInvites, onClose, onConfirm, invitedIds = [] }) {
    const { t } = useT(PROFILE_MESSAGES);
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) setUser(data.user);
        })();
    }, []);

    if (!user) return <p>{t("loading")}</p>;

    // ✅ Toggle un ami
    const toggleFriend = (friend) => {
        setInvites((prev) => {
            const already = prev.friends.find((f) => f.id === friend.id);
            return {
                ...prev,
                friends: already
                    ? prev.friends.filter((f) => f.id !== friend.id) // remove
                    : [...prev.friends, { id: friend.id, name: friend.username }], // add
            };
        });
    };

    // // ✅ Emails → tableau split/trim
    // const handleEmailChange = (e) => {
    //     const raw = e.target.value;
    //     const arr = raw
    //         .split(",")
    //         .map((mail) => mail.trim())
    //         .filter((mail) => mail.length > 0);
    //     setInvites((prev) => ({ ...prev, emails: arr }));
    // };

    // ✅ Emails → tableau split/trim
    const handleGuestChange = (e) => {
        const raw = e.target.value;
        const arr = raw
            .split(",")
            .map((guest) => guest.trim())
            .filter((guest) => guest.length > 0);
        setInvites((prev) => ({ ...prev, guests: arr }));
    };

    return (
        <div className="modal">
            <div className="modal__overlay" onClick={onClose}></div>
            <div className="modal__content">
                <button type="button" className="modal__close" onClick={onClose} aria-label={t("close")}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 className="modal__title">{t("invite")}</h2>

                {/* ✅ Emails
                <div className="form__row">
                    <label htmlFor="email">Add with email</label>
                    <textarea
                        id="email"
                        defaultValue={invites.emails.join(", ")} // ✅ garder valeur existante
                        onChange={handleEmailChange}
                        placeholder="Separate emails with commas ',' (email1@mail.com, email2@mail.com)"
                    />
                </div> */}

                {/* ✅ Friends list */}
                <div className="section section__friends">
                    <h3 id="game-invite-friends-title">{t("yourFriends")}</h3>
                    {user.friends?.length > 0 ? (
                        <ul className="friend-grid" aria-labelledby="game-invite-friends-title">
                            {user.friends.map((f) => {
                                const alreadyInvited = invitedIds.includes(f.id);
                                return (
                                    <li key={f.id}>
                                        {/* Vrai bouton à bascule : Entrée/Espace et aria-pressed natifs ;
                                            déjà invité = désactivé (hors tabulation, comme avant) */}
                                        <FriendCard
                                            user={f}
                                            onToggle={toggleFriend}
                                            selected={invites.friends.some((sf) => sf.id === f.id)}
                                            disabled={alreadyInvited}
                                            status={alreadyInvited ? t("invitedStatus") : null}
                                        />
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="empty-state">{t("noFriendsInvite")}</p>
                    )}
                </div>

                {/* ✅ Guests */}
                <div className="form__row">
                    <label htmlFor="guests">{t("addGuests")}</label>
                    <textarea
                        id="guests"
                        defaultValue={invites.guests.join(", ")} // ✅ garder valeur existante
                        onChange={handleGuestChange}
                        placeholder={t("guestsPh")}
                    />
                </div>

                {/* ✅ Selected friends */}
                <div className="section section__selected">
                    <h3>{t("selected")} ({invites.friends.length + invites.guests.length})</h3>
                    <div className="selected-container">
                        {invites.friends.map((f) => (
                            <div key={f.id} className="selected-friend">
                                {f.name}
                            </div>
                        ))}
                        {invites.guests.map((g, index) => (
                            <div key={index} className="selected-friend">
                                {g} {t("guestTag")}
                            </div>
                        ))}
                        {invites.friends.length === 0 && invites.guests.length === 0 && <p>{t("noneSelected")}</p>}
                        
                    </div>
                </div>

                {/* Confirm */}
                <button className="btn btn--full btn--primary" onClick={onConfirm ?? onClose}>
                    {t("confirm")}
                </button>
            </div>
        </div>
    );
}
