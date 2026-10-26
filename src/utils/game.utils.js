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
        return game.results.reduce((sum, r) => sum + (r.prize || 0), 0);
    }
    return game.buyIn * getConfirmedCount(game);
}

// Part d'une place payée, arrondie au centime
export function getPayoutAmount(prizePool, percent) {
    return Math.round(prizePool * percent) / 100;
}
