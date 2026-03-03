import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateReminderStatus, getEffectiveInterval } from "@/lib/reminder-engine";
import type { PotentialConfigRow, PlaybookRow } from "@/lib/reminder-engine";

/**
 * Daily cron route that checks all active deals and listings for overdue reminders.
 * Creates ACTION_REMINDER notifications for overdue items.
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

            // Fetch potential configs for this workspace (all modules)
            const rawConfigs = await prisma.potentialConfig.findMany({
                where: { workspaceId, isActive: true },
            });

            const potentialConfigs: PotentialConfigRow[] = rawConfigs.map((c) => ({
                id: c.id,
                module: c.module,
                potentialLabel: c.potentialLabel,
                reminderInterval: c.reminderInterval,
                isActive: c.isActive,
            }));

            // Fetch playbooks for override checking
            const rawPlaybooks = await prisma.stageActionPlaybook.findMany({
                where: { workspaceId, isActive: true, reminderOverride: true },
            });

            const playbooks: PlaybookRow[] = rawPlaybooks.map((p) => ({
                id: p.id,
                pipelineStageId: p.pipelineStageId,
                actionType: p.actionType,
                actionLabel: p.actionLabel,
                actionDescription: p.actionDescription,
                actionTemplate: p.actionTemplate,
                reminderOverride: p.reminderOverride,
                overrideIntervalDays: p.overrideIntervalDays,
                isRequired: p.isRequired,
                isActive: p.isActive,
                order: p.order,
            }));

            // ─── Check Deals ─────────────────────────────────────────────
            const deals = await prisma.deal.findMany({
                where: {
                    workspaceId,
                    archived: false,
                    dealStatus: { in: ["ACTIVE", "ON_HOLD"] },
                    potentialTier: { not: null },
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
                },
            });

            // Get existing unread ACTION_REMINDER notifications for deals in this workspace
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
                isRead: boolean;
            }> = [];

            for (const deal of deals) {
                dealsChecked++;

                // Skip if there's already an unread reminder
                if (dealsWithReminder.has(deal.id)) continue;

                const module = deal.dealType === "SELL_SIDE" ? "SELLER_CRM" : "BUYER_CRM";
                const moduleConfigs = potentialConfigs.filter((c) => c.module === module);
                const interval = getEffectiveInterval(
                    moduleConfigs,
                    deal.potentialTier,
                    playbooks,
                    deal.pipelineStageId
                );

                const status = calculateReminderStatus(
                    deal.lastActionDate,
                    deal.createdAt,
                    interval
                );

                if (status.isOverdue) {
                    const notifyUserId = deal.assignedToId || deal.createdById;
                    if (!notifyUserId) continue;

                    dealNotifications.push({
                        workspaceId,
                        userId: notifyUserId,
                        type: "ACTION_REMINDER",
                        entityType: "DEAL",
                        entityId: deal.id,
                        title: `Follow-up overdue: ${deal.dealName || "Untitled Deal"}`,
                        message: `Deal "${deal.dealName}" (Tier ${deal.potentialTier}) is ${Math.abs(status.daysUntilDue)} days overdue for follow-up.`,
                        actionUrl: `/crm/deals/${deal.id}`,
                        isRead: false,
                    });
                }
            }

            if (dealNotifications.length > 0) {
                await prisma.notification.createMany({
                    data: dealNotifications,
                });
                remindersCreated += dealNotifications.length;
            }

            // ─── Check Listings ──────────────────────────────────────────
            const listings = await prisma.listing.findMany({
                where: {
                    workspaceId,
                    archived: false,
                    listingStatus: { in: ["ACTIVE", "NEW"] },
                    listingGrade: { not: null },
                },
                select: {
                    id: true,
                    listingName: true,
                    listingGrade: true,
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
                isRead: boolean;
            }> = [];

            const listingConfigs = potentialConfigs.filter((c) => c.module === "LISTINGS");

            for (const listing of listings) {
                listingsChecked++;

                if (listingsWithReminder.has(listing.id)) continue;

                const interval = getEffectiveInterval(listingConfigs, listing.listingGrade);

                const status = calculateReminderStatus(
                    listing.lastActionDate,
                    listing.createdAt,
                    interval
                );

                if (status.isOverdue) {
                    const notifyUserId = listing.createdById;
                    if (!notifyUserId) continue;

                    listingNotifications.push({
                        workspaceId,
                        userId: notifyUserId,
                        type: "ACTION_REMINDER",
                        entityType: "LISTING",
                        entityId: listing.id,
                        title: `Follow-up overdue: ${listing.listingName || "Untitled Listing"}`,
                        message: `Listing "${listing.listingName}" (Grade ${listing.listingGrade}) is ${Math.abs(status.daysUntilDue)} days overdue for follow-up.`,
                        actionUrl: `/listings/${listing.id}`,
                        isRead: false,
                    });
                }
            }

            if (listingNotifications.length > 0) {
                await prisma.notification.createMany({
                    data: listingNotifications,
                });
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
