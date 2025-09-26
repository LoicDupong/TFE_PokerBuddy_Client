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


    useEffect(() => {
        (async () => {
            const dataInvites = await gameInviteService.getMyInvites();
            if (dataInvites) setInvites(dataInvites);
        })();
    }, []);

    console.log(invites);


    const handleRespond = async (inviteId, response) => {
        try {
            await gameInviteService.respond(inviteId, response);
            setInvites(prev => prev.filter(invite => invite.inviteId !== inviteId));
        } catch (err) {
            console.error("Error updating invite:", err);
            alert("Something went wrong, please try again.");
        }
    };



    if (!invites || invites.length === 0) return <InvitesSkeleton />;

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
                                            onClick={() => handleRespond(invite.inviteId, "accepted")}>
                                            <FontAwesomeIcon icon={faCheck} />
                                        </button>

                                        <button
                                            className="btn btn--decline"
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