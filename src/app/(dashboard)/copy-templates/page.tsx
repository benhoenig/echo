import { Metadata } from "next";
import { getCurrentUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { CopyTemplateList } from "./copy-template-list";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
    title: "Copy Templates Settings",
};

export default async function CopyTemplatesPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspaceId = user.workspace_id;
    if (!workspaceId) {
        return (
            <div className="p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-xl font-semibold mb-2">No Workspace Selected</h2>
                    <p className="text-stone-500">Please select a workspace to manage copy templates.</p>
                </div>
            </div>
        );
    }

    // Fetch existing templates for this workspace
    const templates = await prisma.copyTemplate.findMany({
        where: { workspaceId: workspaceId },
        orderBy: [
            { isDefault: "desc" },
            { listingType: "asc" },
            { listingGrade: "asc" },
            { name: "asc" }
        ],
    });

    return (
        <div className="p-8 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-foreground">Copy Templates</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage the templates used for the "Generate Listing Copy" feature. You can create different templates based on Listing Type and Grade.
                </p>
            </div>

            <CopyTemplateList initialTemplates={templates} workspaceId={workspaceId} />
        </div>
    );
}
