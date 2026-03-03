"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";
import type { Database } from "@/types/supabase";

type EntityType = Database["public"]["Enums"]["EntityType"];

async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/**
 * Mark an entity as actioned — resets last_action_date, dismisses reminders, logs activity.
 */
export async function markAsActioned(
    entityType: EntityType,
    entityId: string,
    workspaceId: string,
    pathname: string,
    note?: string
) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    if (!authUserId) {
        throw new Error("Must be logged in.");
    }

    // Look up internal user
    let internalUserId: string | null = null;
    const { data: userRec } = await supabase
        .from("users")
        .select("id")
        .eq("auth_uid", authUserId)
        .single();
    internalUserId = userRec?.id ?? null;

    // 1. Update last_action_date on the entity
    const now = new Date().toISOString();
    const updatePayload = { last_action_date: now, last_updated_by_id: internalUserId };

    let updateError: { message: string } | null = null;
    if (entityType === "DEAL") {
        const res = await supabase.from("deals").update(updatePayload).eq("id", entityId);
        updateError = res.error;
    } else if (entityType === "LISTING") {
        const res = await supabase.from("listings").update(updatePayload).eq("id", entityId);
        updateError = res.error;
    } else if (entityType === "CONTACT") {
        const res = await supabase.from("contacts").update(updatePayload).eq("id", entityId);
        updateError = res.error;
    } else {
        throw new Error(`Unsupported entity type: ${entityType}`);
    }

    if (updateError) {
        throw new Error(updateError.message);
    }

    // 2. Dismiss unread ACTION_REMINDER notifications for this entity
    await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("entity_id", entityId)
        .eq("type", "ACTION_REMINDER")
        .eq("is_read", false);

    // 3. Log activity
    await logActivity({
        workspaceId,
        entityType,
        entityId,
        actionType: "MARKED_AS_ACTIONED" as any,
        actorUserId: internalUserId,
        description: note || "Marked as actioned — follow-up clock reset",
    });

    revalidatePath(pathname);

    return { success: true };
}

/**
 * Fetch suggested playbook actions for a given pipeline stage.
 */
export async function getSuggestedActions(
    workspaceId: string,
    pipelineStageId: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("stage_action_playbooks")
        .select("id, action_type, action_label, action_description, action_template, reminder_override, override_interval_days, is_required, is_active, pipeline_stage_id")
        .eq("workspace_id", workspaceId)
        .eq("pipeline_stage_id", pipelineStageId)
        .eq("is_active", true)
        .order("is_required", { ascending: false })
        .order("action_label", { ascending: true });

    if (error) {
        console.error("Failed to fetch playbook actions:", error);
        return [];
    }

    return (data || []).map((row) => ({
        id: row.id,
        actionType: row.action_type,
        actionLabel: row.action_label,
        actionDescription: row.action_description,
        actionTemplate: row.action_template,
        reminderOverride: row.reminder_override,
        overrideIntervalDays: row.override_interval_days,
        isRequired: row.is_required,
        isActive: row.is_active,
        pipelineStageId: row.pipeline_stage_id,
    }));
}

/**
 * Fetch potential configs for a workspace and module.
 */
export async function getPotentialConfigs(
    workspaceId: string,
    module: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("potential_configs")
        .select("id, module, potential_label, reminder_interval, is_active")
        .eq("workspace_id", workspaceId)
        .eq("module", module as any)
        .eq("is_active", true);

    if (error) {
        console.error("Failed to fetch potential configs:", error);
        return [];
    }

    return (data || []).map((row) => ({
        id: row.id,
        module: row.module,
        potentialLabel: row.potential_label,
        reminderInterval: row.reminder_interval,
        isActive: row.is_active,
    }));
}
