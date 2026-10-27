"use client";

import "@/app/styles/pages/notifications.scss";

import useNotificationStore from "@/stores/useNotificationStore";
import useToastStore from "@/stores/useToastStore";
import friendService from "@/services/friend.service";
import gameInviteService from "@/services/gameInvite.service";
import { inviteResponseToast } from "@/utils/game.utils";
import {
    faBell, faCheck, faXmark, faUserPlus, faUserCheck, faEnvelopeOpenText,
    faReply, faTrophy, faClock,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

const TYPE_ICONS = {
    friend_request: faUserPlus,
    friend_accepted: faUserCheck,
    game_invite: faEnvelopeOpenText,
    game_invite_responded: faReply,
    game_result: faTrophy,
    game_result_reminder: faClock,
};

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isToday = (iso) => startOfDay(new Date(iso)).getTime() === startOfDay(new Date()).getTime();

// "Just now", "5 min ago", "2 h ago", "Yesterday", puis la date
function relativeTime(iso) {
    const date = new Date(iso);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes} min ago`;
    if (isToday(iso)) return `${Math.floor(minutes / 60)} h ago`;
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (days === 1) return "Yesterday";
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: days > 300 ? "numeric" : undefined });
}

export default function NotificationsPage() {
    const { notifications, fetchNotifications, markAllRead } = useNotificationStore();
    const [friendInvites, setFriendInvites] = useState([]);
    const [gameInvites, setGameInvites] = useState([]);
    const [actingId, setActingId] = useState(null);
    // Les listes d'invitations en attente sont chargées : sinon "Handled" s'afficherait par erreur
    const [friendsLoaded, setFriendsLoaded] = useState(false);
    const [gamesLoaded, setGamesLoaded] = useState(false);
    // Non lues à l'ouverture : tout est marqué lu aussitôt, mais on garde le repère visuel
    const [unreadIds, setUnreadIds] = useState(() => new Set());
    const { showToast } = useToastStore();

    // Fetch notifications and mark all read on mount
    useEffect(() => {
        (async () => {
            await fetchNotifications();
            // Union : en dev (StrictMode) l'effet tourne deux fois, la 2e lecture voit déjà tout "lu"
            const fresh = useNotificationStore.getState().notifications.filter((n) => !n.read).map((n) => n.id);
            setUnreadIds((prev) => new Set([...prev, ...fresh]));
            await markAllRead();
        })();
    }, []);

    // Fetch live invite lists only for types that need action buttons
    useEffect(() => {
        if (notifications.some((n) => n.type === "friend_request")) {
            friendService.getInvites().then((invites) => { setFriendInvites(invites || []); setFriendsLoaded(true); });
        }
        if (notifications.some((n) => n.type === "game_invite")) {
            gameInviteService.getMyInvites().then((invites) => { setGameInvites(invites || []); setGamesLoaded(true); });
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
            if (!invite) return friendsLoaded ? <span className="notification__status">Handled</span> : null;
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
            if (!invite) {
                // Réponse déjà donnée ailleurs : on garde le lien vers la partie
                return gamesLoaded ? (
                    <div className="notification__actions">
                        <span className="notification__status">Answered</span>
                        <Link href={`/games/${n.referenceId}`} className="notification__link">View game</Link>
                    </div>
                ) : null;
            }
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
                [["Today", notifications.filter((n) => isToday(n.createdAt))],
                 ["Earlier", notifications.filter((n) => !isToday(n.createdAt))]]
                    .filter(([, items]) => items.length > 0)
                    .map(([label, items]) => (
                        <section key={label} aria-labelledby={`notif-${label}`}>
                            <h2 id={`notif-${label}`} className="notifications__group">{label}</h2>
                            <ul className="notifications__list">
                                {items.map((n) => {
                                    const unread = unreadIds.has(n.id);
                                    return (
                                        <li key={n.id} className={`notification__item${unread ? " notification__item--unread" : ""}`}>
                                            <span className="notification__icon" aria-hidden="true">
                                                <FontAwesomeIcon icon={TYPE_ICONS[n.type] || faBell} />
                                            </span>
                                            <div className="notification__body">
                                                <p className="notification__message">
                                                    {unread && <span className="notification__dot" role="img" aria-label="Unread" />}
                                                    {n.message}
                                                </p>
                                                <small>{relativeTime(n.createdAt)}</small>
                                                {renderActions(n)}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ul>
                        </section>
                    ))
            )}
        </>
    );
}
