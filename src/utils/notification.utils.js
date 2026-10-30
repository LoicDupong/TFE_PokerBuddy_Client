import {
    faBell, faUserPlus, faUserCheck, faEnvelopeOpenText, faReply, faTrophy, faClock, faHeadset, faBan,
} from "@fortawesome/free-solid-svg-icons";

// Textes des notifications, rendus d'après `type` + `params` (envoyés par l'API). Le `message` anglais
// du serveur ne sert que de repli (anciennes lignes sans params, type inconnu).
export const NOTIFICATION_MESSAGES = {
    en: {
        titles: {
            friend_request: "Friend request",
            friend_accepted: "New friend",
            game_invite: "Game invite",
            game_invite_responded: "Invite answered",
            game_result: "Results are in",
            game_result_reminder: "Results to submit",
            game_cancelled: "Game cancelled",
            support_reply: "Support reply",
            fallback: "New notification",
        },
        text: {
            friend_request: "{username} sent you a friend request",
            friend_accepted: "{username} accepted your friend request",
            game_invite: 'You were invited to "{gameName}"',
            game_invite_accepted: '{username} accepted your invitation to "{gameName}"',
            game_invite_declined: '{username} declined your invitation to "{gameName}"',
            game_invite_guest_accepted: '{username} (guest) accepted your invitation to "{gameName}"',
            game_invite_guest_declined: '{username} (guest) declined your invitation to "{gameName}"',
            player_deleted: 'A player who was coming to "{gameName}" deleted their account',
            game_result: 'Results for "{gameName}" are in',
            game_result_reminder: "Don't forget to submit results for \"{gameName}\"",
            game_cancelled_host_deleted: '"{gameName}" was cancelled because the host deleted their account',
            game_cancelled_admin: '"{gameName}" was cancelled by an administrator',
            support_reply: 'Support replied to "{subject}"',
        },
        dismiss: "Dismiss notification: {title}",
    },
    fr: {
        titles: {
            friend_request: "Demande d'ami",
            friend_accepted: "Nouvel ami",
            game_invite: "Invitation à une partie",
            game_invite_responded: "Invitation traitée",
            game_result: "Résultats disponibles",
            game_result_reminder: "Résultats à saisir",
            game_cancelled: "Partie annulée",
            support_reply: "Réponse du support",
            fallback: "Nouvelle notification",
        },
        text: {
            friend_request: "{username} t'a envoyé une demande d'ami",
            friend_accepted: "{username} a accepté ta demande d'ami",
            game_invite: "Tu es invité à « {gameName} »",
            game_invite_accepted: "{username} a accepté ton invitation à « {gameName} »",
            game_invite_declined: "{username} a refusé ton invitation à « {gameName} »",
            game_invite_guest_accepted: "{username} (invité) a accepté ton invitation à « {gameName} »",
            game_invite_guest_declined: "{username} (invité) a refusé ton invitation à « {gameName} »",
            player_deleted: "Un joueur qui devait venir à « {gameName} » a supprimé son compte",
            game_result: "Les résultats de « {gameName} » sont disponibles",
            game_result_reminder: "N'oublie pas de saisir les résultats de « {gameName} »",
            game_cancelled_host_deleted: "« {gameName} » a été annulée : l'hôte a supprimé son compte",
            game_cancelled_admin: "« {gameName} » a été annulée par un administrateur",
            support_reply: "Le support a répondu à « {subject} »",
        },
        dismiss: "Fermer la notification : {title}",
    },
};

// Parties : referenceId = id de la partie
const gameLink = (notification) => (notification.referenceId ? `/games/${notification.referenceId}` : null);

/**
 * Une entrée par type de notification renvoyé par l'API : titre court (toast), icône, lien.
 * Nouveau type (ex. support_reply) : ajouter une entrée ici, la page Notifications et les toasts suivent.
 * link(notification, context) renvoie un chemin interne ou null (pas de lien).
 */
export const NOTIFICATION_TYPES = {
    friend_request: {
        icon: faUserPlus,
        // referenceId = id de la demande, pas de l'expéditeur : son profil seulement si on le connaît
        // (page Notifications), sinon la page Notifications, où la demande s'accepte ou se refuse
        link: (notification, { senderId } = {}) => (senderId ? `/profile/${senderId}` : "/notifications"),
    },
    friend_accepted: {
        icon: faUserCheck,
        // Le nouvel ami apparaît dans la liste d'amis du profil
        link: () => "/profile",
    },
    game_invite: { icon: faEnvelopeOpenText, link: gameLink },
    game_invite_responded: { icon: faReply, link: gameLink },
    game_result: { icon: faTrophy, link: gameLink },
    game_result_reminder: { icon: faClock, link: gameLink },
    // Partie supprimée : pas de lien
    game_cancelled: { icon: faBan, link: () => null },
    // Réponse du support : referenceId = id du ticket
    support_reply: {
        icon: faHeadset,
        link: (notification) => (notification.referenceId ? `/help/tickets/${notification.referenceId}` : "/help/tickets"),
    },
};

// Type inconnu du client (ajouté côté serveur avant le client) : toast générique, sans lien
const FALLBACK_TYPE = { icon: faBell, link: () => null };

const getTypeConfig = (type) => NOTIFICATION_TYPES[type] ?? FALLBACK_TYPE;

// t : traducteur de NOTIFICATION_MESSAGES (useT(NOTIFICATION_MESSAGES))
export const getNotificationTitle = (notification, t) =>
    t(`titles.${NOTIFICATION_TYPES[notification?.type] ? notification.type : "fallback"}`);

// Texte dans la langue de l'utilisateur d'après les params ; repli sur le message anglais du serveur
export function getNotificationText(notification, t) {
    const { type, params, message } = notification ?? {};
    if (!params) return message;
    let key = null;
    switch (type) {
        case "game_invite_responded":
            if (params.reason === "player_deleted") key = "player_deleted";
            else if (params.status) key = `game_invite_${params.guest ? "guest_" : ""}${params.status === "accepted" ? "accepted" : "declined"}`;
            break;
        case "game_cancelled":
            key = params.reason === "admin" ? "game_cancelled_admin" : "game_cancelled_host_deleted";
            break;
        default:
            key = type;
    }
    if (!key || !(type in NOTIFICATION_TYPES)) return message;
    return t(`text.${key}`, params);
}

export const getNotificationIcon = (notification) => getTypeConfig(notification?.type).icon;

/**
 * Lien de l'élément concerné par une notification, ou null.
 * context : données connues en plus de la notification (ex. { senderId } pour une demande d'ami).
 */
export function getNotificationLink(notification, context = {}) {
    if (!notification) return null;
    return getTypeConfig(notification.type).link(notification, context) ?? null;
}
