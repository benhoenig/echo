"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

async function getInternalUserId(): Promise<string | null> {
    const supabase = await createClient();
    const authUserId = await getAuthUserId();
    if (!authUserId) return null;
    const { data: userRec } = await supabase
        .from("users")
        .select("id")
        .eq("auth_uid", authUserId)
        .single();
    return userRec?.id ?? null;
}

export async function getSavedFilters(workspaceId: string) {
    const supabase = await createClient();
    const internalUserId = await getInternalUserId();

    if (!internalUserId) return [];

    const { data, error } = await supabase
        .from("saved_filters")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("module", "DEALS")
        .or(`user_id.eq.${internalUserId},is_shared.eq.true`)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function createSavedFilter(
    workspaceId: string,
    filterName: string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filterConfig: any,
    isShared: boolean = false
) {
    const supabase = await createClient();
    const internalUserId = await getInternalUserId();
    if (!internalUserId) throw new Error("Not authenticated");

    const { data, error } = await supabase
        .from("saved_filters")
        .insert({
            workspace_id: workspaceId,
            user_id: internalUserId,
            module: "DEALS" as const,
            filter_name: filterName,
            filter_config: filterConfig,
            is_shared: isShared,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath("/crm/deals");
    return data;
}

export async function deleteSavedFilter(filterId: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", filterId);

    if (error) throw new Error(error.message);
    revalidatePath("/crm/deals");
}
