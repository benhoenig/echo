import { getDeal, getPipelineStageHistory } from "../deal-actions";
import { DealDetailContent } from "./deal-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";

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

        return (
            <DealDetailContent
                deal={deal}
                agents={agents}
                contacts={contacts}
                listings={listings}
                pipelineStages={pipelineStages}
                zones={zones}
                stageHistory={stageHistory}
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
