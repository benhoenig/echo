"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function updateWorkspace(formData: FormData) {
    const supabase = await createClient();
    const workspaceId = formData.get("workspaceId") as string;
    const name = formData.get("workspace_name") as string;
    const primaryColor = formData.get("primaryColor") as string;

    const updateData: Record<string, string> = {};
    if (name) updateData.workspace_name = name;
    if (primaryColor) updateData.primary_color = primaryColor;

    const { error, count } = await supabase
        .from("workspaces")
        .update(updateData, { count: "exact" })
        .eq("id", workspaceId);

    console.log("[updateWorkspace] workspaceId:", workspaceId);
    console.log("[updateWorkspace] updateData:", updateData);
    console.log("[updateWorkspace] error:", error);
    console.log("[updateWorkspace] rows affected:", count);

    if (error) {
        return { error: error.message };
    }

    if (count === 0) {
        return { error: "Update was blocked — check Supabase RLS policies for the workspaces table." };
    }

    revalidatePath("/", "layout");
    return { success: true };
}

export async function updateUserProfile(formData: FormData) {
    const supabase = await createClient();
    const userId = formData.get("userId") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const phone = formData.get("phone") as string;
    const lineId = formData.get("lineId") as string;

    const { error } = await supabase
        .from("users")
        .update({
            first_name: firstName,
            last_name: lastName,
            phone: phone || null,
            line_id: lineId || null,
        })
        .eq("id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/settings");
    return { success: true };
}

export async function inviteTeamMember(formData: FormData) {
    const workspaceId = formData.get("workspaceId") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: "SUPABASE_SERVICE_ROLE_KEY is required to invite users." };
    }

    const adminAuthClient = createAdminClient();

    // Invite the user by email, passing the workspace and role details in user_metadata
    // This triggers the Magic Link email from Supabase natively.
    const { error } = await adminAuthClient.auth.admin.inviteUserByEmail(email, {
        data: {
            invited_workspace_id: workspaceId,
            invited_role: role,
            first_name: firstName,
            last_name: lastName,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // Insert pending invitation record
    const { error: dbError } = await adminAuthClient
        .from("workspace_invitations")
        .insert({
            workspace_id: workspaceId,
            email: email,
            role: role.toUpperCase() as any,
            status: "PENDING",
        });

    if (dbError) {
        console.error("Failed to insert pending invitation:", dbError);
        // We don't fail the whole action here since the email was sent successfully.
    }

    revalidatePath("/settings/team");
    return { success: true };
}

export async function updateTeamMemberRole(formData: FormData) {
    const supabase = await createClient();
    const userId = formData.get("userId") as string;
    const role = formData.get("role") as string;

    const { error } = await supabase
        .from("users")
        .update({ role: role.toUpperCase() as any })
        .eq("id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/settings/team");
    return { success: true };
}

export async function removeTeamMember(formData: FormData) {
    const supabase = await createClient();
    const userId = formData.get("userId") as string;

    const { error } = await supabase
        .from("users")
        .update({ is_active: false })
        .eq("id", userId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/settings/team");
    return { success: true };
}

export async function revokeInvitation(formData: FormData) {
    const adminAuthClient = createAdminClient();
    const invitationId = formData.get("invitationId") as string;

    const { error } = await adminAuthClient
        .from("workspace_invitations")
        .delete()
        .eq("id", invitationId);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/settings/team");
    return { success: true };
}
