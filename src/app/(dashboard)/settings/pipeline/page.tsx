import { getCurrentUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PipelineContent } from "./pipeline-content";
import { ensureDefaultPipelineStages } from "../pipeline-actions";

export default async function PipelineSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    // Auto-seed defaults if none exist
    await ensureDefaultPipelineStages(user.workspace_id);

    const supabase = await createClient();
    const { data: stages } = await supabase
        .from("pipeline_stages")
        .select("*")
        .eq("workspace_id", user.workspace_id)
        .order("stage_order", { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Pipeline Stages</h2>
                <p className="text-sm text-muted-foreground">
                    Configure deal pipeline stages for buyer and seller flows
                </p>
            </div>
            <PipelineContent
                stages={stages ?? []}
                workspaceId={user.workspace_id}
            />
        </div>
    );
}
