"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fetch recent notifications for the current user.
 */
export async function getNotifications(
    workspaceId: string,
    userId: string,
    limit = 30
) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(limit);

    if (error) {
        console.error("Failed to fetch notifications:", error);
        return [];
    }

    return data ?? [];
}

/**
 * Get the count of unread notifications for the current user.
 */
export async function getUnreadCount(
    workspaceId: string,
    userId: string
): Promise<number> {
    const supabase = await createClient();
    const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .eq("is_read", false);

    if (error) {
        console.error("Failed to get unread count:", error);
        return 0;
    }

    return count ?? 0;
}

/**
 * Mark a single notification as read.
 */
export async function markNotificationAsRead(notificationId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("id", notificationId);

    if (error) {
        console.error("Failed to mark notification as read:", error);
        return { error: error.message };
    }

    return { success: true };
}

/**
 * Mark all unread notifications as read for the current user.
 */
export async function markAllNotificationsAsRead(
    workspaceId: string,
    userId: string
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("notifications")
        .update({
            is_read: true,
            read_at: new Date().toISOString(),
        })
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .eq("is_read", false);

    if (error) {
        console.error("Failed to mark all as read:", error);
        return { error: error.message };
    }

    return { success: true };
}
