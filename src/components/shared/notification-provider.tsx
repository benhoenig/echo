"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRealtimeNotifications } from "@/hooks/use-realtime-notifications";
import {
    useNotificationStore,
    type NotificationItem,
} from "@/stores/notification-store";

/**
 * Initializes the notification system:
 * 1. Fetches the current user's ID and workspace
 * 2. Loads initial notifications into the Zustand store
 * 3. Starts the Supabase Realtime subscription for live updates
 */
export function NotificationProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    const [userId, setUserId] = useState<string | null>(null);
    const [workspaceId, setWorkspaceId] = useState<string | null>(null);
    const setNotifications = useNotificationStore(
        (state) => state.setNotifications
    );

    // Get the current user's internal ID + workspace
    useEffect(() => {
        async function init() {
            const supabase = createClient();
            const {
                data: { user: authUser },
            } = await supabase.auth.getUser();

            if (!authUser) return;

            const { data: userRecord } = await supabase
                .from("users")
                .select("id, workspace_id")
                .eq("id", authUser.id)
                .single();

            if (!userRecord) return;

            setUserId(userRecord.id);
            setWorkspaceId(userRecord.workspace_id);

            // Fetch initial notifications
            const { data: notifications } = await supabase
                .from("notifications")
                .select("*")
                .eq("workspace_id", userRecord.workspace_id)
                .eq("user_id", userRecord.id)
                .order("created_at", { ascending: false })
                .limit(30);

            if (notifications) {
                setNotifications(
                    notifications.map(
                        (n: Record<string, unknown>): NotificationItem => ({
                            id: n.id as string,
                            type: n.type as string,
                            entityType: n.entity_type as string,
                            entityId: n.entity_id as string,
                            title: (n.title as string) ?? null,
                            message: n.message as string,
                            actionUrl: (n.action_url as string) ?? null,
                            isRead: n.is_read as boolean,
                            createdAt: n.created_at as string,
                            readAt: (n.read_at as string) ?? null,
                        })
                    )
                );
            }
        }

        init();
    }, [setNotifications]);

    // Subscribe to realtime notifications
    useRealtimeNotifications(userId, workspaceId);

    return <>{children}</>;
}
