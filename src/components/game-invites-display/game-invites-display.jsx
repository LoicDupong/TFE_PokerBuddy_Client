"use client";

import { faCheck, faClock, faEye, faLocationDot, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import gameInviteService from "@/services/gameInvite.service.js";
import Link from "next/link.js";

export default function GameInvitesDisplay({ onAccept }) {
    const [invites, setInvites] = useState([]);
    const [actingId, setActingId] = useState(null);

    useEffect(() => {
        gameInviteService.getMyInvites().then((data) => setInvites(data || []));
    }, []);

    if (invites.length === 0) return null;

    const handleRespond = async (inviteId, action) => {
        if (actingId) return;
        setActingId(inviteId);
        const res = await gameInviteService.respond(inviteId, action);
        setActingId(null);
        if (res.success) {
            setInvites((prev) => prev.filter((i) => i.inviteId !== inviteId));
            if (action === "accepted") onAccept?.();
        }
    };

    return (
        <div className="cards cards--invites">
            {invites.map((invite) => {
                const dateStart = new Date(invite.dateStart);
                return (
                    <div key={invite.inviteId} className="card card--invite-game">
                        <div className="card__header">
                            <h3 className="title title--card">{invite.gameName}</h3>
                            <h4 className="subtitle subtitle--card">by {invite.host}</h4>
                        </div>
                        <div className="card__body">
                            {invite.location && (
                                <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {invite.location}</p>
                            )}
                            <p>
                                <FontAwesomeIcon icon={faClock} className="fa-icon" />
                                <span className="gray"> Meet up:</span>{" "}
                                {dateStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })}{" "}
                                {dateStart.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </p>
                            <div className="card__actions">
                                <button
                                    className="btn btn--accept"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite.inviteId, "accepted")}
                                >
                                    <FontAwesomeIcon icon={faCheck} />
                                </button>
                                <button
                                    className="btn btn--decline"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite.inviteId, "refused")}
                                >
                                    <FontAwesomeIcon icon={faXmark} />
                                </button>
                                <Link href={`/games/${invite.gameId}`}>
                                    <div className="btn btn--card">
                                        <FontAwesomeIcon icon={faEye} /> View
                                    </div>
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
