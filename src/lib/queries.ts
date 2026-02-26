import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/**
 * Get the current authenticated user and their workspace user record.
 * Returns null if not authenticated or user record doesn't exist.
 *
 * Wrapped with React cache() to deduplicate calls within a single
 * server render cycle — multiple server components calling this
 * during one request will only trigger the network calls once.
 */
export const getCurrentUser = cache(async function getCurrentUser() {
    const supabase = await createClient();
    const {
        data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) return null;

    const response = await supabase
        .from("users")
        .select("*, workspaces(*)")
        .eq("id", authUser.id)
        .single();

    return response.data;
});

/**
 * Get dashboard metrics for the current user's workspace.
 */
export async function getDashboardMetrics(workspaceId: string) {
    const supabase = await createClient();

    const [listings, deals, contacts, recentActivity] = await Promise.all([
        supabase
            .from("listings")
            .select("id, listing_status", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("archived", false),
        supabase
            .from("deals")
            .select("id, deal_status", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("archived", false),
        supabase
            .from("contacts")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("archived", false),
        supabase
            .from("activity_logs")
            .select("id, entity_type, action_type, description, created_at, actor_user_id")
            .eq("workspace_id", workspaceId)
            .order("created_at", { ascending: false })
            .limit(5),
    ]);

    return {
        totalListings: listings.count ?? 0,
        totalDeals: deals.count ?? 0,
        totalContacts: contacts.count ?? 0,
        recentActivity: recentActivity.data ?? [],
    };
}

/**
 * Get workspace details by ID.
 */
export async function getWorkspace(workspaceId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("workspaces")
        .select("*")
        .eq("id", workspaceId)
        .single();
    return data;
}

/**
 * Get workspace team members.
 */
export async function getTeamMembers(workspaceId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("users")
        .select("*")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: true });
    return data ?? [];
}

/**
 * Get workspace pending invitations.
 */
export async function getPendingInvitations(workspaceId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from("workspace_invitations")
        .select("*")
        .eq("workspace_id", workspaceId)
        .eq("status", "PENDING")
        .order("invited_at", { ascending: false });
    return data ?? [];
}
