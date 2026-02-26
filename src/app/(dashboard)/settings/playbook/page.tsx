import { getCurrentUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PlaybookSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    const supabase = await createClient();
    const { data: playbooks } = await supabase
        .from("stage_action_playbooks")
        .select("*, pipeline_stages(name, pipeline_type, stage_color)")
        .eq("workspace_id", user.workspace_id)
        .order("created_at", { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Stage Playbooks</h2>
                <p className="text-sm text-muted-foreground">
                    Define action checklists for each pipeline stage — coming soon
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Action Playbooks</CardTitle>
                    <CardDescription>
                        Playbooks let you define a set of actions (call, visit, send docs) that
                        should be completed when a deal enters a specific pipeline stage.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {(!playbooks || playbooks.length === 0) ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">
                                No playbooks configured yet. Set up your pipeline stages first, then
                                come back to create action checklists for each stage.
                            </p>
                            <Badge variant="secondary" className="mt-3">
                                Phase 1 Feature
                            </Badge>
                        </div>
                    ) : (
                        <ul className="space-y-3">
                            {playbooks.map((p) => (
                                <li key={p.id} className="border border-border rounded-lg p-3">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div
                                            className="w-2.5 h-2.5 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    (p.pipeline_stages as { stage_color?: string })?.stage_color || "#78716C",
                                            }}
                                        />
                                        <span className="text-sm font-medium">{p.action_label}</span>
                                    </div>
                                    {p.action_description && (
                                        <p className="text-xs text-muted-foreground ml-5">
                                            {p.action_description}
                                        </p>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
