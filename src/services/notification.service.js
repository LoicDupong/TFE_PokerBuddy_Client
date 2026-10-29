import api from "../utils/api";

const notificationService = {
    getAll: async () => {
        try {
            const res = await api.get("/notifications");
            return { success: true, ...res.data }; // { success, notifications, unreadCount }
        } catch (error) {
            console.error("getAll notifications error:", error);
            // success: false → le store garde son état (sinon une erreur réseau passerait pour "aucune notification")
            return { success: false, notifications: [], unreadCount: 0 };
        }
    },

    markAllRead: async () => {
        try {
            await api.patch("/notifications/read-all");
            return { success: true };
        } catch (error) {
            console.error("markAllRead error:", error);
            return { success: false };
        }
    },
};

export default notificationService;
