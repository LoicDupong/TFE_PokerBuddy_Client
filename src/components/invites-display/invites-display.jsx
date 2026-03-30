"use client";

import gameInviteService from '@/services/gameInvite.service.js';
import { shortDateTime } from '@/utils/date.utils.js';
import {
    faCaretUp,
    faCaretDown,
    faCheck,
    faEye,
    faXmark
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link.js';
import { useEffect, useState } from 'react';
import InvitesSkeleton from './invites-skeleton.jsx';

export default function InvitesDisplay() {
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingId, setLoadingId] = useState(null);
    const [loading, setLoading] = useState(true);


    useEffect(() => {
        const fetchInvites = async () => {
            const dataInvites = await gameInviteService.getMyInvites();
            if (dataInvites) setInvites(dataInvites);
            setLoading(false);
        };

        fetchInvites();
        window.addEventListener("focus", fetchInvites);
        return () => window.removeEventListener("focus", fetchInvites);
    }, []);

    const handleRespond = async (inviteId, response) => {
        if (loadingId) return;
        setLoadingId(inviteId);
        const result = await gameInviteService.respond(inviteId, response);
        setLoadingId(null);
        if (result.success) {
            setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
        } else {
            alert(result.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };



    if (loading) return <InvitesSkeleton />;
    if (invites.length === 0) return <p>No game invites at the moment.</p>;

    return (
        <>
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
                                            disabled={loadingId === invite.inviteId}
                                            onClick={() => handleRespond(invite.inviteId, "accepted")}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>

                                        <button
                                            className="btn btn--decline"
                                            disabled={loadingId === invite.inviteId}
                                            onClick={() => handleRespond(invite.inviteId, "refused")}>
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
        </>
    )
}