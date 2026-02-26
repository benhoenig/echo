import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

async function main() {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log("Signing in...");
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'benhoenig@gmail.com',
        password: 'ben0836221ben',
    });

    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    console.log("User UID:", authData.user.id);

    console.log("Querying public.users...");
    const { data, error } = await supabase
        .from('users')
        .select('*, workspaces(*)')
        .eq('id', authData.user.id)
        .single();

    console.log("Query result:", JSON.stringify({ data, error }, null, 2));
}

main();
