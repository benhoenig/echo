import { create } from "zustand";

export interface NotificationItem {
    id: string;
    type: string;
    entityType: string;
    entityId: string;
    title: string | null;
    message: string;
    actionUrl: string | null;
    isRead: boolean;
    createdAt: string;
    readAt: string | null;
}

interface NotificationStore {
    notifications: NotificationItem[];
    unreadCount: number;
    setNotifications: (items: NotificationItem[]) => void;
    addNotification: (item: NotificationItem) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    setUnreadCount: (count: number) => void;
}

export const useNotificationStore = create<NotificationStore>((set) => ({
    notifications: [],
    unreadCount: 0,

    setNotifications: (items) =>
        set({
            notifications: items,
            unreadCount: items.filter((n) => !n.isRead).length,
        }),

    addNotification: (item) =>
        set((state) => ({
            notifications: [item, ...state.notifications],
            unreadCount: state.unreadCount + (item.isRead ? 0 : 1),
        })),

    markAsRead: (id) =>
        set((state) => {
            const wasUnread = state.notifications.find(
                (n) => n.id === id && !n.isRead
            );
            return {
                notifications: state.notifications.map((n) =>
                    n.id === id
                        ? {
                              ...n,
                              isRead: true,
                              readAt: new Date().toISOString(),
                          }
                        : n
                ),
                unreadCount: wasUnread
                    ? Math.max(0, state.unreadCount - 1)
                    : state.unreadCount,
            };
        }),

    markAllAsRead: () =>
        set((state) => ({
            notifications: state.notifications.map((n) => ({
                ...n,
                isRead: true,
                readAt: n.readAt ?? new Date().toISOString(),
            })),
            unreadCount: 0,
        })),

    setUnreadCount: (count) => set({ unreadCount: count }),
}));
