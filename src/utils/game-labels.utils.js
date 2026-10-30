import { useT } from "@/i18n/i18n-provider.jsx";
import { COMMON } from "@/i18n/common.js";

// Textes partagés par les écrans généraux (accueil, notifications, listes de parties, join)
const MESSAGES = {
    en: {
        accepted: 'Accepted "{name}"',
        refused: 'Refused "{name}"',
        status: { pending: "Upcoming", active: "Live", finished: "Finished" },
    },
    fr: {
        accepted: "Tu as accepté « {name} »",
        refused: "Tu as refusé « {name} »",
        status: { pending: "À venir", active: "En cours", finished: "Terminée" },
    },
};

// const inviteToast = useInviteResponseToast() ; showToast(...inviteToast("accepted", game.name))
export function useInviteResponseToast() {
    const { t } = useT(MESSAGES);
    return (action, gameName) => action === "accepted"
        ? [`✅ ${t("accepted", { name: gameName })}`, "success", 5000]
        : [t("refused", { name: gameName }), "info", 5000];
}

export function useGameStatusLabel() {
    const { t } = useT(MESSAGES);
    return (status) => (MESSAGES.en.status[status] ? t(`status.${status}`) : status);
}

// Textes des cartes et fiches de parties (accueil, listes, détails d'une partie à venir / en cours / passée)
export const GAME_LISTS = {
    en: {
        ...COMMON.en,
        host: "Host: {name}", hostedBy: "Hosted by", by: "by {name}",
        entry: "Entry price:", prizePool: "Prize pool:", placesPaid: "Places paid:", distribution: "Prize distribution:",
        players: "Players:", playersList: "Players list", confirmedInvited: (p) => `${p.confirmed} confirmed · ${p.invited} invited`,
        level1: "Level 1:", blinds: "Blinds", meetUp: "Meet up:", tableStart: "Table start:", started: "Started:", ended: "Ended:",
        winner: "Winner:", na: "N/A", guest: "Guest", note: "Note:", money: "Money",
        moreInfos: "More infos", moreStats: "More stats", viewGame: "View game", view: "View", accept: "Accept", refuse: "Refuse",
        addToCalendar: "Add to calendar", showMore: (p) => `Show more (${p.n})`, showLess: "Show less",
        noUpcoming: "No upcoming games yet.", nothingElse: "Nothing else planned yet.", noFinished: "No finished games yet.",
        inProgress: "Details update in progress...", history: "View Game History",
        todays: "games", todaysRed: "Today's", willYouPlay: "Will you play?",
        yourNext: "Your next game", loadingNext: "Loading your next game", noGame: "No game planned yet.", createGame: "Create a game",
        startManager: "Start Game Manager", inviteFriends: "Invite friends", hosting: "You are hosting", yourAnswer: "Your answer:",
        playersFact: (p) => `Players: ${p.confirmed} confirmed · ${p.invited} invited`,
        areYouIn: "Are you in?", imIn: "I'm in", cantMakeIt: "Can't make it", answerGroup: "Answer the invitation",
        youAnswered: "You answered:", changeAnswer: "Change my answer",
        playerStatus: { pending: "pending", accepted: "accepted", refused: "refused", declined: "declined" },
        loadingLb: "Loading leaderboard...", noFriendsStats: "No friends with stats yet.", player: "Player", wins: "Wins",
        winrate: "Winrate", games: "Games", avgPlace: "Avg Place", net: "Net", you: "You", fullLb: "View full leaderboard",
        prev: "← Prev", next: "Next →",
        status: { pending: "Upcoming", active: "Live", finished: "Finished" },
        gameTitle: "Game", gameTitleRed: "Invites", toggleInvites: "Toggle invitations", invitedBy: "Invited by {name}",
        noGameInvites: "No game invites at the moment.",
    },
    fr: {
        ...COMMON.fr,
        host: "Hôte : {name}", hostedBy: "Organisée par", by: "par {name}",
        entry: "Mise d'entrée :", prizePool: "Cagnotte :", placesPaid: "Places payées :", distribution: "Répartition des gains :",
        players: "Joueurs :", playersList: "Liste des joueurs", confirmedInvited: (p) => `${p.confirmed} confirmé${p.confirmed > 1 ? "s" : ""} · ${p.invited} invité${p.invited > 1 ? "s" : ""}`,
        level1: "Niveau 1 :", blinds: "Blinds", meetUp: "Rendez-vous :", tableStart: "Début à table :", started: "Début :", ended: "Fin :",
        winner: "Vainqueur :", na: "N/D", guest: "Invité", note: "Note :", money: "Argent",
        moreInfos: "Plus d'infos", moreStats: "Plus de stats", viewGame: "Voir la partie", view: "Voir", accept: "Accepter", refuse: "Refuser",
        addToCalendar: "Ajouter au calendrier", showMore: (p) => `Voir plus (${p.n})`, showLess: "Voir moins",
        noUpcoming: "Aucune partie à venir pour l'instant.", nothingElse: "Rien d'autre de prévu pour l'instant.", noFinished: "Aucune partie terminée pour l'instant.",
        inProgress: "Détails en cours de mise à jour...", history: "Voir l'historique des parties",
        todays: "du jour", todaysRed: "Parties", willYouPlay: "Tu joues ?",
        yourNext: "Ta prochaine partie", loadingNext: "Chargement de ta prochaine partie", noGame: "Aucune partie prévue pour l'instant.", createGame: "Créer une partie",
        startManager: "Lancer le Game Manager", inviteFriends: "Inviter des amis", hosting: "Tu organises", yourAnswer: "Ta réponse :",
        playersFact: (p) => `Joueurs : ${p.confirmed} confirmé${p.confirmed > 1 ? "s" : ""} · ${p.invited} invité${p.invited > 1 ? "s" : ""}`,
        areYouIn: "Tu en es ?", imIn: "Je viens", cantMakeIt: "Je ne peux pas", answerGroup: "Répondre à l'invitation",
        youAnswered: "Tu as répondu :", changeAnswer: "Changer ma réponse",
        playerStatus: { pending: "en attente", accepted: "accepté", refused: "refusé", declined: "refusé" },
        loadingLb: "Chargement du classement...", noFriendsStats: "Aucun ami avec des stats pour l'instant.", player: "Joueur", wins: "Victoires",
        winrate: "% victoires", games: "Parties", avgPlace: "Place moy.", net: "Net", you: "Toi", fullLb: "Voir le classement complet",
        prev: "← Préc.", next: "Suiv. →",
        status: { pending: "À venir", active: "En cours", finished: "Terminée" },
        gameTitle: "Invitations", gameTitleRed: "à jouer", toggleInvites: "Afficher les invitations", invitedBy: "Invité par {name}",
        noGameInvites: "Aucune invitation à une partie pour le moment.",
    },
};

export const useGameT = () => useT(GAME_LISTS);
