"use client";

import { faCheck, faEye, faLocationDot, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import gameInviteService from "@/services/gameInvite.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { relativeDateTime } from "@/utils/date.utils.js";
import { inviteResponseToast } from "@/utils/game.utils.js";
import Link from "next/link.js";

export default function GameInvitesDisplay({ excludeId, onAccept }) {
    const [invites, setInvites] = useState([]);
    const [actingId, setActingId] = useState(null);
    const { showToast } = useToastStore();

    useEffect(() => {
        gameInviteService.getMyInvites().then((data) => setInvites(data || []));
    }, []);

    // La partie déjà mise en avant dans "Your next game" n'est pas répétée
    const visible = invites.filter((i) => i.gameId !== excludeId);
    if (visible.length === 0) return null;

    const handleRespond = async (invite, action) => {
        if (actingId) return;
        setActingId(invite.inviteId);
        const res = await gameInviteService.respond(invite.inviteId, action);
        setActingId(null);
        if (res.success) {
            setInvites((prev) => prev.filter((i) => i.inviteId !== invite.inviteId));
            showToast(...inviteResponseToast(action, invite.gameName));
            if (action === "accepted") onAccept?.();
        } else {
            showToast(res.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };

    return (
        <div className="cards cards--invites">
            {visible.map((invite) => {
                return (
                    <div key={invite.inviteId} className="card card--invite-game">
                        <div className="card__header">
                            <h3 className="title title--card">{invite.gameName}</h3>
                            <p className="card__when">{relativeDateTime(invite.dateStart)}</p>
                            <h4 className="subtitle subtitle--card">by {invite.host}</h4>
                        </div>
                        <div className="card__body">
                            {invite.location && (
                                <p><FontAwesomeIcon icon={faLocationDot} className="fa-icon" /> {invite.location}</p>
                            )}
                            <div className="card__actions">
                                <button
                                    type="button"
                                    className="btn btn--card"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite, "accepted")}
                                >
                                    <FontAwesomeIcon icon={faCheck} /> Accept
                                </button>
                                <button
                                    type="button"
                                    className="btn btn--card btn--secondary"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite, "refused")}
                                >
                                    <FontAwesomeIcon icon={faXmark} /> Refuse
                                </button>
                                <Link href={`/games/${invite.gameId}`} className="btn btn--card btn--link">
                                    <FontAwesomeIcon icon={faEye} /> View
                                </Link>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
