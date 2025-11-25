'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// NOTE: This client uses the SERVICE_ROLE_KEY to bypass RLS and manage users.
// This key must be set in .env.local for these actions to work.
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)

export async function inviteUser(email: string, role: string = 'user') {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Service Role Key is missing. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local' }
    }

    try {
        // Get app domain from platform settings
        const { data: settings } = await supabaseAdmin
            .from('platform_settings')
            .select('setting_value')
            .eq('setting_key', 'app_domain')
            .single()

        const appDomain = settings?.setting_value || 'https://harcourtsstorageapp.netlify.app'
        const redirectUrl = `${appDomain}/auth/callback?type=invite`

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl,
            data: {
                role: role
            }
        })
        if (error) throw error

        // Create profile with selected role
        if (data.user) {
            // Upsert profile with role
            const { error: profileError } = await supabaseAdmin
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    role: role,
                    updated_at: new Date().toISOString()
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
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw error

        // Get roles from profiles table
        const { data: profiles, error: profileError } = await supabaseAdmin
            .from('profiles')
            .select('id, role')

        if (profileError) {
            console.error('Error fetching profiles:', profileError)
        }

        // Map users with their roles from profiles
        const usersWithRoles = users.map(user => {
            const profile = profiles?.find(p => p.id === user.id)
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
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .delete()
            .eq('id', userId)

        if (profileError) {
            console.error('Error deleting profile:', profileError)
            // Continue anyway to delete auth user
        }

        // Delete from auth
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
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
        const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
            user_metadata: { role }
        })
        if (authError) throw authError

        // Update profiles table
        const { error: profileError } = await supabaseAdmin
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
