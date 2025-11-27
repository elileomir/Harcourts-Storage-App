import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const type = requestUrl.searchParams.get('type')
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    if (code) {
        const supabase = await createClient()
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            // Check if this is an invite
            if (type === 'invite') {
                // Redirect to set-password page for invited users
                return NextResponse.redirect(new URL('/set-password', request.url))
            }

            // Regular auth flow (e.g., email confirmation, password reset)
            return NextResponse.redirect(new URL(next, request.url))
        }
    }

    // Default: check if user is authenticated
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.redirect(new URL('/login', request.url))
}
