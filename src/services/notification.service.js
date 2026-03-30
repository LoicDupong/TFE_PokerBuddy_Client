import api from "../utils/api";

const notificationService = {
    getAll: async () => {
        try {
            const res = await api.get("/notifications");
            return res.data; // { notifications, unreadCount }
        } catch (error) {
            console.error("getAll notifications error:", error);
            return { notifications: [], unreadCount: 0 };
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
