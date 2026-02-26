import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    const token_hash = searchParams.get("token_hash");
    let type = searchParams.get("type") as EmailOtpType | null;
    const next = searchParams.get("next") ?? "/dashboard";

    if (token_hash && !type) {
        type = "invite";
    }

    if (code || (token_hash && type)) {
        const supabase = await createClient();

        let authError = null;

        if (code) {
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            authError = error;
        } else if (token_hash && type) {
            const { error } = await supabase.auth.verifyOtp({ token_hash, type });
            authError = error;
        }

        if (!authError) {
            // Check if user has a workspace, if not redirect to onboarding
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (user) {
                const { data: existingUser } = await supabase
                    .from("users")
                    .select("id, workspace_id")
                    .eq("id", user.id)
                    .single();

                if (!existingUser) {
                    // Check if this user was invited via magic link to a specific workspace
                    const invitedWorkspaceId = user.user_metadata?.invited_workspace_id;
                    const invitedRole = user.user_metadata?.invited_role;

                    const firstName =
                        user.user_metadata?.first_name ||
                        user.user_metadata?.full_name?.split(" ")[0] ||
                        "User";
                    const lastName =
                        user.user_metadata?.last_name ||
                        user.user_metadata?.full_name?.split(" ").slice(1).join(" ") ||
                        "";

                    const adminClient = createAdminClient();

                    if (invitedWorkspaceId) {
                        // User was invited — link to existing workspace
                        const { error: inviteInsertError } = await adminClient.from("users").insert({
                            id: user.id,
                            workspace_id: invitedWorkspaceId,
                            first_name: firstName,
                            last_name: lastName,
                            email: user.email || "",
                            role: (invitedRole || "CO_WORKER").toUpperCase() as any,
                            profile_photo_url: user.user_metadata?.avatar_url,
                            is_active: true,
                        });

                        if (inviteInsertError) {
                            console.error("[Auth Callback] Failed to insert invited user records: ", inviteInsertError);
                        } else {
                            // Mark the invitation as ACCEPTED
                            const { error: inviteUpdateError } = await adminClient
                                .from("workspace_invitations")
                                .update({ status: "ACCEPTED" })
                                .eq("email", user.email || "")
                                .eq("workspace_id", invitedWorkspaceId);

                            if (inviteUpdateError) {
                                console.error("[Auth Callback] Failed to update invitation status: ", inviteUpdateError);
                            }
                        }

                        // Redirect to the password setup page for Option C
                        const forwardedHost = request.headers.get("x-forwarded-host");
                        const isLocalEnv = process.env.NODE_ENV === "development";
                        const baseUrl = isLocalEnv ? origin : (forwardedHost ? `https://${forwardedHost}` : origin);
                        return NextResponse.redirect(`${baseUrl}/update-password`);

                    } else {
                        // Brand new organic user — create their own workspace
                        const { data: workspace, error: wsError } = await adminClient
                            .from("workspaces")
                            .insert({
                                workspace_name: `${firstName}'s Workspace`,
                            })
                            .select("id")
                            .single();

                        if (workspace && !wsError) {
                            // Create user record
                            const { error: organicInsertError } = await adminClient.from("users").insert({
                                id: user.id,
                                workspace_id: workspace.id,
                                first_name: firstName,
                                last_name: lastName,
                                email: user.email || "",
                                role: "OWNER" as any,
                                profile_photo_url: user.user_metadata?.avatar_url,
                            });
                            if (organicInsertError) {
                                console.error("[Auth Callback] Failed to insert organic user records: ", organicInsertError);
                            }
                        } else {
                            console.error("[Auth Callback] Failed to create workspace: ", wsError);
                        }
                    }
                }
            }

            const forwardedHost = request.headers.get("x-forwarded-host");
            const isLocalEnv = process.env.NODE_ENV === "development";

            if (isLocalEnv) {
                return NextResponse.redirect(`${origin}${next}`);
            } else if (forwardedHost) {
                return NextResponse.redirect(`https://${forwardedHost}${next}`);
            } else {
                return NextResponse.redirect(`${origin}${next}`);
            }
        }
    }

    // If error or no code, redirect to login with error
    return NextResponse.redirect(`${origin}/login?error=auth_callback_error`);
}
