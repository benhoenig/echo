"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "@/lib/activity-logger";

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
            seller_contact:contacts!deals_seller_contact_id_fkey(id, first_name, last_name, nickname),
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
            seller_contact:contacts!deals_seller_contact_id_fkey(id, first_name, last_name, nickname),
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
            seller_contact:contacts!deals_seller_contact_id_fkey(id, first_name, last_name, nickname, phone_primary, email),
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
        })
        .eq("id", dealId);

    if (updateError) throw new Error(updateError.message);

    // Record stage history
    const { error: historyError } = await supabase
        .from("pipeline_stage_history")
        .insert({
            deal_id: dealId,
            from_stage_id: oldStageId,
            to_stage_id: newStageId,
            changed_by_id: internalUserId,
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

    revalidatePath("/crm/deals");
    revalidatePath(`/crm/deals/${dealId}`);
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
