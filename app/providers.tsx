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
                retry: (failureCount, error: unknown) => {
                    // Don't retry on 401s or auth errors
                    const err = error as { status?: number; code?: string; message?: string }
                    if (err?.status === 401 || err?.code === 'PGRST301' || err?.message?.includes('JWT')) return false
                    return failureCount < 3
                }
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
