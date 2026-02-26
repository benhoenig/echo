"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

export async function getListings(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listings")
        .select(
            "*, contacts!listings_seller_contact_id_fkey(first_name, last_name, nickname)"
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", false)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getListing(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listings")
        .select(
            "*, contacts!listings_seller_contact_id_fkey(id, first_name, last_name, nickname, phone_primary), projects!listings_project_id_fkey(id, project_name_english, project_name_thai, zone_id, bts, mrt, property_type, zones!projects_zone_id_fkey(zone_name_english))"
        )
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);
    return data;
}

export async function createListing(formData: ListingInsert) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listings")
        .insert({
            ...formData,
            last_updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);
    revalidatePath("/listings");
    return data;
}

export async function updateListing(
    id: string,
    formData: Record<string, unknown>
): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("listings")
        .update({
            ...formData,
            last_updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
}

export async function updateListingField(
    id: string,
    field: string,
    value: unknown
): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("listings")
        .update({
            [field]: value,
            last_updated_at: new Date().toISOString(),
        } as Record<string, unknown>)
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
}

export async function archiveListing(id: string): Promise<void> {
    const supabase = await createClient();
    const { error } = await supabase
        .from("listings")
        .update({
            archived: true,
            last_updated_at: new Date().toISOString(),
        })
        .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/listings");
}
