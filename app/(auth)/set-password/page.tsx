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

    // Process invite tokens - query params, hash tokens, or existing session
    useEffect(() => {
        const processInviteOrSession = async () => {
            try {
                // FIRST: Check for query parameter tokens (from callback redirect on Netlify)
                const urlParams = new URLSearchParams(window.location.search)
                const tokenHash = urlParams.get('token_hash')
                const type = urlParams.get('type')

                if (tokenHash && type === 'invite') {
                    console.log('[SetPassword] Found query parameter token, verifying...')

                    const { data, error } = await supabase.auth.verifyOtp({
                        token_hash: tokenHash,
                        type: 'invite'
                    })

                    if (error) {
                        console.error('[SetPassword] Token verification error:', error)
                        setError('Invalid or expired invite link. Please request a new one from your administrator.')
                        setTimeout(() => router.push('/login'), 3000)
                        return
                    }

                    if (data.session) {
                        console.log('[SetPassword] Session established from query token!')
                        setError('')
                        return
                    }
                }

                // SECOND: Check if this is an invite with hash tokens
                const hash = window.location.hash
                if (hash.includes('access_token')) {
                    console.log('[SetPassword] Found hash tokens, setting session...')
                    const hashParams = new URLSearchParams(hash.substring(1))
                    const accessToken = hashParams.get('access_token')
                    const refreshToken = hashParams.get('refresh_token')

                    if (accessToken && refreshToken) {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })

                        if (error) {
                            if (error.message.includes('already') || error.message.includes('expired')) {
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

                // THIRD: No tokens, check for existing session (from server-side callback)
                console.log('[SetPassword] No tokens, checking for session from callback...')

                let session = null
                let retries = 3

                while (retries > 0 && !session) {
                    const { data } = await supabase.auth.getSession()
                    session = data.session

                    if (!session) {
                        console.log(`[SetPassword] No session yet, retrying... (${retries} attempts left)`)
                        await new Promise(resolve => setTimeout(resolve, 500))
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
    }, [router])

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

            supabase.auth.updateUser({ password: password }).then(({ error: updateError }) => {
                if (updateError) {
                    console.error('[SetPassword] Password update error:', updateError)
                }
            })

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
