'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'

type AuthContextType = {
    user: User | null
    session: Session | null
    role: string | null
    isLoading: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const router = useRouter()
    const queryClient = useQueryClient()
    const supabase = createClient()

    useEffect(() => {
        // Check for existing session on mount
        const initializeAuth = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Fetch profile to get role with retry logic
                    let retries = 3
                    while (retries > 0) {
                        const { data: profile, error } = await supabase
                            .from('profiles')
                            .select('role')
                            .eq('id', session.user.id)
                            .single()

                        if (!error && profile) {
                            setRole(profile.role ?? 'user')
                            break
                        }

                        retries--
                        if (retries > 0) {
                            await new Promise(resolve => setTimeout(resolve, 1000))
                        } else {
                            // Fallback to user metadata or default
                            setRole(session.user.user_metadata?.role ?? 'user')
                        }
                    }
                } else {
                    setRole(null)
                }

                setIsLoading(false)
            } catch (error) {
                console.error('Error initializing auth:', error)
                setIsLoading(false)
            }
        }

        initializeAuth()

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log('[AuthProvider] Auth state change:', event)

                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    // Fetch profile to get role
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single()

                    setRole(profile?.role ?? session.user.user_metadata?.role ?? 'user')
                } else {
                    setRole(null)
                }

                // Handle sign-out
                if (event === 'SIGNED_OUT') {
                    const authPages = ['/login', '/set-password', '/auth/callback']
                    const isOnAuthPage = authPages.some(page => window.location.pathname.startsWith(page))

                    if (!isOnAuthPage) {
                        console.log('[AuthProvider] User signed out, redirecting to login')
                        router.push('/login')
                        router.refresh()
                    }
                }

                // Handle password update (invite flow completion)
                if (event === 'USER_UPDATED') {
                    console.log('[AuthProvider] User updated (password set)')
                    // Don't redirect here - let the set-password page handle it
                    // Just ensure session is fresh
                    router.refresh()
                }

                // Handle initial sign-in or successful token refresh
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    console.log('[AuthProvider] Session refreshed/established')

                    // Force re-authentication of all Supabase clients
                    // This ensures real-time channels use the new token
                    if (event === 'TOKEN_REFRESHED' && session) {
                        console.log('[AuthProvider] Token refreshed, invalidating queries and refreshing router')
                        // Invalidate all queries to force refetch with new token
                        queryClient.invalidateQueries()

                        // Trigger a router refresh to update server components
                        router.refresh()
                    }
                }
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [router, supabase, queryClient])

    const signOut = async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            router.push('/login')
            router.refresh() // Force refresh to clear any server component state
        }
    }

    return (
        <AuthContext.Provider value={{ user, session, role, isLoading, signOut }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
