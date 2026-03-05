import { describe, it, expect, beforeEach, vi } from "vitest";
import { useNotificationStore, type NotificationItem } from "./notification-store";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeNotification(overrides: Partial<NotificationItem> = {}): NotificationItem {
    return {
        id: "notif-1",
        type: "ACTION_REMINDER",
        entityType: "DEAL",
        entityId: "deal-1",
        title: "Test Notification",
        message: "Something happened",
        actionUrl: "/crm/deals/deal-1",
        isRead: false,
        createdAt: new Date().toISOString(),
        readAt: null,
        ...overrides,
    };
}

// Reset store state between each test
beforeEach(() => {
    useNotificationStore.setState({
        notifications: [],
        unreadCount: 0,
    });
});

// ─── setNotifications ─────────────────────────────────────────────────────────

describe("setNotifications", () => {
    it("replaces all notifications with the given list", () => {
        const items = [makeNotification({ id: "a" }), makeNotification({ id: "b" })];
        useNotificationStore.getState().setNotifications(items);
        expect(useNotificationStore.getState().notifications).toHaveLength(2);
    });

    it("sets unreadCount to the number of unread items", () => {
        const items = [
            makeNotification({ id: "a", isRead: false }),
            makeNotification({ id: "b", isRead: true }),
            makeNotification({ id: "c", isRead: false }),
        ];
        useNotificationStore.getState().setNotifications(items);
        expect(useNotificationStore.getState().unreadCount).toBe(2);
    });

    it("sets unreadCount=0 when all notifications are read", () => {
        const items = [
            makeNotification({ id: "a", isRead: true }),
            makeNotification({ id: "b", isRead: true }),
        ];
        useNotificationStore.getState().setNotifications(items);
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it("handles an empty array — clears all state", () => {
        useNotificationStore.getState().setNotifications([makeNotification()]);
        useNotificationStore.getState().setNotifications([]);
        expect(useNotificationStore.getState().notifications).toHaveLength(0);
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
});

// ─── addNotification ──────────────────────────────────────────────────────────

describe("addNotification", () => {
    it("prepends the new notification to the beginning of the list", () => {
        useNotificationStore.getState().setNotifications([makeNotification({ id: "old" })]);
        useNotificationStore.getState().addNotification(makeNotification({ id: "new" }));
        expect(useNotificationStore.getState().notifications[0].id).toBe("new");
    });

    it("increments unreadCount when the new notification is unread", () => {
        useNotificationStore.getState().addNotification(makeNotification({ isRead: false }));
        expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it("does NOT increment unreadCount when the new notification is already read", () => {
        useNotificationStore.getState().addNotification(makeNotification({ isRead: true }));
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it("adds to an already populated list", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a" }),
            makeNotification({ id: "b" }),
        ]);
        useNotificationStore.getState().addNotification(makeNotification({ id: "c" }));
        expect(useNotificationStore.getState().notifications).toHaveLength(3);
    });
});

// ─── markAsRead ───────────────────────────────────────────────────────────────

describe("markAsRead", () => {
    it("sets isRead=true on the target notification", () => {
        useNotificationStore.getState().setNotifications([makeNotification({ id: "x", isRead: false })]);
        useNotificationStore.getState().markAsRead("x");
        const n = useNotificationStore.getState().notifications.find(n => n.id === "x");
        expect(n?.isRead).toBe(true);
    });

    it("sets readAt to a non-null ISO string", () => {
        useNotificationStore.getState().setNotifications([makeNotification({ id: "x", isRead: false })]);
        useNotificationStore.getState().markAsRead("x");
        const n = useNotificationStore.getState().notifications.find(n => n.id === "x");
        expect(n?.readAt).toBeTruthy();
        expect(() => new Date(n!.readAt!).toISOString()).not.toThrow();
    });

    it("decrements unreadCount by 1 when the notification was unread", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: false }),
            makeNotification({ id: "b", isRead: false }),
        ]);
        useNotificationStore.getState().markAsRead("a");
        expect(useNotificationStore.getState().unreadCount).toBe(1);
    });

    it("does NOT change unreadCount if the notification was already read", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: true }),
        ]);
        useNotificationStore.getState().markAsRead("a");
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it("does not affect other notifications", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: false }),
            makeNotification({ id: "b", isRead: false }),
        ]);
        useNotificationStore.getState().markAsRead("a");
        const b = useNotificationStore.getState().notifications.find(n => n.id === "b");
        expect(b?.isRead).toBe(false);
    });

    it("is a no-op for a non-existent id", () => {
        useNotificationStore.getState().setNotifications([makeNotification({ id: "a", isRead: false })]);
        useNotificationStore.getState().markAsRead("non-existent-id");
        expect(useNotificationStore.getState().unreadCount).toBe(1);
        expect(useNotificationStore.getState().notifications[0].isRead).toBe(false);
    });

    it("never lets unreadCount go below 0", () => {
        // unreadCount=0, mark something read (was already read)
        useNotificationStore.getState().setNotifications([makeNotification({ id: "a", isRead: true })]);
        useNotificationStore.getState().markAsRead("a");
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
});

// ─── markAllAsRead ────────────────────────────────────────────────────────────

describe("markAllAsRead", () => {
    it("sets isRead=true on all notifications", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: false }),
            makeNotification({ id: "b", isRead: false }),
            makeNotification({ id: "c", isRead: true }),
        ]);
        useNotificationStore.getState().markAllAsRead();
        const allRead = useNotificationStore.getState().notifications.every(n => n.isRead);
        expect(allRead).toBe(true);
    });

    it("sets unreadCount to 0", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: false }),
            makeNotification({ id: "b", isRead: false }),
        ]);
        useNotificationStore.getState().markAllAsRead();
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it("sets readAt on previously-unread notifications", () => {
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: false, readAt: null }),
        ]);
        useNotificationStore.getState().markAllAsRead();
        const n = useNotificationStore.getState().notifications[0];
        expect(n.readAt).toBeTruthy();
    });

    it("preserves existing readAt on already-read notifications", () => {
        const existingReadAt = "2024-01-01T00:00:00.000Z";
        useNotificationStore.getState().setNotifications([
            makeNotification({ id: "a", isRead: true, readAt: existingReadAt }),
        ]);
        useNotificationStore.getState().markAllAsRead();
        const n = useNotificationStore.getState().notifications[0];
        expect(n.readAt).toBe(existingReadAt);
    });

    it("is a no-op on an empty list", () => {
        useNotificationStore.getState().markAllAsRead();
        expect(useNotificationStore.getState().unreadCount).toBe(0);
        expect(useNotificationStore.getState().notifications).toHaveLength(0);
    });
});

// ─── setUnreadCount ───────────────────────────────────────────────────────────

describe("setUnreadCount", () => {
    it("sets the count to the given value", () => {
        useNotificationStore.getState().setUnreadCount(42);
        expect(useNotificationStore.getState().unreadCount).toBe(42);
    });

    it("sets count to 0", () => {
        useNotificationStore.getState().setUnreadCount(10);
        useNotificationStore.getState().setUnreadCount(0);
        expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
});
