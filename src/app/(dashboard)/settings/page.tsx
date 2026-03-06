import { getCurrentUser, getWorkspace } from "@/lib/queries";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { WorkspaceSettingsForm } from "./workspace-form";

export default async function WorkspaceSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspace = await getWorkspace(user.workspace_id);
    if (!workspace) redirect("/login");

    const t = await getTranslations("settings");

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">{t("workspaceTitle")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("workspaceSubtitle")}
                </p>
            </div>
            <WorkspaceSettingsForm workspace={workspace} userId={user.id} />
        </div>
    );
}
