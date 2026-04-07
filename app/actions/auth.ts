'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// NOTE: This client uses the SERVICE_ROLE_KEY to bypass RLS and manage users.
// This key must be set in .env.local for these actions to work.
// Lazy initialization prevents build-time crash when env vars are placeholders.
let _supabaseAdmin: ReturnType<typeof createClient> | null = null;
function getSupabaseAdmin() {
    if (!_supabaseAdmin) {
        _supabaseAdmin = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://placeholder.local',
            process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-key',
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            }
        );
    }
    return _supabaseAdmin;
}

export async function inviteUser(email: string, role: string = 'user') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Service Role Key is missing. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local' }
    }

    try {
        // Invite user - Supabase will use hash-based tokens by default
        const { data, error } = await getSupabaseAdmin().auth.admin.inviteUserByEmail(email, {
            data: {
                role: role
            }
        })
        if (error) throw error

        // Create profile with selected role
        if (data.user) {
            // Upsert profile with role
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: profileError } = await (getSupabaseAdmin() as any)
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    role: role
                }, {
                    onConflict: 'id'
                })

            if (profileError) {
                console.error('Error creating profile:', profileError)
            }
        }

        revalidatePath('/dashboard/users')
        return { success: true, data }
    } catch (error: unknown) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
}

export async function listUsers() {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        // Fallback: Return empty list or error if key is missing
        console.error('Service Role Key is missing.')
        return []
    }

    try {
        // Get users from auth
        const { data: { users }, error } = await getSupabaseAdmin().auth.admin.listUsers()
        if (error) throw error

        // Get roles from profiles table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profiles, error: profileError } = await (getSupabaseAdmin() as any)
            .from('profiles')
            .select('id, role')

        if (profileError) {
            console.error('Error fetching profiles:', profileError)
        }

        // Map users with their roles from profiles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const usersWithRoles = users.map((user: any) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const profile = profiles?.find((p: any) => p.id === user.id)
            return {
                id: user.id,
                email: user.email,
                role: profile?.role || user.user_metadata?.role || 'user',
                created_at: user.created_at
            }
        })

        return usersWithRoles
    } catch (error) {
        console.error('Error listing users:', error)
        return []
    }
}

export async function deleteUser(userId: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Service Role Key is missing.' }
    }

    try {
        // Delete from profiles table first
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (getSupabaseAdmin() as any)
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('Error deleting profile:', profileError)
            // Continue anyway to delete auth user
        }

        // Delete from auth
        const { error } = await getSupabaseAdmin().auth.admin.deleteUser(userId)
        if (error) throw error

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error: unknown) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
}

export async function updateUserRole(userId: string, role: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Service Role Key is missing.' }
    }

    try {
        // Update user metadata
        const { error: authError } = await getSupabaseAdmin().auth.admin.updateUserById(userId, {
            user_metadata: { role }
        })
        if (authError) throw authError

        // Update profiles table
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (getSupabaseAdmin() as any)
            .from('profiles')
            .update({ role })
            .eq('id', userId)

        if (profileError) throw profileError

        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error: unknown) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
}
