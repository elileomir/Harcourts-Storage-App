import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const type = requestUrl.searchParams.get('type')

    // Handle invite acceptance
    if (type === 'invite') {
        return NextResponse.redirect(new URL('/set-password', request.url))
    }

    // Default: redirect to dashboard
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    return NextResponse.redirect(new URL('/login', request.url))
}
