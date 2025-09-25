"use client";

import userService from "@/services/user.service.js";
import { faXmark, faUser, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

export default function GameInvite({ invites, setInvites, onClose }) {
    const [user, setUser] = useState(null);

    useEffect(() => {
        (async () => {
            const data = await userService.getMe();
            if (data) setUser(data.user);
        })();
    }, []);

    if (!user) return <p>Loading...</p>;

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
                <button className="modal__close" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark} />
                </button>

                <h2 className="modal__title">Invite Friends</h2>

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
                    <h3>Your friends</h3>
                    <div className="cards cards--friends">
                        {user.friends.map((f) => (
                            <div
                                key={f.id}
                                className={`card user user--friend ${invites.friends.some((sf) => sf.id === f.id) ? "user--selected" : ""
                                    }`}
                                onClick={() => toggleFriend(f)}
                            >
                                <div className="user__avatar user--friend__avatar">
                                    {f.avatar ? (
                                        <img src={f.avatar} alt={f.username} />
                                    ) : (
                                        <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                    )}
                                </div>
                                <div className="user__infos">
                                    <h2 className="title title--friend">{f.username}</h2>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ✅ Guests */}
                <div className="form__row">
                    <label htmlFor="email">Add Guests</label>
                    <textarea
                        id="guests"
                        defaultValue={invites.guests.join(", ")} // ✅ garder valeur existante
                        onChange={handleGuestChange}
                        placeholder="Separate names with commas ',' (John, Jane, ...)"
                    />
                </div>

                {/* ✅ Selected friends */}
                <div className="section section__selected">
                    <h3>Selected Friends ({invites.friends.length + invites.guests.length})</h3>
                    <div className="selected-container">
                        {invites.friends.map((f) => (
                            <div key={f.id} className="selected-friend">
                                {f.name}
                            </div>
                        ))}
                        {invites.guests.map((g, index) => (
                            <div key={index} className="selected-friend">
                                {g} (Guest)
                            </div>
                        ))}
                        {invites.friends.length === 0 && invites.guests.length === 0 && <p>No friends or guests selected.</p>}
                        
                    </div>
                </div>

                {/* Confirm */}
                <button className="btn btn--full btn--primary" onClick={onClose}>
                    Confirm
                </button>
            </div>
        </div>
    );
}
