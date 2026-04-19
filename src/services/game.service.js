
import api from "@/utils/api.js";

const gameService = {
    // 🔹 POST /games
    create: async (data) => {
        try {
            const res = await api.post('/games', data);
            return {
                success: true,
                data: res.data,
            };
        } catch (error) {
            console.error("GameService create error:", error.response?.data || error.message);
            return {
                success: false,
                errorMessage: [error.response?.data?.error || "Game creation failed"],
            };
        }
    },


    // 🔹 GET /games (toutes les games liées au user connecté)
    getAll: async (filter) => {
        try {
            const url = filter ? `/games?filter=${filter}` : "/games";
            const res = await api.get(url);
            return res.data;
        } catch (error) {
            console.error("getAllGames error:", error);
            return null;
        }
    },

    // 🔹 GET /games/:id
    getById: async (id) => {
        try {
            const res = await api.get(`/games/${id}`);
            return res.data;
        } catch (error) {
            console.error("getGameById error:", error);
            return null;
        }
    },
    // 🔹 PATCH /games/:id
    update: async (id, formData) => {
        try {
            const res = await api.patch(`/games/${id}`, formData);

            return {
                success: true,
                data: res.data,
            };
        } catch (error) {
            console.log(error);

            return {
                success: false,
                errorMessage: [error.response?.data?.error || "Game update failed"],
            };
        }
    },

    // 🔹 DELETE /games/:id
    delete: async (id) => {
        try {
            const res = await api.delete(`/games/${id}`);
            return {
                success: true,
                data: res.data,
            };
        } catch (error) {
            return {
                success: false,
                errorMessage: [error.response?.data?.error || "Game deletion failed"],
            };
        }
    },

    generateInviteCode: async (id) => {
        try {
            const res = await api.post(`/games/${id}/invite-code`);
            return { success: true, inviteCode: res.data.inviteCode };
        } catch (error) {
            return { success: false, error: error.response?.data?.error || "Failed to generate link" };
        }
    },

    disableInviteCode: async (id) => {
        try {
            await api.delete(`/games/${id}/invite-code`);
            return { success: true };
        } catch (error) {
            return { success: false };
        }
    },

    mapToPreset: (game) => {
        if (!game) return {};

        return {
            title: game.name,
            dateTime: game.dateStart,
            location: game.location,
            buyIn: game.buyIn,
            smallBlind: game.smallBlind,
            bigBlind: game.bigBlind,
            levelDurationMin: game.levelDurationMin || 15,
            maxPlayers: game.maxPlayers,
            allowRebuys: game.allowRebuys,
            payout: game.payoutDistribution?.map(p => p.percent).join("/") || "70/20/10",
            players: game.playerLinks?.map((p) => ({
                id: p.id,
                name: p.user?.username || p.guestName,
            })) || [],
            notes: game.description || "",
        };
    },

};

export default gameService;
