import { getCurrentUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { PipelineContent } from "./pipeline-content";
import {
    ensureDefaultPipelineStages,
    getDealCountForStages,
} from "../pipeline-actions";

export default async function PipelineSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Auto-seed defaults if none exist
    await ensureDefaultPipelineStages(user.workspace_id);

    const supabase = await createClient();
    const [{ data: stages }, dealCounts, t] = await Promise.all([
        supabase
            .from("pipeline_stages")
            .select("*")
            .eq("workspace_id", user.workspace_id)
            .order("stage_order", { ascending: true }),
        getDealCountForStages(user.workspace_id),
        getTranslations("pipeline"),
    ]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">{t("title")}</h2>
                <p className="text-sm text-muted-foreground">
                    {t("subtitle")}
                </p>
            </div>
            <PipelineContent
                stages={stages ?? []}
                workspaceId={user.workspace_id}
                dealCounts={dealCounts}
            />
        </div>
    );
}
