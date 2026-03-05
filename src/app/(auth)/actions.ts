"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(formData: FormData) {
    const supabase = await createClient();

    const data = {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
    };

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
        return { error: error.message };
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}

export async function signup(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;

    const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
    });

    if (error) {
        return { error: error.message };
    }

    // If user is immediately confirmed (email confirmation disabled),
    // a session is returned. Create their user record and workspace directly
    // since /auth/callback won't be triggered.
    const confirmedUser = signUpData?.user;
    if (confirmedUser && signUpData?.session) {
        const adminClient = createAdminClient();

        // Check if user record already exists (safety check)
        const { data: existingUser } = await adminClient
            .from("users")
            .select("id")
            .eq("id", confirmedUser.id)
            .single();

        if (!existingUser) {
            // Create workspace
            const { data: workspace, error: wsError } = await adminClient
                .from("workspaces")
                .insert({
                    workspace_name: `${firstName}'s Workspace`,
                })
                .select("id")
                .single();

            if (workspace && !wsError) {
                const { error: insertError } = await adminClient.from("users").insert({
                    id: confirmedUser.id,
                    workspace_id: workspace.id,
                    first_name: firstName,
                    last_name: lastName,
                    email: confirmedUser.email || "",
                    role: "OWNER" as any,
                    is_active: true,
                });

                if (insertError) {
                    console.error("[Signup] Failed to insert user record:", insertError);
                }
            } else {
                console.error("[Signup] Failed to create workspace:", wsError);
            }
        }

        revalidatePath("/", "layout");
        redirect("/dashboard");
    }

    revalidatePath("/", "layout");
    redirect("/auth/confirm?email=" + encodeURIComponent(email));
}

export async function forgotPassword(formData: FormData) {
    const supabase = await createClient();

    const email = formData.get("email") as string;

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?next=/reset-password`,
    });

    if (error) {
        return { error: error.message };
    }

    return { success: true };
}

export async function signInWithGoogle() {
    const supabase = await createClient();

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
            redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
            queryParams: {
                access_type: "offline",
                prompt: "consent",
            },
        },
    });

    if (error) {
        return { error: error.message };
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function logout() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    revalidatePath("/", "layout");
    redirect("/login");
}

export async function updatePassword(formData: FormData) {
    const supabase = await createClient();
    const password = formData.get("password") as string;

    const { error } = await supabase.auth.updateUser({
        password: password,
    });

    if (error) {
        redirect("/update-password?error=" + encodeURIComponent(error.message));
    }

    revalidatePath("/", "layout");
    redirect("/dashboard");
}
