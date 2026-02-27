"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";
import { logActivity } from "@/lib/activity-logger";

type ListingInsert = Database["public"]["Tables"]["listings"]["Insert"];

// Fields that are tracked in listing_updates when changed
const TRACKED_FIELDS = [
    "listing_status",
    "asking_price",
    "rental_price",
    "listing_grade",
    "listing_type",
    "property_type",
    "bedrooms",
    "bathrooms",
    "size_sqm",
    "floor",
    "zone",
    "featured_flag",
    "focus_flag",
    "website_visible",
    "exclusive_agreement",
] as const;

interface PriceHistoryEntry {
    price: number;
    date: string;
    changed_by: string | null;
}

/**
 * Get the current authenticated user's ID from Supabase auth.
 */
async function getAuthUserId(): Promise<string | null> {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    return user?.id ?? null;
}

/**
 * Log a field change to the listing_updates table.
 */
async function logListingUpdate(
    listingId: string,
    currentStatus: string,
    fieldChanged: string,
    oldValue: string | null,
    newValue: string | null,
    userId: string | null
): Promise<void> {
    const supabase = await createClient();
    await supabase.from("listing_updates").insert({
        listing_id: listingId,
        status: currentStatus,
        field_changed: fieldChanged,
        old_value: oldValue,
        new_value: newValue,
        updated_by_id: userId,
    });
}

/**
 * Handle asking price history tracking. Appends old price to the JSON history array.
 * Only `asking_price_history` exists in the schema — rental price changes are
 * tracked via listing_updates only.
 */
function buildPriceHistoryUpdate(
    oldPrice: number | null,
    currentHistory: PriceHistoryEntry[] | null,
    userId: string | null
): Record<string, unknown> {
    if (oldPrice == null) return {};

    const history: PriceHistoryEntry[] = Array.isArray(currentHistory)
        ? currentHistory
        : [];

    const entry: PriceHistoryEntry = {
        price: oldPrice,
        date: new Date().toISOString(),
        changed_by: userId,
    };

    return { asking_price_history: [...history, entry] };
}

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

