import { getListing, getListingUpdates } from "../listing-actions";
import { ListingDetailContent } from "./listing-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ListingDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const [listing, updates] = await Promise.all([
            getListing(id),
            getListingUpdates(id),
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

        return (
            <ListingDetailContent
                listing={listing}
                updates={updates}
                agents={agents}
                contacts={contacts}
                commentsNode={
                    <CommentSection
                        workspaceId={listing.workspace_id}
                        entityType="LISTING"
                        entityId={listing.id}
                        currentUserAuthId={null as any}
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
