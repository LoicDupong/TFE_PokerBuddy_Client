"use client";

import gameInviteService from '@/services/gameInvite.service.js';
import { relativeDateTime } from '@/utils/date.utils.js';
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
import useToastStore from "@/stores/useToastStore.js";
import InvitesSkeleton from './invites-skeleton.jsx';

export default function InvitesDisplay() {
    const [invites, setInvites] = useState([]);
    const [isExpanded, setIsExpanded] = useState(true);
    const [loadingId, setLoadingId] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToastStore();


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
            showToast(result.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };



    if (loading) return <InvitesSkeleton />;
    // Pas d'invitation : rien à montrer (pas de bloc vide en tête de page)
    if (invites.length === 0) return null;

    return (
        <>
            {/* --- INVITES --- */}
            <section className="section section__invites">
                <h2>
                    Game <span className="red">Invites</span> ({invites.length})
                    <button type="button" className="expand" aria-expanded={isExpanded} aria-label="Toggle invitations" onClick={() => setIsExpanded(!isExpanded)}>
                        <FontAwesomeIcon icon={isExpanded ? faCaretUp : faCaretDown} />
                    </button>
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
                                    <p className="card__when">{relativeDateTime(invite.dateStart)}</p>
                                    <p><span className="chip">Upcoming</span></p>
                                    {invite.location && <p className="subtitle">@{invite.location}</p>}

                                    <div className="card__actions">
                                        <button
                                            type="button"
                                            className="btn btn--card"
                                            disabled={loadingId === invite.inviteId}
                                            onClick={() => handleRespond(invite.inviteId, "accepted")}>
                                            <FontAwesomeIcon icon={faCheck} /> Accept
                                        </button>
                                        <button
                                            type="button"
                                            className="btn btn--card btn--secondary"
                                            disabled={loadingId === invite.inviteId}
                                            onClick={() => handleRespond(invite.inviteId, "refused")}>
                                            <FontAwesomeIcon icon={faXmark} /> Refuse
                                        </button>
                                        <Link href={`/games/${invite.gameId}`} className="btn btn--card btn--link">
                                            <FontAwesomeIcon icon={faEye} /> View
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