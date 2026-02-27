import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/supabase";

type ActionType = Database["public"]["Enums"]["ActionType"];
type EntityType = Database["public"]["Enums"]["EntityType"];

/**
 * Centrally log activities to the `activity_logs` table.
 * Used for tracking changes across Listings, Deals, Contacts, etc.
 */
export async function logActivity({
    workspaceId,
    entityType,
    entityId,
    actionType,
    actorUserId,
    description,
    metadata,
}: {
    workspaceId: string;
    entityType: EntityType;
    entityId: string;
    actionType: ActionType;
    actorUserId?: string | null;
    description: string;
    metadata?: Record<string, unknown> | null;
}) {
    try {
        const supabase = await createClient();
        await supabase.from("activity_logs").insert({
            workspace_id: workspaceId,
            entity_type: entityType,
            entity_id: entityId,
            action_type: actionType,
            actor_user_id: actorUserId,
            description,
            metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        });
    } catch (error) {
        // Silently fail logging so as not to crash the main request.
        console.error("Failed to insert Activity Log:", error);
    }
}
