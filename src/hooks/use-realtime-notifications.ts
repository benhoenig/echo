"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
    useNotificationStore,
    type NotificationItem,
} from "@/stores/notification-store";
import { toast } from "sonner";

/**
 * Subscribe to Supabase Realtime for new notifications.
 * When a new notification is inserted for this user, it's added
 * to the Zustand store and a toast is shown.
 */
export function useRealtimeNotifications(
    userId: string | null,
    workspaceId: string | null
) {
    const addNotification = useNotificationStore(
        (state) => state.addNotification
    );

    useEffect(() => {
        if (!userId || !workspaceId) return;

        const supabase = createClient();

        const channel = supabase
            .channel(`notifications:${userId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "notifications",
                    filter: `user_id=eq.${userId}`,
                },
                (payload) => {
                    const row = payload.new as Record<string, unknown>;

                    const newNotification: NotificationItem = {
                        id: row.id as string,
                        type: row.type as string,
                        entityType: row.entity_type as string,
                        entityId: row.entity_id as string,
                        title: (row.title as string) ?? null,
                        message: row.message as string,
                        actionUrl: (row.action_url as string) ?? null,
                        isRead: row.is_read as boolean,
                        createdAt: row.created_at as string,
                        readAt: (row.read_at as string) ?? null,
                    };

                    addNotification(newNotification);

                    toast(newNotification.title || "New Notification", {
                        description: newNotification.message,
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, workspaceId, addNotification]);
}
