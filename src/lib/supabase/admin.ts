import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Note: SUPABASE_SERVICE_ROLE_KEY is required for the admin client.
// This client bypasses Row Level Security (RLS). Never expose it to the frontend.
export const createAdminClient = () => {
    return createClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY || "",
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    );
};
