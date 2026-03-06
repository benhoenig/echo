"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";
import { sendNotification } from "@/lib/notifications";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DealInsert = any;

async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

export async function getDeals(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("deals")
        .select(
            `*,
            pipeline_stages!deals_pipeline_stage_id_fkey(id, pipeline_stage_name, stage_color, pipeline_type, stage_order),
            buyer_contact:contacts!deals_buyer_contact_id_fkey(id, first_name, last_name, nickname),
            listing:listings!deals_listing_id_fkey(id, listing_name),
            assigned_user:users!deals_assigned_to_id_fkey(first_name, last_name)`
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", false)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getArchivedDeals(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("deals")
        .select(
            `*,
            pipeline_stages!deals_pipeline_stage_id_fkey(id, pipeline_stage_name, stage_color, pipeline_type),
            buyer_contact:contacts!deals_buyer_contact_id_fkey(id, first_name, last_name, nickname),
            assigned_user:users!deals_assigned_to_id_fkey(first_name, last_name)`
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", true)
        .order("last_updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getDeal(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("deals")
        .select(
            `*,
            pipeline_stages!deals_pipeline_stage_id_fkey(id, pipeline_stage_name, stage_color, pipeline_type, stage_order),
            buyer_contact:contacts!deals_buyer_contact_id_fkey(id, first_name, last_name, nickname, phone_primary, email),
            listing:listings!deals_listing_id_fkey(id, listing_name),
            assigned_user:users!deals_assigned_to_id_fkey(id, first_name, last_name)`
        )
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createDeal(
    workspaceId: string,
    dealData: DealInsert
) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    // Look up the internal user record
    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    const { data, error } = await supabase
        .from("deals")
        .insert({
            ...dealData,
            workspace_id: workspaceId,
            created_by_id: internalUserId,
            last_updated_by_id: internalUserId,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    if (data) {
        await logActivity({
            workspaceId,
            entityType: "DEAL",
            entityId: data.id,
            actionType: "CREATED",
            actorUserId: internalUserId,
            description: `Created deal ${data.deal_name}`,
            metadata: { deal_name: data.deal_name },
        });
    }

    revalidatePath("/crm/deals");
    return data;
}

export async function updateDeal(
    id: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    updates: Record<string, any>
) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    const { data, error } = await supabase
        .from("deals")
        .update({
            ...updates,
            last_updated_by_id: internalUserId,
            last_action_date: new Date().toISOString(),
        })
        .eq("id", id)
        .select()
        .single();

    if (error) throw new Error(error.message);

    if (data) {
        await logActivity({
            workspaceId: data.workspace_id,
            entityType: "DEAL",
            entityId: data.id,
            actionType: "UPDATED",
            actorUserId: internalUserId,
            description: `Updated deal ${data.deal_name}`,
            metadata: { fields: Object.keys(updates) },
        });
    }

    revalidatePath("/crm/deals");
    revalidatePath(`/crm/deals/${id}`);
    return data;
}

export async function updateDealStage(
    dealId: string,
    newStageId: string
) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    // Get current deal to record stage transition
    const { data: currentDeal } = await supabase
        .from("deals")
        .select("pipeline_stage_id, workspace_id")
        .eq("id", dealId)
        .single();

    if (!currentDeal) throw new Error("Deal not found");

    const oldStageId = currentDeal.pipeline_stage_id;

    // Update deal stage
    const { error: updateError } = await supabase
        .from("deals")
        .update({
            pipeline_stage_id: newStageId,
            last_updated_by_id: internalUserId,
            last_action_date: new Date().toISOString(),
        })
        .eq("id", dealId);

    if (updateError) throw new Error(updateError.message);

    // Compute time_in_previous_stage from last history entry
    let timeInPreviousStage: number | null = null;
    const { data: lastHistory } = await supabase
        .from("pipeline_stage_history")
        .select("changed_at")
        .eq("deal_id", dealId)
        .order("changed_at", { ascending: false })
        .limit(1)
        .single();

    if (lastHistory) {
        const diffMs =
            new Date().getTime() - new Date(lastHistory.changed_at).getTime();
        timeInPreviousStage = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    }

    // Record stage history
    const { error: historyError } = await supabase
        .from("pipeline_stage_history")
        .insert({
            deal_id: dealId,
            from_stage_id: oldStageId,
            to_stage_id: newStageId,
            changed_by_id: internalUserId,
            time_in_previous_stage: timeInPreviousStage,
        });

    if (historyError) {
        console.error("Failed to log stage history:", historyError.message);
    }

    await logActivity({
        workspaceId: currentDeal.workspace_id,
        entityType: "DEAL",
        entityId: dealId,
        actionType: "STAGE_CHANGED",
        actorUserId: internalUserId,
        description: `Changed pipeline stage`,
        metadata: { from_stage_id: oldStageId, to_stage_id: newStageId },
    });

    // Send STAGE_CHANGE notification to the deal's assigned user (if different from actor)
    const { data: dealForNotify } = await supabase
        .from("deals")
        .select("assigned_to_id, deal_name")
        .eq("id", dealId)
        .single();

    if (
        dealForNotify?.assigned_to_id &&
        dealForNotify.assigned_to_id !== internalUserId
    ) {
        sendNotification({
            workspaceId: currentDeal.workspace_id,
            userId: dealForNotify.assigned_to_id,
            type: "STAGE_CHANGE",
            entityType: "DEAL",
            entityId: dealId,
            title: `Stage changed: ${dealForNotify.deal_name || "Untitled Deal"}`,
            message: "Deal pipeline stage was updated.",
            actionUrl: `/crm/deals/${dealId}`,
        }).catch((err: unknown) =>
            console.error("Failed to send stage change notification:", err)
        );
    }

    revalidatePath("/crm/deals");
    revalidatePath(`/crm/deals/${dealId}`);
}

// Whitelist of fields that can be updated inline from the data table
const INLINE_EDITABLE_FIELDS = new Set([
    "deal_status",
    "potential_tier",
    "estimated_deal_value",
    "commission_rate",
    "pipeline_stage_id",
    "closed_lost_reason",
]);

export async function updateDealField(
    dealId: string,
    field: string,
    value: unknown
): Promise<void> {
    if (!INLINE_EDITABLE_FIELDS.has(field)) {
        throw new Error(`Field "${field}" is not inline-editable.`);
    }

    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    // Fetch current value for change logging
    const { data: current, error: fetchError } = await supabase
        .from("deals")
        .select("*")
        .eq("id", dealId)
        .single();

    if (fetchError || !current) throw new Error(fetchError?.message ?? "Deal not found");

    const oldValue = current[field as keyof typeof current];
    if (String(oldValue ?? "") === String(value ?? "")) return;

    const updatePayload: Record<string, unknown> = {
        [field]: value,
        last_updated_by_id: internalUserId,
        last_action_date: new Date().toISOString(),
    };

    // Auto-calculate commission when value or rate changes
    if (field === "estimated_deal_value") {
        const rate = current.commission_rate;
        if (rate != null && value != null) {
            updatePayload.estimated_commission = (value as number) * (rate / 100);
        }
    } else if (field === "commission_rate") {
        const dealValue = current.estimated_deal_value;
        if (dealValue != null && value != null) {
            updatePayload.estimated_commission = dealValue * ((value as number) / 100);
        }
    }

    // Handle pipeline stage change — record history
    if (field === "pipeline_stage_id" && oldValue !== value) {
        // Compute time_in_previous_stage from last history entry
        let timeInPrev: number | null = null;
        const { data: lastHist } = await supabase
            .from("pipeline_stage_history")
            .select("changed_at")
            .eq("deal_id", dealId)
            .order("changed_at", { ascending: false })
            .limit(1)
            .single();

        if (lastHist) {
            const diffMs =
                new Date().getTime() - new Date(lastHist.changed_at).getTime();
            timeInPrev = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        }

        const { error: historyError } = await supabase
            .from("pipeline_stage_history")
            .insert({
                deal_id: dealId,
                from_stage_id: oldValue as string,
                to_stage_id: value as string,
                changed_by_id: internalUserId,
                time_in_previous_stage: timeInPrev,
            });
        if (historyError) {
            console.error("Failed to log stage history:", historyError.message);
        }
    }

    const { error } = await supabase
        .from("deals")
        .update(updatePayload)
        .eq("id", dealId);

    if (error) throw new Error(error.message);

    const actionType = field === "pipeline_stage_id" ? "STAGE_CHANGED" : "UPDATED";
    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "DEAL",
        entityId: dealId,
        actionType,
        actorUserId: internalUserId,
        description: `Changed ${field.replace(/_/g, " ")} from "${oldValue ?? "—"}" to "${value ?? "—"}"`,
        metadata: { field, oldValue, newValue: value },
    });

    // Send STAGE_CHANGE notification when stage is changed inline
    if (field === "pipeline_stage_id" && current.assigned_to_id && current.assigned_to_id !== internalUserId) {
        sendNotification({
            workspaceId: current.workspace_id,
            userId: current.assigned_to_id,
            type: "STAGE_CHANGE",
            entityType: "DEAL",
            entityId: dealId,
            title: `Stage changed: ${current.deal_name || "Untitled Deal"}`,
            message: "Deal pipeline stage was updated.",
            actionUrl: `/crm/deals/${dealId}`,
        }).catch((err: unknown) =>
            console.error("Failed to send stage change notification:", err)
        );
    }

    revalidatePath("/crm/deals");
    revalidatePath(`/crm/deals/${dealId}`);
}

export async function getPipelineStageHistory(dealId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("pipeline_stage_history")
        .select(
            `*,
            from_stage:pipeline_stages!pipeline_stage_history_from_stage_id_fkey(id, pipeline_stage_name, stage_color),
            to_stage:pipeline_stages!pipeline_stage_history_to_stage_id_fkey(id, pipeline_stage_name, stage_color),
            changed_by_user:users!pipeline_stage_history_changed_by_id_fkey(id, first_name, last_name)`
        )
        .eq("deal_id", dealId)
        .order("changed_at", { ascending: true });

    if (error) {
        console.error("Failed to fetch stage history:", error.message);
        return [];
    }
    return data ?? [];
}

export async function archiveDeal(id: string) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    const { data, error } = await supabase
        .from("deals")
        .update({ archived: true, last_updated_by_id: internalUserId })
        .eq("id", id)
        .select("id, workspace_id")
        .single();

    if (error) throw new Error(error.message);

    if (data) {
        await logActivity({
            workspaceId: data.workspace_id,
            entityType: "DEAL",
            entityId: data.id,
            actionType: "ARCHIVED",
            actorUserId: internalUserId,
            description: `Archived deal`,
        });
    }

    revalidatePath("/crm/deals");
}

export async function restoreDeal(id: string) {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();

    let internalUserId: string | null = null;
    if (authUserId) {
        const { data: userRec } = await supabase
            .from("users")
            .select("id")
            .eq("auth_uid", authUserId)
            .single();
        internalUserId = userRec?.id ?? null;
    }

    const { data, error } = await supabase
        .from("deals")
        .update({ archived: false, last_updated_by_id: internalUserId })
        .eq("id", id)
        .select("id, workspace_id")
        .single();

    if (error) throw new Error(error.message);

    if (data) {
        await logActivity({
            workspaceId: data.workspace_id,
            entityType: "DEAL",
            entityId: data.id,
            actionType: "RESTORED",
            actorUserId: internalUserId,
            description: `Restored deal`,
        });
    }

    revalidatePath("/crm/deals");
}
