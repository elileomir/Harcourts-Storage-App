import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { EmailOtpType } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') ?? '/dashboard'

    console.log('[Callback] Processing auth callback:', { type, hasTokenHash: !!token_hash })

    if (token_hash && type) {
        const cookieStore = await cookies()

        // Create supabase client with proper cookie handling for redirects
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        )
                    },
                },
            }
        )

        // Use verifyOtp for email-based auth (invites, magic links, etc.)
        const { data, error } = await supabase.auth.verifyOtp({
            token_hash,
            type: type as EmailOtpType
        })

        console.log('[Callback] OTP verification result:', {
            hasSession: !!data.session,
            hasUser: !!data.user,
            error: error?.message
        })

        if (!error && data.session) {
            // Create response with redirect
            let redirectUrl: URL

            // Check if this is an invite
            if (type === 'invite') {
                console.log('[Callback] Invite verified, redirecting to set-password')
                redirectUrl = new URL('/set-password', request.url)
            }
            // Check if this is a password reset
            else if (type === 'recovery') {
                console.log('[Callback] Password reset verified, redirecting to reset-password')
                redirectUrl = new URL('/reset-password', request.url)
            }
            // Regular auth flow (e.g., magic link, email confirmation)
            else {
                console.log('[Callback] Auth verified, redirecting to:', next)
                redirectUrl = new URL(next, request.url)
            }

            // Return redirect response - cookies are already set by createServerClient
            return NextResponse.redirect(redirectUrl)
        }

        // If verification failed
        console.error('[Callback] OTP verification failed:', error?.message)

        if (type === 'invite') {
            const setPasswordUrl = new URL('/set-password', request.url)
            setPasswordUrl.searchParams.set('error', 'verification_failed')
            setPasswordUrl.searchParams.set('error_description', error?.message || 'Invalid or expired invite link')
            return NextResponse.redirect(setPasswordUrl)
        }
    }

    // Default: check if user is authenticated
    const cookieStore = await cookies()
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) =>
                        cookieStore.set(name, value, options)
                    )
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    console.log('[Callback] No token_hash or verification failed, checking user:', { hasUser: !!user, type })

    if (user) {
        if (type === 'invite') {
            console.log('[Callback] User already authenticated with invite type, redirecting to set-password')
            return NextResponse.redirect(new URL('/set-password', request.url))
        }
        return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // No valid session, redirect to login
    const loginUrl = new URL('/login', request.url)
    if (type) {
        loginUrl.searchParams.set('type', type)
    }
    console.log('[Callback] No user, redirecting to login')
    return NextResponse.redirect(loginUrl)
}
