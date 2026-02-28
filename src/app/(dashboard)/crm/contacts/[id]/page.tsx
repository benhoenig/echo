import { getContact } from "../contact-actions";
import { ContactDetailContent } from "./contact-detail-content";
import { CommentSection } from "@/components/shared/comment-section";
import { ActivityFeed } from "@/components/shared/activity-feed";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function ContactDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    try {
        const contact = await getContact(id);

        if (!contact) notFound();

        // Fetch team members for assignment dropdown
        const rawUsers = await prisma.user.findMany({
            where: { workspaceId: contact.workspace_id },
            select: { id: true, firstName: true, lastName: true },
            orderBy: { firstName: "asc" },
        });

        const agents = rawUsers.map((u: any) => ({
            id: u.id,
            name:
                [u.firstName, u.lastName].filter(Boolean).join(" ") ||
                "Unknown",
        }));

        // Fetch contacts for "Referred By" dropdown
        const rawContacts = await prisma.contact.findMany({
            where: {
                workspaceId: contact.workspace_id,
                id: { not: id },
                archived: false,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
            },
            orderBy: { firstName: "asc" },
        });

        const contactOptions = rawContacts.map((c: any) => ({
            id: c.id,
            name:
                c.nickname ||
                [c.firstName, c.lastName].filter(Boolean).join(" ") ||
                "Unknown",
        }));

        return (
            <ContactDetailContent
                contact={contact}
                agents={agents}
                contactOptions={contactOptions}
                commentsNode={
                    <CommentSection
                        workspaceId={contact.workspace_id}
                        entityType="CONTACT"
                        entityId={contact.id}
                        currentUserAuthId={null as any}
                    />
                }
                activityFeedNode={
                    <ActivityFeed
                        workspaceId={contact.workspace_id}
                        entityType="CONTACT"
                        entityId={contact.id}
                    />
                }
            />
        );
    } catch {
        notFound();
    }
}
