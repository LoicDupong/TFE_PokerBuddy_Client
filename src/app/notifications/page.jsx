"use client";

import "@/app/styles/pages/notifications.scss";

import useNotificationStore from "@/stores/useNotificationStore";
import useToastStore from "@/stores/useToastStore";
import friendService from "@/services/friend.service";
import gameInviteService from "@/services/gameInvite.service";
import { useInviteResponseToast } from "@/utils/game-labels.utils";
import {
    NOTIFICATION_MESSAGES, getNotificationIcon, getNotificationLink, getNotificationText,
} from "@/utils/notification.utils";
import { useT } from "@/i18n/i18n-provider.jsx";
import { COMMON } from "@/i18n/common.js";
import { useDisplayName } from "@/utils/player-name.utils";
import { faBell, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";
import { useEffect, useState } from "react";

const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const isToday = (iso) => startOfDay(new Date(iso)).getTime() === startOfDay(new Date()).getTime();

const MESSAGES = {
    en: {
        ...COMMON.en,
        title: "Notifications",
        caughtUp: "You're all caught up.",
        today: "Today",
        earlier: "Earlier",
        unread: "Unread",
        handled: "Handled",
        answered: "Answered",
        viewGame: "View game",
        viewReply: "View reply",
        submitResults: "Submit results",
        acceptFriend: "Accept friend request",
        declineFriend: "Decline friend request",
        acceptGame: "Accept game invitation",
        declineGame: "Decline game invitation",
        nowFriends: "You are now friends with {name}!",
        justNow: "Just now",
        minutesAgo: "{n} min ago",
        hoursAgo: "{n} h ago",
        yesterday: "Yesterday",
    },
    fr: {
        ...COMMON.fr,
        title: "Notifications",
        caughtUp: "Tu es à jour.",
        today: "Aujourd'hui",
        earlier: "Plus tôt",
        unread: "Non lue",
        handled: "Traitée",
        answered: "Répondu",
        viewGame: "Voir la partie",
        viewReply: "Voir la réponse",
        submitResults: "Saisir les résultats",
        acceptFriend: "Accepter la demande d'ami",
        declineFriend: "Refuser la demande d'ami",
        acceptGame: "Accepter l'invitation à la partie",
        declineGame: "Refuser l'invitation à la partie",
        nowFriends: "Tu es maintenant ami avec {name} !",
        justNow: "À l'instant",
        minutesAgo: "il y a {n} min",
        hoursAgo: "il y a {n} h",
        yesterday: "Hier",
    },
};

// "À l'instant", "il y a 5 min", "il y a 2 h", "Hier", puis la date
function relativeTime(iso, t, intlLocale) {
    const date = new Date(iso);
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    if (minutes < 1) return t("justNow");
    if (minutes < 60) return t("minutesAgo", { n: minutes });
    if (isToday(iso)) return t("hoursAgo", { n: Math.floor(minutes / 60) });
    const days = Math.round((startOfDay(new Date()) - startOfDay(date)) / 86400000);
    if (days === 1) return t("yesterday");
    return date.toLocaleDateString(intlLocale, { day: "numeric", month: "short", year: days > 300 ? "numeric" : undefined });
}

export default function NotificationsPage() {
    const { t, intlLocale } = useT(MESSAGES);
    const { t: tn } = useT(NOTIFICATION_MESSAGES);
    const displayName = useDisplayName();
    const inviteToast = useInviteResponseToast();
    // Sélecteurs : la page ne se re-rend pas à chaque toast
    const notifications = useNotificationStore((state) => state.notifications);
    const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
    const markAllRead = useNotificationStore((state) => state.markAllRead);
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
            if (action === "accept") showToast(`✅ ${t("nowFriends", { name: displayName(invite.User.username) })}`, "success", 5000);
        } else {
            showToast(t("genericError"));
        }
    };

    const handleGameRespond = async (invite, action) => {
        if (actingId) return;
        setActingId(invite.inviteId);
        const res = await gameInviteService.respond(invite.inviteId, action);
        setActingId(null);
        if (res.success) {
            setGameInvites((prev) => prev.filter((i) => i.inviteId !== invite.inviteId));
            showToast(...inviteToast(action, invite.gameName));
        } else {
            showToast(t("genericError"));
        }
    };

    const renderActions = (n) => {
        // Lien commun avec les toasts (utils/notification.utils.js)
        const link = getNotificationLink(n);

        if (n.type === "friend_request") {
            // Match by Friend record id stored as referenceId
            const invite = friendInvites.find((i) => i.id === n.referenceId);
            if (!invite) return friendsLoaded ? <span className="notification__status">{t("handled")}</span> : null;
            return (
                <div className="notification__actions">
                    <Link href={getNotificationLink(n, { senderId: invite.User.id })} className="notification__link">
                        {displayName(invite.User.username)}
                    </Link>
                    <button
                        className="btn btn--small btn--primary"
                        disabled={!!actingId}
                        onClick={() => handleFriendRespond(invite, "accept")}
                        aria-label={t("acceptFriend")}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                        className="btn btn--small"
                        disabled={!!actingId}
                        onClick={() => handleFriendRespond(invite, "decline")}
                        aria-label={t("declineFriend")}
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
                        <span className="notification__status">{t("answered")}</span>
                        {link && <Link href={link} className="notification__link">{t("viewGame")}</Link>}
                    </div>
                ) : null;
            }
            return (
                <div className="notification__actions">
                    {link && (
                        <Link href={link} className="notification__link">
                            {t("viewGame")}
                        </Link>
                    )}
                    <button
                        className="btn btn--small btn--primary"
                        disabled={!!actingId}
                        onClick={() => handleGameRespond(invite, "accepted")}
                        aria-label={t("acceptGame")}
                    >
                        <FontAwesomeIcon icon={faCheck} />
                    </button>
                    <button
                        className="btn btn--small"
                        disabled={!!actingId}
                        onClick={() => handleGameRespond(invite, "refused")}
                        aria-label={t("declineGame")}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>
            );
        }

        if ((n.type === "game_result" || n.type === "game_invite_responded") && link) {
            return (
                <div className="notification__actions">
                    <Link href={link} className="notification__link">
                        {t("viewGame")}
                    </Link>
                </div>
            );
        }

        if (n.type === "support_reply" && link) {
            return (
                <div className="notification__actions">
                    <Link href={link} className="notification__link">
                        {t("viewReply")}
                    </Link>
                </div>
            );
        }

        if (n.type === "game_result_reminder" && link) {
            return (
                <div className="notification__actions">
                    <Link href={link} className="notification__link">
                        {t("submitResults")}
                    </Link>
                </div>
            );
        }

        return null;
    };

    return (
        <>
            <h1>
                <FontAwesomeIcon icon={faBell} /> {t("title")}
            </h1>
            <div className="divider"></div>

            {notifications.length === 0 ? (
                <p>{t("caughtUp")}</p>
            ) : (
                [["today", notifications.filter((n) => isToday(n.createdAt))],
                 ["earlier", notifications.filter((n) => !isToday(n.createdAt))]]
                    .filter(([, items]) => items.length > 0)
                    .map(([label, items]) => (
                        <section key={label} aria-labelledby={`notif-${label}`}>
                            <h2 id={`notif-${label}`} className="notifications__group">{t(label)}</h2>
                            <ul className="notifications__list">
                                {items.map((n) => {
                                    const unread = unreadIds.has(n.id);
                                    return (
                                        <li key={n.id} className={`notification__item${unread ? " notification__item--unread" : ""}`}>
                                            <span className="notification__icon" aria-hidden="true">
                                                <FontAwesomeIcon icon={getNotificationIcon(n)} />
                                            </span>
                                            <div className="notification__body">
                                                <p className="notification__message">
                                                    {unread && <span className="notification__dot" role="img" aria-label={t("unread")} />}
                                                    {getNotificationText(n, tn)}
                                                </p>
                                                <small>{relativeTime(n.createdAt, t, intlLocale)}</small>
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
