"use server";

import { createClient } from "@/lib/supabase/server";

export async function fetchDealQuickViewData(
    workspaceId: string,
    dealId: string
) {
    const supabase = await createClient();

    const [commentsResult, activityResult] = await Promise.all([
        supabase
            .from("comments")
            .select(`
                id,
                content,
                created_at,
                is_deleted,
                author_user_id,
                users:author_user_id (
                    first_name,
                    last_name,
                    profile_photo_url
                )
            `)
            .eq("entity_type", "DEAL")
            .eq("entity_id", dealId)
            .order("created_at", { ascending: true }),
        supabase
            .from("activity_logs")
            .select(`
                id,
                action_type,
                description,
                created_at,
                actor_user_id,
                users:actor_user_id (
                    first_name,
                    last_name,
                    profile_photo_url
                )
            `)
            .eq("workspace_id", workspaceId)
            .eq("entity_type", "DEAL")
            .eq("entity_id", dealId)
            .order("created_at", { ascending: false })
            .limit(50),
    ]);

    if (commentsResult.error) {
        return { error: commentsResult.error.message, comments: [], activityLogs: [] };
    }
    if (activityResult.error) {
        return { error: activityResult.error.message, comments: [], activityLogs: [] };
    }

    return {
        comments: commentsResult.data ?? [],
        activityLogs: activityResult.data ?? [],
    };
}

export async function fetchDealBuyerRequirements(dealId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("deals")
        .select(
            "budget_min, budget_max, preferred_bedrooms, preferred_size_min, preferred_size_max, preferred_floor_min, preferred_floor_max, preferred_property_type, preferred_zone_ids, preferred_facilities, has_pet, has_ev_car, parking_slots_needed, pain_points, special_requirements, timeline, purpose_of_purchase, financing_method, pre_approved_amount, pre_approval_expiry_date"
        )
        .eq("id", dealId)
        .single();

    if (error) return { error: error.message, requirements: null };
    return { requirements: data };
}
