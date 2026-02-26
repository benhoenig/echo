import { getCurrentUser, getWorkspace } from "@/lib/queries";
import { redirect } from "next/navigation";
import { WorkspaceSettingsForm } from "./workspace-form";

export default async function WorkspaceSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspace = await getWorkspace(user.workspace_id);
    if (!workspace) redirect("/login");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Workspace</h2>
                <p className="text-sm text-muted-foreground">
                    Manage your workspace settings and preferences
                </p>
            </div>
            <WorkspaceSettingsForm workspace={workspace} userId={user.id} />
        </div>
    );
}
