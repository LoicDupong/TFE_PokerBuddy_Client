// Joueurs qui ont confirmé leur présence (l'hôte compris)
export function getConfirmedCount(game) {
    return (game.playerLinks || []).filter((p) => p.status === "accepted").length;
}

/**
 * Prize pool à afficher : gains réellement distribués pour une partie terminée,
 * sinon buy-in × joueurs confirmés. Le prizePool stocké (buy-in × max players à la création)
 * vaut 0 quand "max players" a été laissé vide.
 */
export function getPrizePool(game) {
    if (game.status === "finished" && game.results?.length) {
        return game.results.reduce((sum, r) => sum + resultPrize(r), 0);
    }
    return game.buyIn * getConfirmedCount(game);
}

// Symbole de la devise choisie à la création (tout était affiché en € quelle que soit la devise)
const CURRENCY_SYMBOLS = { EUR: "€", USD: "$", GBP: "£" };
export const currencySymbol = (code) => CURRENCY_SYMBOLS[code] ?? "€";

// Arguments de showToast après une réponse à une invitation de partie : popup de 5 s
export function inviteResponseToast(action, gameName) {
    return action === "accepted"
        ? [`✅ Accepted "${gameName}"`, "success", 5000]
        : [`Refused "${gameName}"`, "info", 5000];
}

// Places payées et répartition : pour une partie terminée, ce qui a vraiment été distribué
// (le manager a pu changer la répartition prévue à la création)
export function getPayouts(game, prizePool) {
    const paid = (game.results || []).filter((r) => resultPrize(r) > 0);
    if (game.status === "finished" && paid.length) {
        return paid
            .sort((a, b) => a.rank - b.rank)
            .map((r) => ({ place: r.rank, amount: resultPrize(r) }));
    }
    return (game.payoutDistribution || []).map((p) => ({
        place: p.place,
        amount: getPayoutAmount(prizePool, p.percent),
    }));
}

// Part d'une place payée, arrondie au centime
export function getPayoutAmount(prizePool, percent) {
    return Math.round(prizePool * percent) / 100;
}

// Libellés affichés pour le statut technique d'une partie
const STATUS_LABELS = { pending: "Upcoming", active: "Live", finished: "Finished" };
export const gameStatusLabel = (status) => STATUS_LABELS[status] ?? status;

// Un compte supprimé garde un pseudo technique "deleted_xxxxxxxx" : on ne l'affiche jamais tel quel
export const DELETED_PLAYER_LABEL = "Deleted player";
export function displayPlayerName(name) {
    return /^deleted_[0-9a-f]{8}$/i.test(String(name || "")) ? DELETED_PLAYER_LABEL : name;
}

// Montant d'un résultat en unités : les centimes font foi quand ils existent
export const resultPrize = (r) => (r.prizeCents != null ? r.prizeCents / 100 : r.prize || 0);
