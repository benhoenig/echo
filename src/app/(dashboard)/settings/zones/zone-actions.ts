"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getZones() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("zones")
        .select("*")
        .order("zone_name_english", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function createZone(formData: {
    zone_name_english: string;
    zone_name_thai: string;
}) {
    const supabase = await createClient();
    const { error } = await supabase.from("zones").insert(formData);

    if (error) throw new Error(error.message);
    revalidatePath("/settings/zones");
}

export async function updateZone(
    id: string,
    formData: {
        zone_name_english: string;
        zone_name_thai: string;
    }
) {
    const supabase = await createClient();
    const { error } = await supabase
        .from("zones")
        .update(formData)
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/settings/zones");
}

export async function deleteZone(id: string) {
    const supabase = await createClient();

    // Check if any projects reference this zone
    const { count } = await supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("zone_id", id);

    if (count && count > 0) {
        throw new Error(
            `Cannot delete zone: ${count} project(s) are using it.`
        );
    }

    const { error } = await supabase.from("zones").delete().eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/settings/zones");
}
