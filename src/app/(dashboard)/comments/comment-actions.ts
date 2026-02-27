"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";
import type { Database } from "@/types/supabase";

type EntityType = Database["public"]["Enums"]["EntityType"];

/**
 * Add a new comment to any valid entity.
 */
export async function addComment(
    workspaceId: string,
    entityType: EntityType,
    entityId: string,
    content: string,
    pathname: string,
    mentions: string[] = []
) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        throw new Error("Must be logged in to comment.");
    }

    // 1. Parse Mentions and Contacts out of the react-mentions markup syntax
    // Pattern: @[Display Name](user:UUID) or #[Display Name](contact:UUID)
    const userRegex = /@\[([^\]]+)\]\(user:([^\)]+)\)/g;
    const contactRegex = /#\[([^\]]+)\]\(contact:([^\)]+)\)/g;

    let resolvedMentionIds: string[] = [...mentions];
    let resolvedContactId: string | null = null;
    let resolvedListingId: string | null = null;

    let match;
    while ((match = userRegex.exec(content)) !== null) {
        resolvedMentionIds.push(match[2]); // The UUID is capture group 2
    }

    while ((match = contactRegex.exec(content)) !== null) {
        if (!resolvedContactId) resolvedContactId = match[2]; // MVP: just capture the first contact
    }

    // Deduplicate IDs
    resolvedMentionIds = Array.from(new Set(resolvedMentionIds));

    // 2. Insert Comment with Resolved Tags (Store the raw annotated string)
    const { data: newComment, error } = await supabase.from("comments").insert({
        workspace_id: workspaceId,
        entity_type: entityType,
        entity_id: entityId,
        author_user_id: user.id,
        content,
        mentions: resolvedMentionIds,
        tagged_contact_id: resolvedContactId,
        tagged_listing_id: resolvedListingId,
    }).select("id").single();

    if (error) {
        throw new Error(error.message);
    }

    // Automatically log this as an activity
    await logActivity({
        workspaceId,
        entityType,
        entityId,
        actionType: "COMMENT_ADDED",
        actorUserId: user.id,
        description: "Added a comment",
    });

    // 6. Create notification records for each user ID in `resolvedMentionIds`
    if (resolvedMentionIds.length > 0 && newComment) {
        // Exclude the author from notifying themselves
        const notifyIds = resolvedMentionIds.filter(id => id !== user.id);

        if (notifyIds.length > 0) {
            const notifications = notifyIds.map(notifyUserId => ({
                workspace_id: workspaceId,
                user_id: notifyUserId,
                type: "MENTION" as const,
                title: "New Mention",
                message: "You were mentioned in a comment.",
                entity_type: entityType,
                entity_id: entityId,
                action_url: pathname,
                is_read: false
            }));

            await supabase.from("notifications").insert(notifications);
        }
    }

    // Notify success
    return { success: true };
}

/**
 * Soft delete a comment natively to retain history/audit trails.
 */
export async function deleteComment(commentId: string, pathname: string) {
    const supabase = await createClient();

    // Soft delete
    const { error } = await supabase
        .from("comments")
        .update({ is_deleted: true })
        .eq("id", commentId);

    if (error) {
        throw new Error(error.message);
    }

    revalidatePath(pathname);
}
