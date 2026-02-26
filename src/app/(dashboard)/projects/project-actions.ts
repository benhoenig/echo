"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type PropertyType = Database["public"]["Enums"]["PropertyType"];

export async function getProjects(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("*, zones!projects_zone_id_fkey(zone_name_english, zone_name_thai)")
        .eq("workspace_id", workspaceId)
        .order("project_name_english", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getProject(projectId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .select("*, zones!projects_zone_id_fkey(zone_name_english, zone_name_thai)")
        .eq("id", projectId)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createProject(formData: {
    workspace_id: string;
    project_name_thai: string;
    project_name_english: string;
    property_type: PropertyType;
    zone_id?: string | null;
    bts?: string | null;
    mrt?: string | null;
    developer?: string | null;
    year_built?: number | null;
    number_of_buildings?: number | null;
    number_of_floors?: number | null;
    number_of_units?: number | null;
    parking_slot_ratio?: string | null;
    parking_slot_trade_allow?: boolean | null;
    facilities?: string[];
    maintenance_fee?: number | null;
    maintenance_fee_payment_terms?: string | null;
    maintenance_fee_collection_ratio?: string | null;
    juristic_company?: string | null;
    avg_sale_price_sqm?: number | null;
    avg_rental_price_sqm?: number | null;
    unit_types?: string[];
    floor_to_ceiling_height?: number | null;
    max_units_per_floor?: number | null;
    project_segment?: string | null;
    comparable_projects?: string[];
    best_view?: string | null;
    best_direction?: string | null;
    best_unit_position?: string | null;
    household_nationality_ratio?: string | null;
    nearest_station_type?: string | null;
    nearest_station_distance?: string | null;
    nearest_station_transport?: string | null;
    target_customer_group?: string | null;
    strengths?: string | null;
    weaknesses?: string | null;
    google_maps_link?: string | null;
    matching_tags?: string[];
    created_by_id?: string | null;
    last_updated_by_id?: string | null;
    last_updated_at: string;
}) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("projects")
        .insert(formData)
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath("/projects");
    return data;
}

export async function updateProject(
    id: string,
    formData: Record<string, unknown>
): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("projects")
        .update({
            ...formData,
            last_updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
}

export async function deleteProject(id: string) {
    const supabase = await createClient();

    // Check if any listings reference this project
    const { count } = await supabase
        .from("listings")
        .select("id", { count: "exact", head: true })
        .eq("project_id", id);

    if (count && count > 0) {
        throw new Error(
            `Cannot delete project: ${count} listing(s) are linked to it.`
        );
    }

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/projects");
}
