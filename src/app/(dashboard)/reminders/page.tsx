import { getCurrentUser } from "@/lib/queries";
import { redirect } from "next/navigation";
import { RemindersContent } from "./reminders-content";

export const metadata = {
    title: "Action Reminders — ECHO",
    description: "View and act on overdue follow-ups for deals and listings.",
};

export default async function RemindersPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const workspaceId = user.workspace_id;

    return (
        <div className="p-6 max-w-5xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">
                    Action Reminders
                </h1>
                <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Deals and listings that need your attention. Most overdue items appear first.
                </p>
            </div>

            <RemindersContent workspaceId={workspaceId} />
        </div>
    );
}
