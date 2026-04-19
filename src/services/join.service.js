import api from "@/utils/api.js";

const joinService = {
    joinByToken: async (token) => {
        try {
            const res = await api.post(`/join/${token}`);
            return { success: true, data: res.data };
        } catch (error) {
            return {
                success: false,
                error: error.response?.data?.error || "Failed to join game",
            };
        }
    },
};

export default joinService;
