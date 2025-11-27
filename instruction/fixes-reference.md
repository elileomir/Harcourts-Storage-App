# Supabase + Next.js: Bug Fixes & Code Patterns

## Quick Reference for Common Issues

---

## ISSUE #1: DATABASE CONNECTION INSTABILITY & INFINITE LOADING

### Problem Pattern
```
User logs in → Works fine for few minutes → After idle/inactivity → 
Data requests hang forever → Page shows endless "Loading..."
→ Only fixes by clearing cache + hard refresh
```

### Root Causes (In Order of Likelihood)

1. **Session Token Expired** - No automatic token refresh
2. **Real-time Channels Disconnected** - Channels close on browser background
3. **Supabase Client Re-initialization** - New client instance created, dropping connection
4. **React Query Stale Cache** - Data stuck in "loading" state
5. **Middleware Session Validation Failing** - Request bounced by middleware

---

## Fix #1: Implement Session Auto-Refresh Hook

### Code Pattern: SessionRefreshProvider

```typescript
// lib/hooks/useSessionRefresh.ts
import { useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'

export function useSessionRefresh() {
  const supabase = createClient()
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const refreshSession = async () => {
      const { data: session } = await supabase.auth.getSession()
      
      if (session?.session) {
        // This silently refreshes the token if needed
        await supabase.auth.refreshSession()
        
        // CRITICAL: Update real-time auth with new token
        const { data } = await supabase.auth.getSession()
        if (data.session?.access_token) {
          supabase.realtime.setAuth(data.session.access_token)
        }
      }
    }

    // Refresh every 2 minutes when user is active
    refreshIntervalRef.current = setInterval(refreshSession, 2 * 60 * 1000)

    // Also refresh on visibility change (tab becomes active)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        await refreshSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current)
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [supabase])
}
```

### Implementation: Use in Root Layout

