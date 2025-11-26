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
                retry: (failureCount, error: any) => {
                    // Don't retry on 401s or auth errors
                    if (error?.status === 401 || error?.code === 'PGRST301' || error?.message?.includes('JWT')) return false
                    return failureCount < 3
                }
            }
        },
        queryCache: new QueryCache({
            onError: (error: any) => {
                if (error?.status === 401 || error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
                    // Only toast if we haven't already (optional, but good for UX)
                    toast.error('Session expired. Please login again.')
                    router.push('/login')
                }
            }
        }),
        mutationCache: new MutationCache({
            onError: (error: any) => {
                if (error?.status === 401 || error?.code === 'PGRST301' || error?.message?.includes('JWT')) {
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
