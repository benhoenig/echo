"use server";

import { getCurrentUser } from "@/lib/queries";

export async function getActiveWorkspaceContext() {
    const user = await getCurrentUser();

    if (!user) return null;

    return {
        user: {
            id: user.id,
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
        },
        workspace: user.workspaces,
    };
}
