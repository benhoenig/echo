"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterConfig = Record<string, any>;

interface SavedFilter {
    id: string;
    filter_name: string;
    filter_config: FilterConfig;
    is_shared: boolean;
    user_id: string;
    created_at: string;
}

export async function getSavedFilters(workspaceId: string, userId: string): Promise<SavedFilter[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("saved_filters")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("module", "LISTINGS")
        .or(`user_id.eq.${userId},is_shared.eq.true`)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return (data ?? []) as SavedFilter[];
}

export async function createSavedFilter(
    workspaceId: string,
    userId: string,
    filterName: string,
    filterConfig: FilterConfig,
    isShared: boolean
) {
    const supabase = await createClient();
    const { error } = await supabase.from("saved_filters").insert({
        workspace_id: workspaceId,
        user_id: userId,
        module: "LISTINGS" as const,
        filter_name: filterName,
        filter_config: filterConfig,
        is_shared: isShared,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/listings");
}

export async function deleteSavedFilter(id: string) {
    const supabase = await createClient();
    const { error } = await supabase.from("saved_filters").delete().eq("id", id);
    if (error) throw new Error(error.message);
    revalidatePath("/listings");
}
