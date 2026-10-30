import {
    faBell, faUserPlus, faUserCheck, faEnvelopeOpenText, faReply, faTrophy, faClock, faHeadset,
} from "@fortawesome/free-solid-svg-icons";

// Parties : referenceId = id de la partie
const gameLink = (notification) => (notification.referenceId ? `/games/${notification.referenceId}` : null);

/**
 * Une entrée par type de notification renvoyé par l'API : titre court (toast), icône, lien.
 * Nouveau type (ex. support_reply) : ajouter une entrée ici, la page Notifications et les toasts suivent.
 * link(notification, context) renvoie un chemin interne ou null (pas de lien).
 */
export const NOTIFICATION_TYPES = {
    friend_request: {
        title: "Friend request",
        icon: faUserPlus,
        // referenceId = id de la demande, pas de l'expéditeur : son profil seulement si on le connaît
        // (page Notifications), sinon la page Notifications, où la demande s'accepte ou se refuse
        link: (notification, { senderId } = {}) => (senderId ? `/profile/${senderId}` : "/notifications"),
    },
    friend_accepted: {
        title: "New friend",
        icon: faUserCheck,
        // Le nouvel ami apparaît dans la liste d'amis du profil
        link: () => "/profile",
    },
    game_invite: { title: "Game invite", icon: faEnvelopeOpenText, link: gameLink },
    game_invite_responded: { title: "Invite answered", icon: faReply, link: gameLink },
    game_result: { title: "Results are in", icon: faTrophy, link: gameLink },
    game_result_reminder: { title: "Results to submit", icon: faClock, link: gameLink },
    // Réponse du support : referenceId = id du ticket
    support_reply: {
        title: "Support reply",
        icon: faHeadset,
        link: (notification) => (notification.referenceId ? `/help/tickets/${notification.referenceId}` : "/help/tickets"),
    },
};

// Type inconnu du client (ajouté côté serveur avant le client) : toast générique, sans lien
const FALLBACK_TYPE = { title: "New notification", icon: faBell, link: () => null };

const getTypeConfig = (type) => NOTIFICATION_TYPES[type] ?? FALLBACK_TYPE;

export const getNotificationTitle = (notification) => getTypeConfig(notification?.type).title;

export const getNotificationIcon = (notification) => getTypeConfig(notification?.type).icon;

/**
 * Lien de l'élément concerné par une notification, ou null.
 * context : données connues en plus de la notification (ex. { senderId } pour une demande d'ami).
 */
export function getNotificationLink(notification, context = {}) {
    if (!notification) return null;
    return getTypeConfig(notification.type).link(notification, context) ?? null;
}
