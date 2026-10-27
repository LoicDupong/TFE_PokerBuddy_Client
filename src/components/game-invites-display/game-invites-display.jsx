"use client";

import { faCheck, faClock, faEye, faLocationDot, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import gameInviteService from "@/services/gameInvite.service.js";
import useToastStore from "@/stores/useToastStore.js";
import { getLocalDayBounds } from "@/utils/date.utils.js";
import { inviteResponseToast } from "@/utils/game.utils.js";
import Link from "next/link.js";

export default function GameInvitesDisplay({ onAccept }) {
    const [invites, setInvites] = useState([]);
    const [actingId, setActingId] = useState(null);
    const { showToast } = useToastStore();

    useEffect(() => {
        // Les parties du jour ont leurs boutons sur leur carte dans "Today's Games"
        const { dayStart, dayEnd } = getLocalDayBounds();
        const isToday = (i) => i.dateStart >= dayStart && i.dateStart < dayEnd;
        gameInviteService.getMyInvites().then((data) => setInvites((data || []).filter((i) => !isToday(i))));
    }, []);

    if (invites.length === 0) return null;

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
                                    className="btn btn--card btn--primary"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite, "accepted")}
                                >
                                    <FontAwesomeIcon icon={faCheck} /> Accept
                                </button>
                                <button
                                    className="btn btn--card"
                                    disabled={!!actingId}
                                    onClick={() => handleRespond(invite, "refused")}
                                >
                                    <FontAwesomeIcon icon={faXmark} /> Refuse
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
