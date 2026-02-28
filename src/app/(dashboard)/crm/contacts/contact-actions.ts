"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/supabase";
import { logActivity } from "@/lib/activity-logger";

type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];

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

export async function getContacts(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts")
        .select(
            "*, users!contacts_assigned_to_id_fkey(first_name, last_name)"
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", false)
        .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getArchivedContacts(workspaceId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts")
        .select(
            "*, users!contacts_assigned_to_id_fkey(first_name, last_name)"
        )
        .eq("workspace_id", workspaceId)
        .eq("archived", true)
        .order("last_updated_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
}

export async function getContact(id: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("contacts")
        .select(
            "*, users!contacts_assigned_to_id_fkey(id, first_name, last_name)"
        )
        .eq("id", id)
        .single();

    if (error) throw new Error(error.message);

    // Fetch referrer separately to avoid self-referential join issue
    let referrer = null;
    if (data?.referred_by_id) {
        const { data: ref } = await supabase
            .from("contacts")
            .select("id, first_name, last_name, nickname")
            .eq("id", data.referred_by_id)
            .single();
        referrer = ref;
    }

    return { ...data, referrer };
}

export async function createContact(formData: ContactInsert) {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data, error } = await supabase
        .from("contacts")
        .insert({
            ...formData,
            created_by_id: userId,
            last_updated_at: new Date().toISOString(),
            last_updated_by_id: userId,
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    await logActivity({
        workspaceId: data.workspace_id,
        entityType: "CONTACT",
        entityId: data.id,
        actionType: "CREATED",
        actorUserId: userId,
        description: `Created contact ${data.first_name} ${data.last_name}`,
    });

    revalidatePath("/crm/contacts");
    return data;
}

export async function updateContact(
    id: string,
    formData: Record<string, unknown>
): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !current)
        throw new Error(fetchError?.message ?? "Contact not found");

    const updatePayload: Record<string, unknown> = {
        ...formData,
        last_updated_at: new Date().toISOString(),
        last_updated_by_id: userId,
    };

    const { error } = await supabase
        .from("contacts")
        .update(updatePayload)
        .eq("id", id);

    if (error) throw new Error(error.message);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "CONTACT",
        entityId: id,
        actionType: "UPDATED",
        actorUserId: userId,
        description: `Updated contact ${current.first_name} ${current.last_name}`,
        metadata: { fields: Object.keys(formData) },
    });

    revalidatePath("/crm/contacts");
    revalidatePath(`/crm/contacts/${id}`);
}

export async function updateContactField(
    id: string,
    field: string,
    value: unknown
): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("contacts")
        .select("*")
        .eq("id", id)
        .single();

    if (fetchError || !current)
        throw new Error(fetchError?.message ?? "Contact not found");

    const oldValue = current[field as keyof typeof current];

    if (String(oldValue ?? "") === String(value ?? "")) return;

    const updatePayload: Record<string, unknown> = {
        [field]: value,
        last_updated_at: new Date().toISOString(),
        last_updated_by_id: userId,
    };

    const { error } = await supabase
        .from("contacts")
        .update(updatePayload)
        .eq("id", id);

    if (error) throw new Error(error.message);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "CONTACT",
        entityId: id,
        actionType:
            field === "contact_status" ? "STATUS_CHANGED" : "UPDATED",
        actorUserId: userId,
        description: `Updated ${field} from ${oldValue ?? "empty"} to ${value ?? "empty"}`,
        metadata: { field, oldValue, newValue: value },
    });

    revalidatePath("/crm/contacts");
    revalidatePath(`/crm/contacts/${id}`);
}

export async function archiveContact(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("contacts")
        .select("workspace_id, first_name, last_name")
        .eq("id", id)
        .single();

    if (fetchError || !current)
        throw new Error(fetchError?.message ?? "Contact not found");

    const { error } = await supabase
        .from("contacts")
        .update({
            archived: true,
            last_updated_at: new Date().toISOString(),
            last_updated_by_id: userId,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "CONTACT",
        entityId: id,
        actionType: "ARCHIVED",
        actorUserId: userId,
        description: `Archived contact ${current.first_name} ${current.last_name}`,
    });

    revalidatePath("/crm/contacts");
}

export async function restoreContact(id: string): Promise<void> {
    const supabase = await createClient();
    const userId = await getAuthUserId();

    const { data: current, error: fetchError } = await supabase
        .from("contacts")
        .select("workspace_id, first_name, last_name")
        .eq("id", id)
        .single();

    if (fetchError || !current)
        throw new Error(fetchError?.message ?? "Contact not found");

    const { error } = await supabase
        .from("contacts")
        .update({
            archived: false,
            last_updated_at: new Date().toISOString(),
            last_updated_by_id: userId,
        })
        .eq("id", id);

    if (error) throw new Error(error.message);

    await logActivity({
        workspaceId: current.workspace_id,
        entityType: "CONTACT",
        entityId: id,
        actionType: "RESTORED",
        actorUserId: userId,
        description: `Restored contact ${current.first_name} ${current.last_name}`,
    });

    revalidatePath("/crm/contacts");
}

/**
 * Check for duplicate contacts by phone, email, or name+phone combo.
 * Returns matching contacts if any exist.
 */
export async function checkDuplicateContacts(
    workspaceId: string,
    phone?: string | null,
    email?: string | null,
    firstName?: string,
    lastName?: string
) {
    const supabase = await createClient();
    const duplicates: Array<{
        id: string;
        first_name: string;
        last_name: string;
        nickname: string | null;
        phone_primary: string | null;
        email: string | null;
        match_reason: string;
    }> = [];

    // Check phone match
    if (phone) {
        const { data } = await supabase
            .from("contacts")
            .select("id, first_name, last_name, nickname, phone_primary, email")
            .eq("workspace_id", workspaceId)
            .eq("archived", false)
            .eq("phone_primary", phone);

        if (data?.length) {
            duplicates.push(
                ...data.map((c) => ({ ...c, match_reason: "Phone number match" }))
            );
        }
    }

    // Check email match
    if (email) {
        const { data } = await supabase
            .from("contacts")
            .select("id, first_name, last_name, nickname, phone_primary, email")
            .eq("workspace_id", workspaceId)
            .eq("archived", false)
            .eq("email", email);

        if (data?.length) {
            const existing = new Set(duplicates.map((d) => d.id));
            duplicates.push(
                ...data
                    .filter((c) => !existing.has(c.id))
                    .map((c) => ({ ...c, match_reason: "Email match" }))
            );
        }
    }

    return duplicates;
}
