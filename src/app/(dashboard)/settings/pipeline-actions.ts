"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// ── Pipeline Stages ──────────────────────────────────────────

export async function createPipelineStage(formData: FormData) {
    const supabase = await createClient();
    const workspaceId = formData.get("workspaceId") as string;
    const name = formData.get("name") as string;
    const pipelineType = formData.get("pipelineType") as string;
    const stageColor = (formData.get("stageColor") as string) || "#78716C";
    const description = formData.get("description") as string;

    // Get next order
    const { count } = await supabase
        .from("pipeline_stages")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .eq("pipeline_type", pipelineType.toUpperCase() as any);

    const { error } = await supabase.from("pipeline_stages").insert({
        workspace_id: workspaceId,
        pipeline_stage_name: name,
        pipeline_type: pipelineType.toUpperCase() as any,
        stage_color: stageColor,
        stage_description: description || null,
        stage_order: (count ?? 0) + 1,
        updated_at: new Date().toISOString(),
    });

    if (error) return { error: error.message };
    revalidatePath("/settings/pipeline");
    return { success: true };
}

export async function updatePipelineStage(formData: FormData) {
    const supabase = await createClient();
    const stageId = formData.get("stageId") as string;
    const name = formData.get("name") as string;
    const stageColor = formData.get("stageColor") as string;
    const description = formData.get("description") as string;

    const { error } = await supabase
        .from("pipeline_stages")
        .update({
            pipeline_stage_name: name,
            stage_color: stageColor || "#78716C",
            stage_description: description || null,
            updated_at: new Date().toISOString(),
        })
        .eq("id", stageId);

    if (error) return { error: error.message };
    revalidatePath("/settings/pipeline");
    return { success: true };
}

export async function deletePipelineStage(formData: FormData) {
    const supabase = await createClient();
    const stageId = formData.get("stageId") as string;

    // Check for active deals using this stage
    const { count } = await supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("pipeline_stage_id", stageId)
        .eq("archived", false);

    if (count && count > 0) {
        return {
            error: `Cannot delete stage: ${count} active deal(s) are using it. Move or archive the deals first, or deactivate the stage instead.`,
        };
    }

    // Also check archived deals
    const { count: archivedCount } = await supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("pipeline_stage_id", stageId)
        .eq("archived", true);

    if (archivedCount && archivedCount > 0) {
        return {
            error: `Cannot delete stage: ${archivedCount} archived deal(s) still reference it. Deactivate the stage instead.`,
        };
    }

    const { error } = await supabase
        .from("pipeline_stages")
        .delete()
        .eq("id", stageId);

    if (error) return { error: error.message };
    revalidatePath("/settings/pipeline");
    return { success: true };
}

export async function deactivatePipelineStage(stageId: string) {
    const supabase = await createClient();

    // Check for active deals
    const { count } = await supabase
        .from("deals")
        .select("id", { count: "exact", head: true })
        .eq("pipeline_stage_id", stageId)
        .eq("archived", false);

    if (count && count > 0) {
        return {
            error: `Cannot deactivate stage: ${count} active deal(s) are using it. Move or archive the deals first.`,
        };
    }

    const { error } = await supabase
        .from("pipeline_stages")
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq("id", stageId);

    if (error) return { error: error.message };
    revalidatePath("/settings/pipeline");
    revalidatePath("/crm/deals");
    return { success: true };
}

export async function reactivatePipelineStage(stageId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("pipeline_stages")
        .update({ is_active: true, updated_at: new Date().toISOString() })
        .eq("id", stageId);

    if (error) return { error: error.message };
    revalidatePath("/settings/pipeline");
    revalidatePath("/crm/deals");
    return { success: true };
}

export async function getDealCountForStages(workspaceId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("deals")
        .select("pipeline_stage_id")
        .eq("workspace_id", workspaceId)
        .eq("archived", false);

    if (error || !data) return {};

    const counts: Record<string, number> = {};
    for (const deal of data) {
        const stageId = deal.pipeline_stage_id;
        if (stageId) {
            counts[stageId] = (counts[stageId] ?? 0) + 1;
        }
    }
    return counts;
}

