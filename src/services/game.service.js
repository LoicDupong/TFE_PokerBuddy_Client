
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
    getAll: async () => {
        try {
            const res = await api.get("/games");
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

};

export default gameService;
