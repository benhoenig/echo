import { getCurrentUser, getTeamMembers, getPendingInvitations } from "@/lib/queries";
import { redirect } from "next/navigation";
import { TeamContent } from "./team-content";

export default async function TeamSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [members, pendingInvites] = await Promise.all([
        getTeamMembers(user.workspace_id),
        getPendingInvitations(user.workspace_id)
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Team Members</h2>
                <p className="text-sm text-muted-foreground">
                    Manage who has access to your workspace
                </p>
            </div>
            <TeamContent
                members={members}
                pendingInvites={pendingInvites}
                currentUserId={user.id}
                workspaceId={user.workspace_id}
            />
        </div>
    );
}
