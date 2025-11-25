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

export async function inviteUser(email: string) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return { error: 'Service Role Key is missing. Please add SUPABASE_SERVICE_ROLE_KEY to .env.local' }
    }

    try {
        // Redirect to auth callback which will handle the invite flow
        const redirectUrl = process.env.NODE_ENV === 'production'
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/callback?type=invite`
            : 'http://localhost:3000/auth/callback?type=invite'

        const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
            redirectTo: redirectUrl
        })
        if (error) throw error
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
        const { data: { users }, error } = await supabaseAdmin.auth.admin.listUsers()
        if (error) throw error
        return users
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
        const { error } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (error) throw error
        revalidatePath('/dashboard/users')
        return { success: true }
    } catch (error: unknown) {
        return { error: error instanceof Error ? error.message : 'An unknown error occurred' }
    }
}
