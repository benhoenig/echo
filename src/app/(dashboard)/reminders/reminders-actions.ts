"use server";

import { prisma } from "@/lib/prisma";
import {
    calculateReminderStatus,
    findMatchingPlaybooks,
    getEffectiveInterval,
    type PlaybookRow,
    type EntityMatchProps,
    type Urgency,
} from "@/lib/reminder-engine";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OverdueItem {
    id: string;
    name: string;
    entityType: "DEAL" | "LISTING";
    tier: string | null;
    urgency: Urgency;
    daysUntilDue: number;
    daysSinceLastAction: number;
    intervalDays: number;
    lastActionDate: string | null;
    createdAt: string;
    pipelineStageId: string | null;
    pipelineStageName: string | null;
    dealType: string | null;
    listingStatus: string | null;
    actionUrl: string;
    suggestedActions: {
        id: string;
        actionType: string;
        actionLabel: string;
        actionDescription: string | null;
        isRequired: boolean;
    }[];
}

// ─── Helper: Map Prisma playbook rows to PlaybookRow ─────────────────────────

function mapPlaybooks(rawPlaybooks: Awaited<ReturnType<typeof prisma.stageActionPlaybook.findMany>>): PlaybookRow[] {
    return rawPlaybooks.map((p) => ({
        id: p.id,
        module: p.module,
        pipelineStageId: p.pipelineStageId,
        listingStatus: p.listingStatus,
        potentialTier: p.potentialTier,
        propertyType: p.propertyType,
        listingType: p.listingType,
        dealType: p.dealType,
        actionType: p.actionType,
        actionLabel: p.actionLabel,
        actionDescription: p.actionDescription,
        actionTemplate: p.actionTemplate,
        reminderOverride: p.reminderOverride,
        overrideIntervalDays: p.overrideIntervalDays,
        isRecurring: p.isRecurring,
        isRequired: p.isRequired,
        isActive: p.isActive,
        order: p.order,
    }));
}

// ─── Fetch all overdue / due / approaching items for the workspace ───────────

export async function getOverdueItems(
    workspaceId: string
): Promise<OverdueItem[]> {
    const items: OverdueItem[] = [];

    // ─── Fetch all active playbooks ──────────────────────────────────
    const rawPlaybooks = await prisma.stageActionPlaybook.findMany({
        where: { workspaceId, isActive: true },
    });

    const playbooks = mapPlaybooks(rawPlaybooks);

    // If no playbooks exist, nothing can trigger — return empty
    if (playbooks.length === 0) return items;

    // ─── Fetch Deals ───────────────────────────────────────────────────
    const deals = await prisma.deal.findMany({
        where: {
            workspaceId,
            archived: false,
            dealStatus: { in: ["ACTIVE", "ON_HOLD"] },
        },
        select: {
            id: true,
            dealName: true,
            potentialTier: true,
            dealType: true,
            pipelineStageId: true,
            lastActionDate: true,
            createdAt: true,
            pipelineStage: {
                select: { pipelineStageName: true },
            },
            stageHistory: {
                orderBy: { changedAt: "desc" },
                take: 1,
                select: { changedAt: true, toStageId: true },
            },
        },
    });

    for (const deal of deals) {
        const entityProps: EntityMatchProps = {
            module: "DEALS",
            pipelineStageId: deal.pipelineStageId,
            potentialTier: deal.potentialTier ?? undefined,
            dealType: deal.dealType,
        };

        const matchingPlaybooks = findMatchingPlaybooks(playbooks, entityProps);
        if (matchingPlaybooks.length === 0) continue;

        // Determine when this deal entered its current stage
        const latestHistory = deal.stageHistory.find(
            (h) => h.toStageId === deal.pipelineStageId
        );
        const stageEnteredAt = latestHistory?.changedAt ?? deal.createdAt;

        const interval = getEffectiveInterval(
            matchingPlaybooks,
            deal.lastActionDate,
            stageEnteredAt
        );

        // No applicable interval = no reminder for this entity
        if (interval == null) continue;

        const status = calculateReminderStatus(
            deal.lastActionDate,
            deal.createdAt,
            interval
        );

        if (status.urgency !== "ok") {
            // Build suggested actions from matching playbooks
            const suggestedActions = matchingPlaybooks.map((p) => ({
                id: p.id,
                actionType: p.actionType,
                actionLabel: p.actionLabel,
                actionDescription: p.actionDescription,
                isRequired: p.isRequired,
            }));

            items.push({
                id: deal.id,
                name: deal.dealName || "Untitled Deal",
                entityType: "DEAL",
                tier: deal.potentialTier,
                urgency: status.urgency,
                daysUntilDue: status.daysUntilDue!,
                daysSinceLastAction: status.daysSinceLastAction,
                intervalDays: status.intervalDays!,
                lastActionDate: deal.lastActionDate?.toISOString() || null,
                createdAt: deal.createdAt.toISOString(),
                pipelineStageId: deal.pipelineStageId,
                pipelineStageName: deal.pipelineStage?.pipelineStageName || null,
                dealType: deal.dealType,
                listingStatus: null,
                actionUrl: `/crm/deals/${deal.id}`,
                suggestedActions,
            });
        }
    }

    // ─── Fetch Listings ────────────────────────────────────────────────
    const listings = await prisma.listing.findMany({
        where: {
            workspaceId,
            archived: false,
            listingStatus: { in: ["ACTIVE", "NEW", "RESERVED"] },
        },
        select: {
            id: true,
            listingName: true,
            listingGrade: true,
            listingStatus: true,
            listingType: true,
            propertyType: true,
            listingStatusChangedAt: true,
            lastActionDate: true,
            createdAt: true,
        },
    });

    for (const listing of listings) {
        const entityProps: EntityMatchProps = {
            module: "LISTINGS",
            listingStatus: listing.listingStatus,
            potentialTier: listing.listingGrade ?? undefined,
            propertyType: listing.propertyType,
            listingType: listing.listingType,
        };

        const matchingPlaybooks = findMatchingPlaybooks(playbooks, entityProps);
        if (matchingPlaybooks.length === 0) continue;

        const stageEnteredAt = listing.listingStatusChangedAt ?? listing.createdAt;

        const interval = getEffectiveInterval(
            matchingPlaybooks,
            listing.lastActionDate,
            stageEnteredAt
        );

        if (interval == null) continue;

        const status = calculateReminderStatus(
            listing.lastActionDate,
            listing.createdAt,
            interval
        );

        if (status.urgency !== "ok") {
            const suggestedActions = matchingPlaybooks.map((p) => ({
                id: p.id,
                actionType: p.actionType,
                actionLabel: p.actionLabel,
                actionDescription: p.actionDescription,
                isRequired: p.isRequired,
            }));

            items.push({
                id: listing.id,
                name: listing.listingName || "Untitled Listing",
                entityType: "LISTING",
                tier: listing.listingGrade,
                urgency: status.urgency,
                daysUntilDue: status.daysUntilDue!,
                daysSinceLastAction: status.daysSinceLastAction,
                intervalDays: status.intervalDays!,
                lastActionDate: listing.lastActionDate?.toISOString() || null,
                createdAt: listing.createdAt.toISOString(),
                pipelineStageId: null,
                pipelineStageName: null,
                dealType: null,
                listingStatus: listing.listingStatus,
                actionUrl: `/listings/${listing.id}`,
                suggestedActions,
            });
        }
    }

    // Sort by most overdue first (lowest daysUntilDue)
    items.sort((a, b) => a.daysUntilDue - b.daysUntilDue);

    return items;
}
