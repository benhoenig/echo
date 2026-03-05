import { getCurrentUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { getPlaybooks, getPipelineStages } from "./playbook-actions";
import { PlaybookContent } from "./playbook-content";

export default async function PlaybookSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspaceId = user.workspace_id;

    const [playbooks, pipelineStages] = await Promise.all([
        getPlaybooks(workspaceId),
        getPipelineStages(workspaceId),
    ]);

    return (
        <PlaybookContent
            initialPlaybooks={playbooks}
            pipelineStages={pipelineStages}
            workspaceId={workspaceId}
        />
    );
}