export async function getListingUpdates(listingId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listing_updates")
        .select("*, users!listing_updates_updated_by_id_fkey(first_name, last_name)")
        .eq("listing_id", listingId)
        .order("updated_at", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function createListing(formData: ListingInsert) {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data, error } = await supabase
        .from("listings")
        .insert({
            ...formData,
            last_updated_at: new Date().toISOString(),
            // If status is ACTIVE on create, record the timestamp
            ...(formData.listing_status === "ACTIVE"
                ? { listing_status_changed_at: new Date().toISOString() }
                : {}),
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    // Log the creation as a listing update
    await logListingUpdate(
        data.id,
        data.listing_status,
        "listing_status",
        null,
        data.listing_status,
        userId
    );

    await logActivity({
        workspaceId: data.workspace_id,
        entityType: "LISTING",
        entityId: data.id,
        actionType: "CREATED",
        actorUserId: userId,
        description: "Created listing",
    });

    revalidatePath("/listings");
    return data;
}

export async function updateListing(
    id: string,
    formData: Record<string, unknown>
): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    // Fetch current listing to compare values for change logging
    const { data: current, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !current) throw new Error(fetchError?.message ?? "Listing not found");

    const updatePayload: Record<string, unknown> = {
        ...formData,
        last_updated_at: new Date().toISOString(),
        last_updated_by_id: userId,
    };

    // Track status changes
    if (
        formData.listing_status !== undefined &&
        formData.listing_status !== current.listing_status
    ) {
        updatePayload.listing_status_changed_at = new Date().toISOString();

        // Calculate days_on_market when first going ACTIVE
        if (
            formData.listing_status === "ACTIVE" &&
            current.days_on_market == null
        ) {
            updatePayload.days_on_market = 0;
        }
    }

    // Track asking_price changes — append to history
    if (
        formData.asking_price !== undefined &&
        formData.asking_price !== current.asking_price &&
        current.asking_price != null
    ) {
        const historyUpdate = buildPriceHistoryUpdate(
            current.asking_price,
            current.asking_price_history as PriceHistoryEntry[] | null,
            userId
        );
        Object.assign(updatePayload, historyUpdate);
    }

    // Perform the update
    const { error } = await supabase
        .from("listings")
        .update(updatePayload as Record<string, unknown>)
        .eq("id", id);

    if (error) throw new Error(error.message);

    // Log changes to listing_updates for tracked fields
    const currentStatus =
        (formData.listing_status as string) ?? current.listing_status;

    for (const field of TRACKED_FIELDS) {
        if (formData[field] !== undefined) {
            const oldVal = current[field as keyof typeof current];
            const newVal = formData[field];
            if (String(oldVal ?? "") !== String(newVal ?? "")) {
                await logListingUpdate(
                    id,
                    currentStatus,
                    field,
                    oldVal != null ? String(oldVal) : null,
                    newVal != null ? String(newVal) : null,
                    userId
                );

                await logActivity({
                    workspaceId: current.workspace_id,
                    entityType: "LISTING",
                    entityId: id,
                    actionType: field === "listing_status" ? "STATUS_CHANGED" : "UPDATED",
                    actorUserId: userId,
                    description: `Updated ${field} from ${oldVal ?? 'empty'} to ${newVal ?? 'empty'}`,
                    metadata: { field, oldVal, newVal }
                });
            }
        }
    }

    // Special logic to log photo or media updates which aren't in TRACKED_FIELDS
    if (formData.unit_photos !== undefined && JSON.stringify(formData.unit_photos) !== JSON.stringify(current.unit_photos)) {
        await logActivity({
            workspaceId: current.workspace_id,
            entityType: "LISTING",
            entityId: id,
            actionType: "PHOTO_UPLOADED",
            actorUserId: userId,
            description: "Updated listing photos gallery"
        });
    }

    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
}

export async function updateListingField(
    id: string,
    field: string,
    value: unknown
): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    // Fetch current value for change logging
    const { data: current, error: fetchError } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !current) throw new Error(fetchError?.message ?? "Listing not found");

    const oldValue = current[field as keyof typeof current];

    // Skip if value hasn't changed
    if (String(oldValue ?? "") === String(value ?? "")) return;

    const updatePayload: Record<string, unknown> = {
        [field]: value,
        last_updated_at: new Date().toISOString(),
        last_updated_by_id: userId,
    };

    // Handle status change specifics
    if (field === "listing_status") {
        updatePayload.listing_status_changed_at = new Date().toISOString();

        // Set days_on_market to 0 when first going ACTIVE
        if (value === "ACTIVE" && current.days_on_market == null) {
            updatePayload.days_on_market = 0;
        }
    }

    // Handle asking price changes — append to price history JSON
    if (field === "asking_price" && oldValue != null) {
        const historyUpdate = buildPriceHistoryUpdate(
            oldValue as number,
            current.asking_price_history as PriceHistoryEntry[] | null,
            userId
        );
        Object.assign(updatePayload, historyUpdate);
    }

    // Perform the update
    const { error } = await supabase
        .from("listings")
        .update(updatePayload as Record<string, unknown>)
        .eq("id", id);

    if (error) throw new Error(error.message);

    // Log to listing_updates if this is a tracked field
    if (TRACKED_FIELDS.includes(field as (typeof TRACKED_FIELDS)[number])) {
        const currentStatus =
            field === "listing_status"
                ? String(value)
                : current.listing_status;
        await logListingUpdate(
            id,
            currentStatus,
            field,
            oldValue != null ? String(oldValue) : null,
            value != null ? String(value) : null,
            userId
        );

        await logActivity({
            workspaceId: current.workspace_id,
            entityType: "LISTING",
            entityId: id,
            actionType: field === "listing_status" ? "STATUS_CHANGED" : "UPDATED",
            actorUserId: userId,
            description: `Updated ${field} from ${oldValue ?? 'empty'} to ${value ?? 'empty'}`,
            metadata: { field, oldValue, newValue: value }
        });
    } else if (field === "unit_photos") {
        await logActivity({
            workspaceId: current.workspace_id,
            entityType: "LISTING",
            entityId: id,
            actionType: "PHOTO_UPLOADED",
            actorUserId: userId,
            description: "Updated listing photos gallery"
        });
    }

    revalidatePath("/listings");
    revalidatePath(`/listings/${id}`);
}

export async function getArchivedListings(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("listings")
        .select(
            "*, contacts!listings_seller_contact_id_fkey(first_name, last_name, nickname)"
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", true)
        .order("last_updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function restoreListing(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("listings")
        .select("workspace_id")
        .eq("id", id)
        .single();

    if (fetchError || !current) throw new Error(fetchError?.message ?? "Listing not found");

    const { error } = await supabase
        .from("listings")
        .update({
            archived: false,
            last_updated_at: new Date().toISOString(),
            last_updated_by_id: userId,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    await logListingUpdate(id, "RESTORED", "archived", "true", "false", userId);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "LISTING",
        entityId: id,
        actionType: "RESTORED",
        actorUserId: userId,
        description: "Restored listing from archive",
    });

    revalidatePath("/listings");
}

export async function archiveListing(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("listings")
        .select("workspace_id")
        .eq("id", id)
        .single();

    if (fetchError || !current) throw new Error(fetchError?.message ?? "Listing not found");

    const { error } = await supabase
        .from("listings")
        .update({
            archived: true,
            last_updated_at: new Date().toISOString(),
            last_updated_by_id: userId,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    // Log the archive action
    await logListingUpdate(id, "ARCHIVED", "archived", "false", "true", userId);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "LISTING",
        entityId: id,
        actionType: "ARCHIVED",
        actorUserId: userId,
        description: "Archived listing",
    });

    revalidatePath("/listings");
}
