import api from "@/utils/api.js";

const fail = (error, fallback) => ({
    success: false,
    error: error.response?.data?.error || fallback,
});

const joinService = {
    joinByToken: async (token, status = "accepted") => {
        try {
            const res = await api.post(`/join/${token}`, { status });
            return { success: true, data: res.data };
        } catch (error) {
            return fail(error, "Failed to join game");
        }
    },

    // Résumé public de la partie (sans compte)
    getInfo: async (token) => {
        try {
            const res = await api.get(`/join/${token}`);
            return { success: true, data: res.data };
        } catch (error) {
            return fail(error, "Unable to load this game");
        }
    },

    // Réponse d'un invité sans compte → { gamePlayerId, guestToken }
    answerAsGuest: async (token, name, status) => {
        try {
            const res = await api.post(`/join/${token}/guest`, { name, status });
            return { success: true, data: res.data };
        } catch (error) {
            return { ...fail(error, "Could not save your answer"), code: error.response?.status };
        }
    },

    // L'invité change sa réponse avec son jeton
    updateGuestAnswer: async (guestToken, status) => {
        try {
            const res = await api.patch("/join/guest", { guestToken, status });
            return { success: true, data: res.data };
        } catch (error) {
            return { ...fail(error, "Could not save your answer"), code: error.response?.status };
        }
    },
};

export default joinService;
