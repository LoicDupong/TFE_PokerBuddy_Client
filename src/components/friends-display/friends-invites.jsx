"use client";

import {
    faCaretUp,
    faCaretDown,
    faCheck,
    faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import friendService from "@/services/friend.service.js";
import useToastStore from "@/stores/useToastStore.js";
import FriendCard from "@/components/friend-card/friend-card.jsx";
import FriendInvitesSkeleton from "./friends-invites-skeleton.jsx";
import { useEffect, useState } from 'react';

export default function FriendInviteDisplay({ onAccept }) {
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const { showToast } = useToastStore();

    useEffect(() => {
        (async () => {
            const dataInvites = await friendService.getInvites();
            if (dataInvites) setInvites(dataInvites);
            setLoading(false);
        })();
    }, []);

    const handleRespond = async (invite, response) => {
        if (loadingId) return;
        setLoadingId(invite.id);
        const result = await friendService.respond(invite.id, response);
        setLoadingId(null);
        if (result.success) {
            setInvites(prev => prev.filter((i) => i.id !== invite.id));
            if (response === "accept") {
                showToast(`✅ You are now friends with ${invite.User.username}!`, "success", 5000);
                onAccept?.();
            }
        } else {
            showToast(result.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };

    if (loading) return <FriendInvitesSkeleton />;
    if (invites.length === 0) return <p>No friend requests at the moment.</p>;

    return (
        <>
            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Friend <span className="red">Invites</span> ({invites.length})
                    <button type="button" className="expand" onClick={() => setIsExpanded(!isExpanded)} aria-expanded={isExpanded} aria-controls="friend-invites-list" aria-label="Show friend invites">
                        <FontAwesomeIcon icon={isExpanded ? faCaretUp : faCaretDown} />
                    </button>
                </h2>

                {/* inert une fois replié : les boutons masqués ne doivent plus recevoir le focus clavier */}
                <div
                    id="friend-invites-list"
                    className={`cards cards--invites ${isExpanded ? "expanded" : "collapsed"}`}
                    inert={!isExpanded}
                >
                    <ul className="friend-grid friend-grid--rows">
                        {invites.map((invite) => (
                            <li key={invite.id}>
                                <FriendCard
                                    user={invite.User}
                                    layout="row"
                                    actions={
                                        <>
                                            <button
                                                type="button"
                                                className="btn btn--small btn--accept"
                                                aria-label={`Accept ${invite.User.username}`}
                                                disabled={loadingId === invite.id}
                                                onClick={() => handleRespond(invite, "accept")}>
                                                <FontAwesomeIcon icon={faCheck} />
                                            </button>
                                            <button
                                                type="button"
                                                className="btn btn--small btn--decline"
                                                aria-label={`Decline ${invite.User.username}`}
                                                disabled={loadingId === invite.id}
                                                onClick={() => handleRespond(invite, "decline")}>
                                                <FontAwesomeIcon icon={faXmark} />
                                            </button>
                                        </>
                                    }
                                />
                            </li>
                        ))}
                    </ul>
                </div>

            </section>
        </>
    )
}