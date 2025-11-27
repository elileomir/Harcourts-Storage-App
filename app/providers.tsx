'use client'

import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from '@tanstack/react-query'
import { useState } from 'react'
import { AuthProvider } from '@/components/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                // Consider data fresh for 30 seconds to prevent immediate refetches
                // This prevents endless loading when tokens are being refreshed
                // 30 seconds is well below the typical 1-hour token expiry
                staleTime: 30000, // 30 seconds
                retry: (failureCount, error: unknown) => {
                    // Don't retry on 401s or auth errors
                    const err = error as { status?: number; code?: string; message?: string }
                    if (err?.status === 401 || err?.code === 'PGRST301' || err?.message?.includes('JWT')) return false
                    return failureCount < 3
                },
                // Add refetch on window focus to recover from stale connections
                refetchOnWindowFocus: true,
                // Add refetch on reconnect to recover from network issues
                refetchOnReconnect: true,
            }
        },
        queryCache: new QueryCache({
            onError: (error: unknown) => {
                const err = error as { status?: number; code?: string; message?: string }
                if (err?.status === 401 || err?.code === 'PGRST301' || err?.message?.includes('JWT')) {
                    // Don't redirect if user is on set-password page (invite flow)
                    if (window.location.pathname === '/set-password') return

                    toast.error('Session expired. Please login again.')
                    router.push('/login')
                }
            }
        }),
        mutationCache: new MutationCache({
            onError: (error: unknown) => {
                const err = error as { status?: number; code?: string; message?: string }
                if (err?.status === 401 || err?.code === 'PGRST301' || err?.message?.includes('JWT')) {
                    // Don't redirect if user is on set-password page (invite flow)
                    if (window.location.pathname === '/set-password') return

                    toast.error('Session expired. Please login again.')
                    router.push('/login')
                }
            }
        })
    }))

    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </QueryClientProvider>
    )
}
