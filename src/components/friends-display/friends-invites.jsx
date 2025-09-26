"use client";

import {
    faCaretUp,
    faCaretDown,
    faUser,
    faCheck,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import friendService from "@/services/friend.service.js";
import FriendInvitesSkeleton from "./friends-invites-skeleton.jsx";
import { useEffect, useState } from 'react';

export default function FriendInviteDisplay() {
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        (async () => {
            const dataInvites = await friendService.getInvites();
            if (dataInvites) setInvites(dataInvites);
        })();
    }, []);

    console.log(invites);

    const handleRespond = async (inviteId, response) => {
        try {
            await friendService.respond(inviteId, response);
            setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
        } catch (err) {
            console.error("Error updating invite:", err);
            alert("Something went wrong, please try again.");
        }
    };

    if (!invites || invites.length === 0) return <FriendInvitesSkeleton />;

    return (
        <>
            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Friend <span className="red">Invites</span> ({invites.length})
                    <span className="expand" onClick={() => setIsExpanded(!isExpanded)}>
                        <FontAwesomeIcon icon={isExpanded ? faCaretUp : faCaretDown} />
                    </span>
                </h2>

                <div className={`cards cards--invites ${isExpanded ? "expanded" : "collapsed"}`}>
                    {invites.length > 0 ? (
                        invites.map((invite) => (
                            <div key={invite.id} className="card card--invite-friend">
                                <div className="card__body">
                                    <div className="user__avatar user--friend__avatar">
                                        {invite.User.avatar ? (
                                            <img src={`http://localhost:8080${invite.User.avatar}`} alt="User avatar" />
                                        ) : (
                                            <FontAwesomeIcon icon={faUser} size="xl" className="icon--avatar" />
                                        )}
                                    </div>
                                    <div className="user__infos">
                                        <h2 className="title title--friend">{invite.User.username}</h2>
                                    </div>
                                </div>
                                <div className="btn__invites">
                                    <button
                                        className="btn btn--accept"
                                        onClick={() => handleRespond(invite.id, "accept")}>
                                        <FontAwesomeIcon icon={faCheck} />
                                    </button>

                                    <button
                                        className="btn btn--decline"
                                        onClick={() => handleRespond(invite.id, "decline")}>
                                        <FontAwesomeIcon icon={faXmark} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p>No friend requests at the moment.</p>
                    )}
                </div>

            </section>
        </>
    )
}