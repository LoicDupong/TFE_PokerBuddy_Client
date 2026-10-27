"use client";

import useNotificationStore from "@/stores/useNotificationStore";
import useToastStore from "@/stores/useToastStore";
import friendService from "@/services/friend.service";
import gameInviteService from "@/services/gameInvite.service";
import { inviteResponseToast } from "@/utils/game.utils";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotificationsPage() {
    const { notifications, fetchNotifications, markAllRead } = useNotificationStore();
    const [friendInvites, setFriendInvites] = useState([]);
    const [gameInvites, setGameInvites] = useState([]);
    const [actingId, setActingId] = useState(null);
    const { showToast } = useToastStore();

    // Fetch notifications and mark all read on mount
    useEffect(() => {
        (async () => {
            await fetchNotifications();
            await markAllRead();
        })();
    }, []);

    // Fetch live invite lists only for types that need action buttons
    useEffect(() => {
        if (notifications.some((n) => n.type === "friend_request")) {
            friendService.getInvites().then((invites) => setFriendInvites(invites || []));
        }
        if (notifications.some((n) => n.type === "game_invite")) {
            gameInviteService.getMyInvites().then((invites) => setGameInvites(invites || []));
        }
    }, [notifications]);

    const handleFriendRespond = async (invite, action) => {
        if (actingId) return;
        setActingId(invite.id);
        const res = await friendService.respond(invite.id, action);
        setActingId(null);
        if (res.success) {
            setFriendInvites((prev) => prev.filter((i) => i.id !== invite.id));
            if (action === "accept") showToast(`✅ You are now friends with ${invite.User.username}!`, "success", 5000);
        } else {
            showToast(res.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };

    const handleGameRespond = async (invite, action) => {
        if (actingId) return;
        setActingId(invite.inviteId);
        const res = await gameInviteService.respond(invite.inviteId, action);
        setActingId(null);
        if (res.success) {
            setGameInvites((prev) => prev.filter((i) => i.inviteId !== invite.inviteId));
            showToast(...inviteResponseToast(action, invite.gameName));
        } else {
            showToast(res.errorMessage?.[0] || "Something went wrong, please try again.");
        }
    };

    const renderActions = (n) => {
        if (n.type === "friend_request") {
            // Match by Friend record id stored as referenceId
            const invite = friendInvites.find((i) => i.id === n.referenceId);
            if (!invite) return null; // already responded elsewhere — hide buttons, keep message
            return (
                <div className="notification__actions">
                    <Link href={`/profile/${invite.User.id}`} className="notification__link">
                        {invite.User.username}
                    </Link>
                    <button
                        className="btn btn--small btn--primary"
                        disabled={!!actingId}
                        onClick={() => handleFriendRespond(invite, "accept")}
                        aria-label="Accept friend request"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                        className="btn btn--small"
                        disabled={!!actingId}
                        onClick={() => handleFriendRespond(invite, "decline")}
                        aria-label="Decline friend request"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            );
        }

        if (n.type === "game_invite") {
            // Match by game id stored as referenceId
            const invite = gameInvites.find((i) => i.gameId === n.referenceId);
            if (!invite) return null; // already responded elsewhere — hide buttons, keep message
            return (
                <div className="notification__actions">
                    <Link href={`/games/${invite.gameId}`} className="notification__link">
                        View game
                    </Link>
                    <button
                        className="btn btn--small btn--primary"
                        disabled={!!actingId}
                        onClick={() => handleGameRespond(invite, "accepted")}
                        aria-label="Accept game invitation"
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                        className="btn btn--small"
                        disabled={!!actingId}
                        onClick={() => handleGameRespond(invite, "refused")}
                        aria-label="Decline game invitation"
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            );
        }

        if (n.type === "game_result" || n.type === "game_invite_responded") {
            return (
                <div className="notification__actions">
                    <Link href={`/games/${n.referenceId}`} className="notification__link">
                        View game
                    </Link>
                </div>
            );
        }

        if (n.type === "game_result_reminder") {
            return (
                <div className="notification__actions">
                    <Link href={`/games/${n.referenceId}`} className="notification__link">
                        Submit results
                    </Link>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <h1>
                <FontAwesomeIcon icon={faBell} /> Notifications
            </h1>
            <div className="divider"></div>

            {notifications.length === 0 ? (
                <p>You&apos;re all caught up.</p>
            ) : (
                <ul className="notifications__list">
                    {notifications.map((n) => (
                        <li
                            key={n.id}
                            className={`notification__item${n.read ? "" : " notification__item--unread"}`}
                        >
                            <p>{n.message}</p>
                            <small>{new Date(n.createdAt).toLocaleDateString()}</small>
                            {renderActions(n)}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
