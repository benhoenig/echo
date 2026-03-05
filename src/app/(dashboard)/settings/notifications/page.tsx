import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/queries";
import { getNotificationPreferences } from "./notification-pref-actions";
import { NotificationSettingsContent } from "./notification-settings-content";

export default async function NotificationSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const preferences = await getNotificationPreferences(
        user.workspace_id,
        user.id
    );

    return (
        <NotificationSettingsContent
            initialPreferences={preferences}
            workspaceId={user.workspace_id}
            userId={user.id}
        />
    );
}
