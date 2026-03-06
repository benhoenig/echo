import { getCurrentUser, getTeamMembers, getPendingInvitations } from "@/lib/queries";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { TeamContent } from "./team-content";

export default async function TeamSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const [members, pendingInvites, t] = await Promise.all([
        getTeamMembers(user.workspace_id),
        getPendingInvitations(user.workspace_id),
        getTranslations("team"),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">{t("title")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle")}
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
