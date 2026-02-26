import { createClient } from '@/lib/supabase/server';

async function main() {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.admin.createUser({
        email: 'testuser@example.com',
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { first_name: 'Test', last_name: 'User' },
    });
    if (error) {
        console.error('Error creating test user:', error.message);
    } else {
        console.log('Test user created:', data?.user?.email);
    }
}

main();
