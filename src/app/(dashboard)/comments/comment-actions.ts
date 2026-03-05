"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";
import { sendNotification } from "@/lib/notifications";
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

    // 1. Parse Mentions, Contacts, and Listings out of the react-mentions markup syntax
    // Pattern: @[Display Name](user:UUID), #[Display Name](contact:UUID), #[Display Name](listing:UUID)
    // Both contacts and listings use # trigger — differentiated by type prefix inside parens
    const userRegex = /@\[([^\]]+)\]\(user:([^\)]+)\)/g;
    const contactRegex = /#\[([^\]]+)\]\(contact:([^\)]+)\)/g;
    const listingRegex = /#\[([^\]]+)\]\(listing:([^\)]+)\)/g;

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

    while ((match = listingRegex.exec(content)) !== null) {
        if (!resolvedListingId) resolvedListingId = match[2]; // MVP: just capture the first listing
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

    // Update parent entity's last_action_date (comments count as meaningful activity)
    const now = new Date().toISOString();
    if (entityType === "DEAL") {
        await supabase.from("deals").update({ last_action_date: now }).eq("id", entityId);
    } else if (entityType === "LISTING") {
        await supabase.from("listings").update({ last_action_date: now }).eq("id", entityId);
    } else if (entityType === "CONTACT") {
        await supabase.from("contacts").update({ last_action_date: now }).eq("id", entityId);
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

    // 6. Send MENTION notifications via unified dispatcher
    if (resolvedMentionIds.length > 0 && newComment) {
        const notifyIds = resolvedMentionIds.filter(id => id !== user.id);

        for (const notifyUserId of notifyIds) {
            sendNotification({
                workspaceId,
                userId: notifyUserId,
                type: "MENTION",
                entityType: entityType as "DEAL" | "LISTING" | "CONTACT",
                entityId,
                title: "New Mention",
                message: "You were mentioned in a comment.",
                actionUrl: pathname,
            }).catch((err: unknown) =>
                console.error("Failed to send mention notification:", err)
            );
        }
    }

    // Revalidate the page so the server-rendered comment list refreshes
    revalidatePath(pathname);

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