export async function reorderPipelineStages(stageIds: string[]) {
    const supabase = await createClient();
    const updates = stageIds.map((id, index) =>
        supabase.from("pipeline_stages").update({ stage_order: index + 1, updated_at: new Date().toISOString() }).eq("id", id)
    );
    await Promise.all(updates);
    revalidatePath("/settings/pipeline");
    return { success: true };
}

// ── Potential Configs ────────────────────────────────────────

export async function updatePotentialConfig(formData: FormData) {
    const supabase = await createClient();
    const configId = formData.get("configId") as string;
    const potentialName = formData.get("potentialName") as string;
    const color = formData.get("color") as string;
    const reminderInterval = parseInt(formData.get("reminderInterval") as string);
    const description = formData.get("description") as string;

    const { error } = await supabase
        .from("potential_configs")
        .update({
            potential_name: potentialName || null,
            color,
            reminder_interval: reminderInterval || 30,
            description: description || null,
        })
        .eq("id", configId);

    if (error) return { error: error.message };
    revalidatePath("/settings/potential");
    return { success: true };
}

export async function ensureDefaultPotentialConfigs(workspaceId: string) {
    const supabase = await createClient();

    // Check if configs exist
    const { count } = await supabase
        .from("potential_configs")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);

    if (count && count > 0) return;

    // Seed defaults for all modules
    const modules = ["listings", "buyer_crm", "seller_crm"] as const;
    const tiers = [
        { label: "A", name: "Hot", color: "#EF4444", interval: 3, order: 1 },
        { label: "B", name: "Warm", color: "#F97316", interval: 7, order: 2 },
        { label: "C", name: "Cool", color: "#3B82F6", interval: 14, order: 3 },
        { label: "D", name: "Cold", color: "#78716C", interval: 30, order: 4 },
    ];

    const rows = modules.flatMap((module) =>
        tiers.map((tier) => ({
            workspace_id: workspaceId,
            module: module.toUpperCase() as any,
            potential_label: tier.label as "A" | "B" | "C" | "D",
            potential_name: tier.name,
            color: tier.color,
            reminder_interval: tier.interval,
            order: tier.order,
            last_updated_at: new Date().toISOString(),
        }))
    );

    await supabase.from("potential_configs").insert(rows);
}

export async function ensureDefaultPipelineStages(workspaceId: string) {
    const supabase = await createClient();

    const { count } = await supabase
        .from("pipeline_stages")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);

    if (count && count > 0) return;

    const buyerStages = [
        { name: "New Lead", order: 1, color: "#78716C" },
        { name: "Qualified", order: 2, color: "#3B82F6" },
        { name: "Viewing Scheduled", order: 3, color: "#8B5CF6" },
        { name: "Viewed", order: 4, color: "#F97316" },
        { name: "Offer Made", order: 5, color: "#EAB308" },
        { name: "Negotiation", order: 6, color: "#F59E0B" },
        { name: "Contract", order: 7, color: "#22C55E" },
        { name: "Transfer", order: 8, color: "#10B981" },
    ];

    const sellerStages = [
        { name: "New Listing", order: 1, color: "#78716C" },
        { name: "Preparing", order: 2, color: "#3B82F6" },
        { name: "Active", order: 3, color: "#22C55E" },
        { name: "Showing", order: 4, color: "#8B5CF6" },
        { name: "Offer Received", order: 5, color: "#EAB308" },
        { name: "Negotiation", order: 6, color: "#F59E0B" },
        { name: "Contract", order: 7, color: "#F97316" },
        { name: "Transfer", order: 8, color: "#10B981" },
    ];

    const rows = [
        ...buyerStages.map((s) => ({
            workspace_id: workspaceId,
            pipeline_stage_name: s.name,
            pipeline_type: "BUYER" as any,
            stage_order: s.order,
            stage_color: s.color,
            is_default: true,
            updated_at: new Date().toISOString(),
        })),
        ...sellerStages.map((s) => ({
            workspace_id: workspaceId,
            pipeline_stage_name: s.name,
            pipeline_type: "SELLER" as any,
            stage_order: s.order,
            stage_color: s.color,
            is_default: true,
            updated_at: new Date().toISOString(),
        })),
    ];

    await supabase.from("pipeline_stages").insert(rows);
}
