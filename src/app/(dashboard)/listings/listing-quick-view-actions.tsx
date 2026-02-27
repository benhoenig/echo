"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchListingQuickViewData(
    workspaceId: string,
    listingId: string
) {
    const supabase = await createClient();

    // Fetch comments
    const { data: comments, error: commentsError } = await supabase
        .from("comments")
        .select(`
            id,
            content,
            created_at,
            is_deleted,
            author_user_id,
            users:author_user_id (
                first_name,
                last_name,
                profile_photo_url
            )
        `)
        .eq("entity_type", "LISTING")
        .eq("entity_id", listingId)
        .order("created_at", { ascending: true });

    if (commentsError) {
        console.error("[Quick View] Supabase Comments Error:", commentsError);
        return { error: `Failed to load comments: ${commentsError.message}` };
    }

    // Fetch activity logs
    const { data: logs, error: logsError } = await supabase
        .from("activity_logs")
        .select(`
            id,
            action_type,
            description,
            created_at,
            actor_user_id,
            users:actor_user_id (
                first_name,
                last_name,
                profile_photo_url
            )
        `)
        .eq("workspace_id", workspaceId)
        .eq("entity_type", "LISTING")
        .eq("entity_id", listingId)
        .order("created_at", { ascending: false });

    if (logsError) {
        console.error("[Quick View] Supabase Logs Error:", logsError);
        return { error: `Failed to fetch activity logs: ${logsError.message}` };
    }

    return {
        comments: comments || [],
        activityLogs: logs || []
    };
}

export async function fetchWorkspaceMentions(workspaceId: string) {
    const supabase = await createClient();

    // Get current user so we don't let them @mention themselves
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    const [usersResponse, contactsResponse] = await Promise.all([
        supabase
            .from("users")
            .select("id, first_name, last_name")
            .eq("workspace_id", workspaceId)
            .eq("is_active", true),
        supabase
            .from("contacts")
            .select("id, first_name, last_name")
            .eq("workspace_id", workspaceId)
    ]);

    const users = (usersResponse.data || [])
        .filter(u => u.id !== currentUser?.id) // Prevent self-mentioning
        .map(u => ({
            id: u.id,
            display: `${u.first_name || ""} ${u.last_name || ""}`.trim() || "Unknown"
        }));

    const contacts = (contactsResponse.data || []).map(c => ({
        id: c.id,
        display: `${c.first_name || ""} ${c.last_name || ""}`.trim() || "Unknown"
    }));

    return { users, contacts };
}
