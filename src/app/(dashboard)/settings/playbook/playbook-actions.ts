"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { revalidatePath } from "next/cache";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PlaybookFormData {
    module: "DEALS" | "LISTINGS";
    pipelineStageId: string | null;
    listingStatus: string | null;
    potentialTier: string | null;
    propertyType: string | null;
    listingType: string | null;
    dealType: string | null;
    actionType: string;
    actionLabel: string;
    actionDescription: string | null;
    actionTemplate: string | null;
    overrideIntervalDays: number | null;
    isRecurring: boolean;
    isRequired: boolean;
}

export interface PlaybookItem {
    id: string;
    module: string;
    pipelineStageId: string | null;
    pipelineStageName: string | null;
    listingStatus: string | null;
    potentialTier: string | null;
    propertyType: string | null;
    listingType: string | null;
    dealType: string | null;
    actionType: string;
    actionLabel: string;
    actionDescription: string | null;
    actionTemplate: string | null;
    overrideIntervalDays: number | null;
    isRecurring: boolean;
    isRequired: boolean;
    isActive: boolean;
    order: number;
    createdAt: string;
}

export interface PipelineStageOption {
    id: string;
    name: string;
    pipelineType: string;
    stageColor: string | null;
}

// ─── Fetch playbooks ─────────────────────────────────────────────────────────

export async function getPlaybooks(workspaceId: string): Promise<PlaybookItem[]> {
    const playbooks = await prisma.stageActionPlaybook.findMany({
        where: { workspaceId },
        include: {
            pipelineStage: {
                select: { pipelineStageName: true },
            },
        },
        orderBy: [{ module: "asc" }, { order: "asc" }, { createdAt: "asc" }],
    });

    return playbooks.map((p) => ({
        id: p.id,
        module: p.module,
        pipelineStageId: p.pipelineStageId,
        pipelineStageName: p.pipelineStage?.pipelineStageName ?? null,
        listingStatus: p.listingStatus,
        potentialTier: p.potentialTier,
        propertyType: p.propertyType,
        listingType: p.listingType,
        dealType: p.dealType,
        actionType: p.actionType,
        actionLabel: p.actionLabel,
        actionDescription: p.actionDescription,
        actionTemplate: p.actionTemplate,
        overrideIntervalDays: p.overrideIntervalDays,
        isRecurring: p.isRecurring,
        isRequired: p.isRequired,
        isActive: p.isActive,
        order: p.order,
        createdAt: p.createdAt.toISOString(),
    }));
}

// ─── Fetch pipeline stages for form dropdown ─────────────────────────────────

export async function getPipelineStages(workspaceId: string): Promise<PipelineStageOption[]> {
    const stages = await prisma.pipelineStage.findMany({
        where: { workspaceId },
        orderBy: [{ pipelineType: "asc" }, { stageOrder: "asc" }],
        select: {
            id: true,
            pipelineStageName: true,
            pipelineType: true,
            stageColor: true,
        },
    });

    return stages.map((s) => ({
        id: s.id,
        name: s.pipelineStageName,
        pipelineType: s.pipelineType,
        stageColor: s.stageColor,
    }));
}

// ─── Create playbook ─────────────────────────────────────────────────────────

export async function createPlaybookAction(
    workspaceId: string,
    data: PlaybookFormData
) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    // Get max order for this workspace
    const maxOrder = await prisma.stageActionPlaybook.aggregate({
        where: { workspaceId },
        _max: { order: true },
    });

    await prisma.stageActionPlaybook.create({
        data: {
            workspaceId,
            module: data.module as any,
            pipelineStageId: data.pipelineStageId || null,
            listingStatus: data.listingStatus as any || null,
            potentialTier: data.potentialTier || null,
            propertyType: data.propertyType as any || null,
            listingType: data.listingType as any || null,
            dealType: data.dealType as any || null,
            actionType: data.actionType as any,
            actionLabel: data.actionLabel,
            actionDescription: data.actionDescription || null,
            actionTemplate: data.actionTemplate || null,
            reminderOverride: data.overrideIntervalDays != null,
            overrideIntervalDays: data.overrideIntervalDays,
            isRecurring: data.isRecurring,
            isRequired: data.isRequired,
            order: (maxOrder._max.order ?? 0) + 1,
            createdById: user.id,
        },
    });

    revalidatePath("/settings/playbook");
    return { success: true };
}

// ─── Update playbook ─────────────────────────────────────────────────────────

export async function updatePlaybookAction(
    playbookId: string,
    workspaceId: string,
    data: Partial<PlaybookFormData> & { isActive?: boolean }
) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    // Verify ownership
    const existing = await prisma.stageActionPlaybook.findFirst({
        where: { id: playbookId, workspaceId },
    });
    if (!existing) throw new Error("Playbook not found");

    await prisma.stageActionPlaybook.update({
        where: { id: playbookId },
        data: {
            ...(data.module !== undefined && { module: data.module as any }),
            ...(data.pipelineStageId !== undefined && { pipelineStageId: data.pipelineStageId || null }),
            ...(data.listingStatus !== undefined && { listingStatus: data.listingStatus as any || null }),
            ...(data.potentialTier !== undefined && { potentialTier: data.potentialTier || null }),
            ...(data.propertyType !== undefined && { propertyType: data.propertyType as any || null }),
            ...(data.listingType !== undefined && { listingType: data.listingType as any || null }),
            ...(data.dealType !== undefined && { dealType: data.dealType as any || null }),
            ...(data.actionType !== undefined && { actionType: data.actionType as any }),
            ...(data.actionLabel !== undefined && { actionLabel: data.actionLabel }),
            ...(data.actionDescription !== undefined && { actionDescription: data.actionDescription || null }),
            ...(data.actionTemplate !== undefined && { actionTemplate: data.actionTemplate || null }),
            ...(data.overrideIntervalDays !== undefined && {
                overrideIntervalDays: data.overrideIntervalDays,
                reminderOverride: data.overrideIntervalDays != null,
            }),
            ...(data.isRecurring !== undefined && { isRecurring: data.isRecurring }),
            ...(data.isRequired !== undefined && { isRequired: data.isRequired }),
            ...(data.isActive !== undefined && { isActive: data.isActive }),
            lastUpdatedById: user.id,
        },
    });

    revalidatePath("/settings/playbook");
    return { success: true };
}

// ─── Delete playbook ─────────────────────────────────────────────────────────

export async function deletePlaybookAction(
    playbookId: string,
    workspaceId: string
) {
    const user = await getCurrentUser();
    if (!user) throw new Error("Not authenticated");

    // Verify ownership
    const existing = await prisma.stageActionPlaybook.findFirst({
        where: { id: playbookId, workspaceId },
    });
    if (!existing) throw new Error("Playbook not found");

    await prisma.stageActionPlaybook.delete({
        where: { id: playbookId },
    });

    revalidatePath("/settings/playbook");
    return { success: true };
}
