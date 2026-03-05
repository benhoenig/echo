import { getListing, getListingUpdates } from "../listing-actions";
import { ListingDetailContent } from "./listing-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { SuggestedActionsPanel } from "@/components/shared/suggested-actions-panel";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { findMatchingPlaybooks, getEffectiveInterval } from "@/lib/reminder-engine";
import type { PlaybookRow, EntityMatchProps } from "@/lib/reminder-engine";

export default async function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const [listing, updates, currentUser] = await Promise.all([
            getListing(id),
            getListingUpdates(id),
            getCurrentUser(),
        ]);

        if (!listing) notFound();

        // Fetch contacts and agents for the agreements form
        const [rawContacts, rawUsers] = await Promise.all([
            prisma.contact.findMany({
                where: { workspaceId: listing.workspace_id },
                select: { id: true, firstName: true, lastName: true, nickname: true },
                orderBy: { firstName: 'asc' }
            }),
            prisma.user.findMany({
                where: { workspaceId: listing.workspace_id },
                select: { id: true, firstName: true, lastName: true },
                orderBy: { firstName: 'asc' }
            })
        ]);

        const contacts = rawContacts.map((c: any) => ({
            id: c.id,
            name: c.nickname || [c.firstName, c.lastName].filter(Boolean).join(" ") || "Unknown"
        }));

        const agents = rawUsers.map((u: any) => ({
            id: u.id,
            name: [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown"
        }));

        // Fetch playbooks and compute effective interval via playbook-first logic
        const rawPlaybooks = await prisma.stageActionPlaybook.findMany({
            where: { workspaceId: listing.workspace_id, isActive: true },
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

        const entityProps: EntityMatchProps = {
            module: "LISTINGS",
            listingStatus: listing.listing_status,
            potentialTier: listing.listing_grade ?? undefined,
            propertyType: listing.property_type,
            listingType: listing.listing_type,
        };

        const matchingPlaybooks = findMatchingPlaybooks(playbooks, entityProps);
        const stageEnteredAt = listing.listing_status_changed_at ?? listing.created_at;

        const effectiveInterval = getEffectiveInterval(
            matchingPlaybooks,
            listing.last_action_date,
            stageEnteredAt
        );

        // Build suggested actions from matching playbooks
        const suggestedActions = matchingPlaybooks.map((p) => ({
            id: p.id,
            actionType: p.actionType,
            actionLabel: p.actionLabel,
            actionDescription: p.actionDescription,
            actionTemplate: p.actionTemplate,
            isRequired: p.isRequired,
        }));

        return (
            <ListingDetailContent
                listing={listing}
                updates={updates}
                agents={agents}
                contacts={contacts}
                followUpNode={
                    <SuggestedActionsPanel
                        entityType="LISTING"
                        entityId={listing.id}
                        entityName={listing.listing_name || "Untitled Listing"}
                        workspaceId={listing.workspace_id}
                        lastActionDate={listing.last_action_date}
                        createdAt={listing.created_at}
                        intervalDays={effectiveInterval}
                        playbooks={suggestedActions}
                    />
                }
                commentsNode={
                    <CommentSection
                        workspaceId={listing.workspace_id}
                        entityType="LISTING"
                        entityId={listing.id}
                        currentUserAuthId={currentUser?.id ?? null}
                    />
                }
                activityFeedNode={
                    <ActivityFeed
                        workspaceId={listing.workspace_id}
                        entityType="LISTING"
                        entityId={listing.id}
                    />
                }
            />
        );
    } catch {
        notFound();
    }
}
