import { getDeal, getPipelineStageHistory } from "../deal-actions";
import { DealDetailContent } from "./deal-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { SuggestedActionsPanel } from "@/components/shared/suggested-actions-panel";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { getSuggestedActions, getPotentialConfigs } from "@/app/(dashboard)/reminder-actions";
import { getEffectiveInterval } from "@/lib/reminder-engine";

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

        // Fetch reminder/actions data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const dealAny = deal as any;
        const dealModule = dealAny.deal_type === "SELL_SIDE" ? "SELLER_CRM" : "BUYER_CRM";
        const [potentialConfigs, playbooks] = await Promise.all([
            getPotentialConfigs(dealAny.workspace_id, dealModule),
            dealAny.pipeline_stage_id
                ? getSuggestedActions(dealAny.workspace_id, dealAny.pipeline_stage_id)
                : Promise.resolve([]),
        ]);

        const effectiveInterval = getEffectiveInterval(
            potentialConfigs,
            dealAny.potential_tier,
            undefined,
            undefined
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
                        playbooks={playbooks}
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
