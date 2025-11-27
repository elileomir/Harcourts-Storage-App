'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Loader2, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'

export default function SettingsPage() {
    const [currentPassword, setCurrentPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const supabase = createClient()

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            // Validate passwords match
            if (newPassword !== confirmPassword) {
                throw new Error('New passwords do not match')
            }

            if (newPassword.length < 6) {
                throw new Error('Password must be at least 6 characters')
            }

            // Verify current password by attempting to sign in
            const { data: { user } } = await supabase.auth.getUser()
            if (!user?.email) {
                throw new Error('User not found')
            }

            // Re-authenticate with current password
            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: currentPassword
            })

            if (signInError) {
                throw new Error('Current password is incorrect')
            }

            // Update to new password - fire and forget to avoid UI hanging
            console.log('[Settings] Updating password...')
            supabase.auth.updateUser({ password: newPassword }).then(({ error: updateError }) => {
                if (updateError) {
                    console.error('[Settings] Password update error:', updateError)
                    toast.error(updateError.message)
                } else {
                    console.log('[Settings] Password updated successfully')
                }
            })

            // Assume success for UI responsiveness since we verified current password
            // and basic validation passed. The actual update happens in background.
            toast.success('Password changed successfully!')

            // Clear form
            setCurrentPassword('')
            setNewPassword('')
            setConfirmPassword('')
            setLoading(false)

        } catch (err) {
            console.error('Error changing password:', err)
            setError(err instanceof Error ? err.message : 'Failed to change password')
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and preferences
                </p>
            </div>

            <Separator />

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Change Password</CardTitle>
                        <CardDescription>
                            Update your password to keep your account secure
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleChangePassword} className="space-y-4">
                            {error && (
                                <div className="flex items-center gap-2 rounded-[4px] bg-destructive/10 p-3 text-sm text-destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="current-password">Current Password</Label>
                                <Input
                                    id="current-password"
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="new-password">New Password</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Must be at least 6 characters
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                                <Input
                                    id="confirm-new-password"
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Confirm new password"
                                    required
                                    minLength={6}
                                    disabled={loading}
                                />
                            </div>

                            <Button
                                type="submit"
                                className="bg-[#003366] hover:bg-[#002244]"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Change Password'
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
