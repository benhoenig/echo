import { getCurrentUser } from "@/lib/queries";
import { getDeals, getArchivedDeals } from "./deal-actions";
import { DealsContent } from "./deals-content";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function DealsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [deals, archivedDeals, rawStages, rawContacts] = await Promise.all([
        getDeals(user.workspace_id),
        getArchivedDeals(user.workspace_id),
        prisma.pipelineStage.findMany({
            where: { workspaceId: user.workspace_id, isActive: true },
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
        prisma.contact.findMany({
            where: { workspaceId: user.workspace_id, archived: false },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                nickname: true,
                contactType: true,
            },
            orderBy: { firstName: "asc" },
        }),
    ]);

    const pipelineStages = rawStages.map((s) => ({
        id: s.id,
        name: s.pipelineStageName,
        pipelineType: s.pipelineType,
        color: s.stageColor,
        order: s.stageOrder,
        isDefault: s.isDefault,
    }));

    const contacts = rawContacts.map((c) => ({
        id: c.id,
        name:
            c.nickname ||
            [c.firstName, c.lastName].filter(Boolean).join(" ") ||
            "Unknown",
        contactType: c.contactType,
    }));

    // Fetch team members for assignment
    const rawUsers = await prisma.user.findMany({
        where: { workspaceId: user.workspace_id },
        select: { id: true, firstName: true, lastName: true },
        orderBy: { firstName: "asc" },
    });

    const agents = rawUsers.map((u) => ({
        id: u.id,
        name:
            [u.firstName, u.lastName].filter(Boolean).join(" ") || "Unknown",
    }));

    // Fetch listings for linking
    const rawListings = await prisma.listing.findMany({
        where: { workspaceId: user.workspace_id, archived: false },
        select: { id: true, listingName: true },
        orderBy: { listingName: "asc" },
    });

    const listings = rawListings.map((l) => ({
        id: l.id,
        name: l.listingName || "Untitled Listing",
    }));

    return (
        <DealsContent
            initialDeals={deals}
            archivedDeals={archivedDeals}
            pipelineStages={pipelineStages}
            contacts={contacts}
            agents={agents}
            listings={listings}
            workspaceId={user.workspace_id}
            userId={user.id}
        />
    );
}
