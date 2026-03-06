import { getCurrentUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { RemindersContent } from "./reminders-content";
import { getTranslations } from "next-intl/server";

export const metadata = {
    title: "Action Reminders — ECHO",
    description: "View and act on overdue follow-ups for deals and listings.",
};

export default async function RemindersPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspaceId = user.workspace_id;
    const t = await getTranslations("reminders");

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    {t("pageTitle")}
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    {t("pageDescription")}
                </p>
            </div>

            <RemindersContent workspaceId={workspaceId} />
        </div>
    );
}
