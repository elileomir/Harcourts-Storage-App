'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'

export default function SetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = createClient()

    // Verify user has an active session (with retry for invitation flow)
    useEffect(() => {
        let retries = 5
        let timeoutId: NodeJS.Timeout

        const checkSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    // Session found, clear any errors
                    setError('')
                    return
                }

                // No session yet, retry if we have attempts left
                retries--
                if (retries > 0) {
                    timeoutId = setTimeout(checkSession, 1000) // Retry after 1 second
                } else {
                    // Out of retries, show error and redirect
                    setError('Session expired or invalid. Redirecting to login...')
                    setTimeout(() => router.push('/login'), 2000)
                }
            } catch (err) {
                console.error('Error checking session:', err)
                setError('Failed to verify session')
            }
        }

        // Start checking after a brief delay to allow callback to process
        timeoutId = setTimeout(checkSession, 500)

        return () => {
            if (timeoutId) clearTimeout(timeoutId)
        }
    }, [router, supabase])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirmPassword) {
            setError('Passwords do not match')
            return
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters')
            return
        }

        setLoading(true)

        try {
            const { error } = await supabase.auth.updateUser({
                password: password
            })

            if (error) throw error

            router.push('/dashboard')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-8 rounded-lg bg-card p-8 shadow-md">
                <div>
                    <h2 className="text-2xl font-bold text-primary">Set Your Password</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Welcome to Harcourts Admin! Please set your password to continue.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm Password</Label>
                        <Input
                            id="confirm-password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                            required
                            minLength={6}
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#003366] hover:bg-[#002244]"
                    >
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Set Password & Continue
                    </Button>
                </form>
            </div>
        </div>
    )
}