```typescript
// app/layout.tsx
'use client'

import { useSessionRefresh } from '@/lib/hooks/useSessionRefresh'

export default function RootLayout({ children }) {
  useSessionRefresh() // Add this

  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

---

## Fix #2: Real-time Channel Error Recovery

### Code Pattern: Resilient Real-time Subscription

```typescript
// lib/hooks/useRealtimeSubscription.ts
import { useEffect, useRef, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

interface UseRealtimeSubscriptionOptions {
  table: string
  schema?: string
  onUpdate?: (payload: any) => void
  onError?: (error: any) => void
}

export function useRealtimeSubscription({
  table,
  schema = 'public',
  onUpdate,
  onError,
}: UseRealtimeSubscriptionOptions) {
  const supabase = createClient()
  const subscriptionRef = useRef<RealtimeChannel | null>(null)
  const reconnectAttemptsRef = useRef(0)
  const maxReconnectAttemptsRef = useRef(5)

  const setupSubscription = useCallback(async () => {
    try {
      // Clean up old subscription
      if (subscriptionRef.current) {
        await supabase.removeChannel(subscriptionRef.current)
      }

      // Create new subscription
      subscriptionRef.current = supabase
        .channel(`${schema}:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema,
            table,
          },
          (payload) => {
            console.log('Real-time update:', payload)
            onUpdate?.(payload)
            reconnectAttemptsRef.current = 0 // Reset on successful update
          }
        )
        .on('system', {}, (payload) => {
          console.log('System message:', payload.message)
        })
        .subscribe((status) => {
          console.log('Subscription status:', status)

          if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
            reconnectAttemptsRef.current++
            
            if (reconnectAttemptsRef.current < maxReconnectAttemptsRef.current) {
              // Exponential backoff: 1s, 2s, 4s, 8s, 16s
              const delay = Math.pow(2, reconnectAttemptsRef.current - 1) * 1000
              console.log(
                `Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`
              )
              
              setTimeout(() => {
                // Refresh token before reconnecting
                supabase.auth.refreshSession().then(() => setupSubscription())
              }, delay)
            } else {
              onError?.(
                new Error('Max reconnection attempts reached')
              )
            }
          }
        })

      reconnectAttemptsRef.current = 0
    } catch (error) {
      console.error('Failed to setup subscription:', error)
      onError?.(error)
    }
  }, [supabase, table, schema, onUpdate, onError])

  // Initial setup
  useEffect(() => {
    setupSubscription()

    // Handle visibility changes
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        console.log('Tab became visible, ensuring subscription is active')
        // Refresh token and reconnect
        await supabase.auth.refreshSession()
        await setupSubscription()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current)
      }
    }
  }, [setupSubscription, supabase])
}
```

### Usage Example

```typescript
// components/DataTable.tsx
'use client'

import { useRealtimeSubscription } from '@/lib/hooks/useRealtimeSubscription'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/utils/supabase/client'

export function DataTable() {
  const supabase = createClient()

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('items')
        .select('*')

      if (error) throw error
      return data
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  })

  // Real-time updates
  useRealtimeSubscription({
    table: 'items',
    onUpdate: () => refetch(),
    onError: (error) => console.error('Real-time error:', error),
  })

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {data?.map((item) => (
        <div key={item.id}>{item.name}</div>
      ))}
    </div>
  )
}
```

---

## Fix #3: React Query Configuration for Stability

### Code Pattern: Optimized Query Client Setup

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query'

export const createQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is fresh for 5 minutes
        staleTime: 5 * 60 * 1000,
        
        // Keep cache for 10 minutes before garbage collection
        gcTime: 10 * 60 * 1000,
        
        // Retry failed requests 3 times with exponential backoff
        retry: 3,
        retryDelay: (attemptIndex) => {
          return Math.min(1000 * 2 ** attemptIndex, 30000)
        },
        
        // Don't automatically refetch on window focus during idle
        refetchOnWindowFocus: 'stale',
        
        // Don't refetch when reconnecting (we handle it manually)
        refetchOnReconnect: false,
        
        // Don't refetch when component remounts if still fresh
        refetchOnMount: 'stale',
      },
      mutations: {
        retry: 1,
        retryDelay: 1000,
      },
    },
  })
}
```

### Use in App

```typescript
// app/providers.tsx
'use client'

import { QueryClientProvider } from '@tanstack/react-query'
import { createQueryClient } from '@/lib/queryClient'

const queryClient = createQueryClient()

export function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

---

## ISSUE #2: INVITATION FLOW REDIRECT LOOP

### Problem Pattern
```
Admin invites user → User receives email → Clicks link → 
Redirected to /login instead of password setup → 
OR password setup redirects back to /login → 
Infinite loop of refreshes
```

### Root Causes (In Order of Likelihood)

1. **Email Template Points to Wrong URL** - Template has localhost or old production URL
2. **Middleware Redirects to Login Prematurely** - Checks `user` before invite-setup complete
3. **Race Condition in Callback** - Redirects before session is established
4. **Missing Invite State Handling** - No distinction between regular users and invited users
5. **Password Change Not Invalidating Session** - User redirected but session not updated

---

## Fix #1: Fix Email Templates

### Check & Update Email Templates

**Location:** Supabase Dashboard → Authentication → Email Templates

**Current Template (Likely Broken):**
```html
<h2>Confirm your email</h2>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email_change">Confirm email change</a></p>
```

**Fixed Template:**
```html
<h2>Complete your account setup</h2>
<p><a href="https://harcourtsstorageapp.netlify.app/auth/confirm?token_hash={{ .TokenHash }}&type=signup">Set up your password</a></p>
```

**Key Changes:**
- Replace `{{ .SiteURL }}` with actual production URL
- Use correct `type=signup` for invite confirmations
- Remove any localhost references

**All Templates to Check:**
1. Confirmation email template
2. Invite email template
3. Magic link template
4. Password reset template

---

## Fix #2: Update Auth Callback Route

### Code Pattern: Robust Callback Handler

```typescript
// app/auth/callback/route.ts
import { type EmailOtpType } from '@supabase/supabase-js'
import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  
  const code = searchParams.get('code')
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null
  const next = searchParams.get('next') ?? '/'

  console.log('Auth callback:', { code, token_hash, type, next })

  // Case 1: OAuth callback (code exchange)
  if (code) {
    try {
      const supabase = await createClient()
      
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error('Code exchange failed:', error)
        return NextResponse.redirect(
          `${origin}/login?message=Authentication failed: ${error.message}`
        )
      }

      // Wait for session to be established
      const { data: session } = await supabase.auth.getSession()
      
      if (!session.session) {
        console.error('Session not established after code exchange')
        return NextResponse.redirect(
          `${origin}/login?message=Session creation failed`
        )
      }

      console.log('Code exchange successful, redirecting to:', next)
      
      // Redirect to destination
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('Code exchange error:', error)
      return NextResponse.redirect(
        `${origin}/login?message=An error occurred during authentication`
      )
    }
  }

  // Case 2: Email OTP callback (email link)
  if (token_hash) {
    try {
      const supabase = await createClient()

      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type: type || 'signup',
      })

      if (error) {
        console.error('OTP verification failed:', error)
        return NextResponse.redirect(
          `${origin}/login?message=Link verification failed: ${error.message}`
        )
      }

      // For signup OTP, redirect to password setup (not dashboard)
      if (type === 'signup') {
        console.log('Signup OTP verified, redirecting to password setup')
        return NextResponse.redirect(`${origin}/auth/setup-password`)
      }

      // For other types, redirect to dashboard
      console.log('OTP verified, redirecting to dashboard')
      return NextResponse.redirect(`${origin}${next}`)
    } catch (error) {
      console.error('OTP verification error:', error)
      return NextResponse.redirect(
        `${origin}/login?message=Verification failed`
      )
    }
  }

  // No code or token found
  console.warn('No auth code or token in callback')
  return NextResponse.redirect(
    `${origin}/login?message=Invalid authentication link`
  )
}
```

---

## Fix #3: Add Invite State Handling in Middleware

### Code Pattern: Invite-Aware Middleware

```typescript
// middleware.ts
import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

const publicPages = ['/login', '/signup', '/auth/callback', '/auth/setup-password']
const protectedPages = ['/dashboard', '/storage', '/profile']

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  const { data: { session }, error } = await supabase.auth.getSession()

  const path = request.nextUrl.pathname

  // Allow public pages without session
  if (publicPages.some((page) => path.startsWith(page))) {
    return res
  }

  // Check if user is setting up password (invited user)
  if (path.startsWith('/auth/setup-password')) {
    // Require OTP verification but not full session
    // This allows invited users to set password
    return res
  }

  // Protected pages require full session
  if (protectedPages.some((page) => path.startsWith(page))) {
    if (!session) {
      // Redirect to login, but save the requested page
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('next', path)
      return NextResponse.redirect(loginUrl)
    }

    // Check if user has completed setup (has password)
    const { data: profile } = await supabase
      .from('profiles')
      .select('setup_completed')
      .eq('id', session.user.id)
      .single()

    if (!profile?.setup_completed) {
      // User hasn't completed setup yet
      return NextResponse.redirect(new URL('/auth/setup-password', request.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}
```

---

## Fix #4: Create Password Setup Page

### Code Pattern: Guided Password Setup

```typescript
// app/auth/setup-password/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function SetupPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      })

      if (updateError) {
        setError(updateError.message)
        return
      }

      // Mark profile as setup complete
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ setup_completed: true })
          .eq('id', user.id)
      }

      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Set your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Complete your account setup
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm Password"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Setting up...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
```

---

## Debugging Commands

### For Connection Issues:

```javascript
// Run in browser console
// Check session
const { data } = await supabase.auth.getSession()
console.log('Session:', data.session)

// Check real-time status
console.log('Realtime channels:', supabase.getChannels())

// Force refresh
await supabase.auth.refreshSession()

// Check if connected
await fetch(SUPABASE_URL + '/rest/v1/', {
  headers: { 'apikey': SUPABASE_ANON_KEY }
})
```

### For Invite Issues:

```javascript
// Check auth state
const { data: { user } } = await supabase.auth.getUser()
console.log('Current user:', user)

// Verify token
const { data } = await supabase.auth.getSession()
console.log('Token:', data.session?.access_token)

// Check email templates
// Go to Supabase Dashboard → Authentication → Email Templates
```

---

## Verification Checklist After Fixes

### Issue #1 - Connection Stability
- [ ] Open app, login
- [ ] Wait 5 minutes without interaction
- [ ] Click a link → Data loads without page refresh
- [ ] Check console for no auth errors
- [ ] Real-time updates work after idle
- [ ] Multiple browser tabs stay in sync

### Issue #2 - Invite Flow  
- [ ] Admin sends invite from app
- [ ] Invited user receives email
- [ ] Click link in email
- [ ] Routed to password setup page (not login)
- [ ] Set password, submit
- [ ] Routed to dashboard (not login)
- [ ] User can access all features
- [ ] No refresh loops or redirects