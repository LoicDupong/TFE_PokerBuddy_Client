import api from "../utils/api";

const leaderboardService = {
    getLeaderboard: async (page = 1, limit = 10) => {
        try {
            const res = await api.get(`/leaderboard?page=${page}&limit=${limit}`);
            return res.data;
        } catch (error) {
            console.error("getLeaderboard error:", error);
            return null;
        }
    },
};

export default leaderboardService;
