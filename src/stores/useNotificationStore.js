import { create } from "zustand";
import notificationService from "../services/notification.service";

const useNotificationStore = create((set) => ({
    notifications: [],
    unreadCount: 0,

    fetchNotifications: async () => {
        const data = await notificationService.getAll();
        set({ notifications: data.notifications, unreadCount: data.unreadCount });
    },

    markAllRead: async () => {
        await notificationService.markAllRead();
        set((state) => ({
            notifications: state.notifications.map(n => ({ ...n, read: true })),
            unreadCount: 0,
        }));
    },
}));

export default useNotificationStore;
