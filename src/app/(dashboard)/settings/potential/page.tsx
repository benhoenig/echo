import { getCurrentUser } from "@/lib/queries";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { PotentialContent } from "./potential-content";
import { ensureDefaultPotentialConfigs } from "../pipeline-actions";

export default async function PotentialSettingsPage() {
    const user = await getCurrentUser();
    if (!user) redirect("/login");

    await ensureDefaultPotentialConfigs(user.workspace_id);

    const supabase = await createClient();
    const { data: configs } = await supabase
        .from("potential_configs")
        .select("*")
        .eq("workspace_id", user.workspace_id)
        .order("order", { ascending: true });

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Potential Tiers</h2>
                <p className="text-sm text-muted-foreground">
                    Configure A/B/C/D tier labels, colors, and follow-up reminder intervals
                </p>
            </div>
            <PotentialContent configs={configs ?? []} />
        </div>
    );
}
