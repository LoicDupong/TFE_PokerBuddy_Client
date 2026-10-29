import api from "@/utils/api.js";

// Toutes les routes finance : { success, data } / { success, error } (jamais d'exception vers l'UI).
// Le serveur renvoie la vue `finance` à jour après chaque écriture.
const fail = (error, fallback) => ({
    success: false,
    status: error.response?.status ?? null,
    error: error.response?.data?.error || fallback,
});

async function call(request, fallback) {
    try {
        const res = await request();
        return { success: true, data: res.data };
    } catch (error) {
        return fail(error, fallback);
    }
}

const gameFinanceService = {
    get: (gameId) => call(() => api.get(`/games/${gameId}/finance`), "Could not load the game finances"),

    // players: [{ key, gamePlayerId?, name }], chips: tapis de départ
    seats: (gameId, players, chips) =>
        call(() => api.post(`/games/${gameId}/finance/seats`, { players, chips }), "Could not seat the players"),

    // type: "rebuy" | "addon"
    addEntry: (gameId, body) =>
        call(() => api.post(`/games/${gameId}/finance/entries`, body), "Could not record this action"),

    addKnockout: (gameId, body) =>
        call(() => api.post(`/games/${gameId}/finance/knockouts`, body), "Could not record this knockout"),

    voidOp: (gameId, opDbId) =>
        call(() => api.post(`/games/${gameId}/finance/ops/${opDbId}/void`, {}), "Could not undo this action"),

    correctOp: (gameId, opDbId, body) =>
        call(() => api.post(`/games/${gameId}/finance/ops/${opDbId}/correct`, body), "Could not correct this action"),
};

export default gameFinanceService;
