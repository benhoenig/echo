import { getDeal, getPipelineStageHistory } from "../deal-actions";
import { DealDetailContent } from "./deal-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { SuggestedActionsPanel } from "@/components/shared/suggested-actions-panel";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { getSuggestedActions } from "@/app/(dashboard)/reminder-actions";
import { findMatchingPlaybooks, getEffectiveInterval } from "@/lib/reminder-engine";
import type { PlaybookRow, EntityMatchProps } from "@/lib/reminder-engine";

export default async function DealDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const [deal, currentUser] = await Promise.all([
            getDeal(id),
            getCurrentUser(),
        ]);

        if (!deal) notFound();

        // Fetch data in parallel
        const [rawUsers, rawContacts, rawListings, rawStages, zones, stageHistory] =
            await Promise.all([
                prisma.user.findMany({
                    where: { workspaceId: deal.workspace_id },
                    select: { id: true, firstName: true, lastName: true },
                    orderBy: { firstName: "asc" },
                }),
                prisma.contact.findMany({
                    where: {
                        workspaceId: deal.workspace_id,
                        archived: false,
                    },
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        nickname: true,
                        contactType: true,
                    },
                    orderBy: { firstName: "asc" },
                }),
                prisma.listing.findMany({
                    where: {
                        workspaceId: deal.workspace_id,
                        archived: false,
                    },
                    select: { id: true, listingName: true },
                    orderBy: { listingName: "asc" },
                }),
                prisma.pipelineStage.findMany({
                    where: {
                        workspaceId: deal.workspace_id,
                        isActive: true,
                    },
                    orderBy: { stageOrder: "asc" },
                    select: {
                        id: true,
                        pipelineStageName: true,
                        pipelineType: true,
                        stageColor: true,
                        stageOrder: true,
                        isDefault: true,
                    },
                }),
                prisma.zone.findMany({
                    select: { id: true, nameEnglish: true, nameThai: true },
                    orderBy: { nameEnglish: "asc" },
                }),
                getPipelineStageHistory(id),
            ]);

        const agents = rawUsers.map((u: any) => ({
            id: u.id,
            name:
                [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                "Unknown",
        }));

        const contacts = rawContacts.map((c: any) => ({
            id: c.id,
            name:
                c.nickname ||
                [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                "Unknown",
            contactType: c.contactType,
        }));

        const listings = rawListings.map((l: any) => ({
            id: l.id,
            name: l.listingName || "Untitled Listing",
        }));

        const pipelineStages = rawStages.map((s: any) => ({
            id: s.id,
            name: s.pipelineStageName,
            pipelineType: s.pipelineType,
            color: s.stageColor,
            order: s.stageOrder,
            isDefault: s.isDefault,
        }));

        // Fetch playbooks and compute effective interval via playbook-first logic
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dealAny = deal as any;

        const [rawPlaybooks, suggestedActions] = await Promise.all([
            prisma.stageActionPlaybook.findMany({
                where: { workspaceId: dealAny.workspace_id, isActive: true },
            }),
            dealAny.pipeline_stage_id
                ? getSuggestedActions(dealAny.workspace_id, dealAny.pipeline_stage_id)
                : Promise.resolve([]),
        ]);

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

        const entityProps: EntityMatchProps = {
            module: "DEALS",
            pipelineStageId: dealAny.pipeline_stage_id,
            potentialTier: dealAny.potential_tier ?? undefined,
            dealType: dealAny.deal_type,
        };

        const matchingPlaybooks = findMatchingPlaybooks(playbooks, entityProps);

        // Use stage history to determine when deal entered current stage
        const latestStageEntry = stageHistory.find(
            (h: any) => h.to_stage_id === dealAny.pipeline_stage_id
        );
        const stageEnteredAt = latestStageEntry?.changed_at ?? dealAny.created_at;

        const effectiveInterval = getEffectiveInterval(
            matchingPlaybooks,
            dealAny.last_action_date,
            stageEnteredAt
        );

        return (
            <DealDetailContent
                deal={deal}
                agents={agents}
                contacts={contacts}
                listings={listings}
                pipelineStages={pipelineStages}
                zones={zones}
                stageHistory={stageHistory}
                actionsNode={
                    <SuggestedActionsPanel
                        entityType="DEAL"
                        entityId={deal.id}
                        entityName={deal.deal_name || "Untitled Deal"}
                        workspaceId={deal.workspace_id}
                        lastActionDate={deal.last_action_date}
                        createdAt={deal.created_at}
                        intervalDays={effectiveInterval}
                        playbooks={suggestedActions}
                    />
                }
                commentsNode={
                    <CommentSection
                        workspaceId={deal.workspace_id}
                        entityType="DEAL"
                        entityId={deal.id}
                        currentUserAuthId={currentUser?.id ?? null}
                    />
                }
                activityFeedNode={
                    <ActivityFeed
                        workspaceId={deal.workspace_id}
                        entityType="DEAL"
                        entityId={deal.id}
                    />
                }
            />
        );
    } catch {
        notFound();
    }
}
