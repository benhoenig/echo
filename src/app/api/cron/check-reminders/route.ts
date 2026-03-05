import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    calculateReminderStatus,
    findMatchingPlaybooks,
    getEffectiveInterval,
} from "@/lib/reminder-engine";
import type { PlaybookRow, EntityMatchProps } from "@/lib/reminder-engine";
import { sendNotificationBatch } from "@/lib/notifications";

/**
 * Daily cron route that checks all active deals and listings for overdue reminders.
 * Uses Playbook-first logic — only creates notifications when an explicit Playbook exists.
 *
 * Schedule: 0 8 * * * (daily at 8 AM UTC / 3 PM ICT)
 * Protected by CRON_SECRET Bearer token.
 */
export async function GET(req: NextRequest) {
    // Verify authorization
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        let remindersCreated = 0;
        let dealsChecked = 0;
        let listingsChecked = 0;

        // Fetch all active workspaces
        const workspaces = await prisma.workspace.findMany({
            select: { id: true },
        });

        for (const workspace of workspaces) {
            const workspaceId = workspace.id;

            // Fetch all active playbooks for this workspace
            const rawPlaybooks = await prisma.stageActionPlaybook.findMany({
                where: { workspaceId, isActive: true },
            });

            const playbooks: PlaybookRow[] = rawPlaybooks.map((p) => ({
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

            // Skip workspace if no playbooks defined
            if (playbooks.length === 0) continue;

            // ─── Check Deals ─────────────────────────────────────────────
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
                    assignedToId: true,
                    createdById: true,
                    stageHistory: {
                        orderBy: { changedAt: "desc" },
                        take: 1,
                        select: { changedAt: true, toStageId: true },
                    },
                },
            });

            // Get existing unread ACTION_REMINDER notifications for deals
            const existingDealReminders = await prisma.notification.findMany({
                where: {
                    workspaceId,
                    type: "ACTION_REMINDER",
                    entityType: "DEAL",
                    isRead: false,
                },
                select: { entityId: true },
            });
            const dealsWithReminder = new Set(existingDealReminders.map((n) => n.entityId));

            const dealNotifications: Array<{
                workspaceId: string;
                userId: string;
                type: "ACTION_REMINDER";
                entityType: "DEAL";
                entityId: string;
                title: string;
                message: string;
                actionUrl: string;
            }> = [];

            for (const deal of deals) {
                dealsChecked++;

                // Skip if there's already an unread reminder
                if (dealsWithReminder.has(deal.id)) continue;

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

                // No applicable interval = no reminder
                if (interval == null) continue;

                const status = calculateReminderStatus(
                    deal.lastActionDate,
                    deal.createdAt,
                    interval
                );

                if (status.isOverdue) {
                    const notifyUserId = deal.assignedToId || deal.createdById;
                    if (!notifyUserId) continue;

                    const actionLabel = matchingPlaybooks[0]?.actionLabel ?? "Follow up";

                    dealNotifications.push({
                        workspaceId,
                        userId: notifyUserId,
                        type: "ACTION_REMINDER",
                        entityType: "DEAL",
                        entityId: deal.id,
                        title: `Action overdue: ${deal.dealName || "Untitled Deal"}`,
                        message: `"${actionLabel}" is ${Math.abs(status.daysUntilDue!)} days overdue for deal "${deal.dealName}"${deal.potentialTier ? ` (Tier ${deal.potentialTier})` : ""}.`,
                        actionUrl: `/crm/deals/${deal.id}`,
                    });
                }
            }

            if (dealNotifications.length > 0) {
                await sendNotificationBatch(dealNotifications);
                remindersCreated += dealNotifications.length;
            }

            // ─── Check Listings ──────────────────────────────────────────
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
                    createdById: true,
                },
            });

            const existingListingReminders = await prisma.notification.findMany({
                where: {
                    workspaceId,
                    type: "ACTION_REMINDER",
                    entityType: "LISTING",
                    isRead: false,
                },
                select: { entityId: true },
            });
            const listingsWithReminder = new Set(existingListingReminders.map((n) => n.entityId));

            const listingNotifications: Array<{
                workspaceId: string;
                userId: string;
                type: "ACTION_REMINDER";
                entityType: "LISTING";
                entityId: string;
                title: string;
                message: string;
                actionUrl: string;
            }> = [];

            for (const listing of listings) {
                listingsChecked++;

                if (listingsWithReminder.has(listing.id)) continue;

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

                if (status.isOverdue) {
                    const notifyUserId = listing.createdById;
                    if (!notifyUserId) continue;

                    const actionLabel = matchingPlaybooks[0]?.actionLabel ?? "Follow up";

                    listingNotifications.push({
                        workspaceId,
                        userId: notifyUserId,
                        type: "ACTION_REMINDER",
                        entityType: "LISTING",
                        entityId: listing.id,
                        title: `Action overdue: ${listing.listingName || "Untitled Listing"}`,
                        message: `"${actionLabel}" is ${Math.abs(status.daysUntilDue!)} days overdue for listing "${listing.listingName}"${listing.listingGrade ? ` (Grade ${listing.listingGrade})` : ""}.`,
                        actionUrl: `/listings/${listing.id}`,
                    });
                }
            }

            if (listingNotifications.length > 0) {
                await sendNotificationBatch(listingNotifications);
                remindersCreated += listingNotifications.length;
            }
        }

        return NextResponse.json({
            success: true,
            dealsChecked,
            listingsChecked,
            remindersCreated,
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Cron check-reminders failed:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
