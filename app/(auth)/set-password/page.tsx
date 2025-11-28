'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SetPasswordPage() {
    const router = useRouter()
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = createClient()

    // Process invite hash tokens if present, otherwise verify existing session
    useEffect(() => {
        const processInviteOrSession = async () => {
            try {
                const hash = window.location.hash

                // Check if this is an invite with hash tokens
                if (hash.includes('access_token')) {
                    const hashParams = new URLSearchParams(hash.substring(1))
                    const accessToken = hashParams.get('access_token')
                    const refreshToken = hashParams.get('refresh_token')

                    if (accessToken && refreshToken) {
                        // Set session from hash tokens
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })

                        if (error) {
                            // Common error: token already used or expired
                            if (error.message.includes('already') || error.message.includes('expired')) {
                                // Check if we have a valid session anyway (cookies might have been set)
                                const { data: { session } } = await supabase.auth.getSession()
                                if (session) {
                                    console.log('[SetPassword] Hash token already used, but session exists')
                                    setError('')
                                } else {
                                    setError('This invite link has expired or has already been used. Please request a new invitation from your administrator.')
                                }
                            } else {
                                setError(`Failed to establish session: ${error.message}`)
                            }
                        } else {
                            console.log('[SetPassword] Session established from hash tokens')
                            setError('')
                        }
                        return
                    }
                }

                // No hash tokens, check for existing session (user may have already established session)
                // The callback route exchanges the code server-side, but we need to wait for cookies to propagate
                console.log('[SetPassword] No hash tokens, checking for session from callback...')

                // Retry logic: wait for session to be available (callback sets it server-side)
                let session = null
                let retries = 3

                while (retries > 0 && !session) {
                    const { data } = await supabase.auth.getSession()
                    session = data.session

                    if (!session) {
                        console.log(`[SetPassword] No session yet, retrying... (${retries} attempts left)`)
                        await new Promise(resolve => setTimeout(resolve, 500)) // Wait 500ms
                        retries--
                    } else {
                        console.log('[SetPassword] Session found after retry!')
                    }
                }

                if (!session) {
                    console.error('[SetPassword] No session found after retries')
                    setError('This page requires an active invite link. If your invite link has expired, please request a new one from your administrator.')
                    setTimeout(() => router.push('/login'), 3000)
                } else {
                    console.log('[SetPassword] Existing session found, proceeding')
                    setError('')
                }
            } catch (err) {
                console.error('Error processing invite or session:', err)
                setError('Failed to verify session')
            }
        }

        processInviteOrSession()
    }, [router]) // supabase client is stable and doesn't need to be in deps

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
            console.log('[SetPassword] Updating password...')

            // Update password - fire and forget, redirect immediately
            supabase.auth.updateUser({ password: password }).then(({ error: updateError }) => {
                if (updateError) {
                    console.error('[SetPassword] Password update error:', updateError)
                }
            })

            // Redirect immediately without waiting
            console.log('[SetPassword] Redirecting to dashboard...')
            setTimeout(() => {
                window.location.replace('/dashboard')
            }, 500)

        } catch (err) {
            console.error('[SetPassword] Error in handleSubmit:', err)
            setError(err instanceof Error ? err.message : 'Failed to set password')
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
