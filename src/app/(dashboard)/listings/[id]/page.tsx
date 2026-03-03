import { getListing, getListingUpdates } from "../listing-actions";
import { ListingDetailContent } from "./listing-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { SuggestedActionsPanel } from "@/components/shared/suggested-actions-panel";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/queries";
import { getPotentialConfigs } from "@/app/(dashboard)/reminder-actions";
import { getEffectiveInterval } from "@/lib/reminder-engine";

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
        // We only fetch basic nested info
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

        // Fetch reminder config for listing grade
        const potentialConfigs = await getPotentialConfigs(listing.workspace_id, "LISTINGS");
        const effectiveInterval = getEffectiveInterval(potentialConfigs, listing.listing_grade);

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
