'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { usePlatformSettings } from '@/hooks/use-platform-settings'
import { useState, useEffect } from 'react'
import { Loader2, Save, TriangleAlert } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function AdminSettingsPage() {
    const { settings, isLoading, updateSetting } = usePlatformSettings()
    const [formData, setFormData] = useState<Record<string, string>>({})
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    useEffect(() => {
        if (settings) {
            const newFormData: Record<string, string> = {}
            settings.forEach(s => {
                newFormData[s.setting_key] = s.setting_value
            })
            setFormData(newFormData)
        }
    }, [settings])

    const handleSave = async () => {
        setSaving(true)
        setMessage(null)
        try {
            // Update all changed settings
            const promises = Object.entries(formData).map(([key, value]) => {
                const original = settings?.find(s => s.setting_key === key)
                if (original && original.setting_value !== value) {
                    return updateSetting.mutateAsync({ key, value })
                }
                return Promise.resolve()
            })

            await Promise.all(promises)
            setMessage({ type: 'success', text: 'Settings updated successfully' })
        } catch (error) {
            console.error('Failed to save settings:', error)
            setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
        } finally {
            setSaving(false)
        }
    }

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-[#003366]" /></div>
    }

    // Simple role check (can be enhanced with actual role data if available)
    // For now, we assume if they can access this route, they are authorized, 
    // or we show a warning.

    return (
        <div className="space-y-6 max-w-4xl mx-auto pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[#003366]">Platform Settings</h1>
                    <p className="text-muted-foreground mt-1">
                        Configure global application settings and ROI parameters.
                    </p>
                </div>
            </div>

            <Alert variant="default" className="bg-blue-50 border-blue-200">
                <TriangleAlert className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Admin Area</AlertTitle>
                <AlertDescription className="text-blue-700">
                    These settings affect ROI calculations across the entire dashboard. Changes apply immediately.
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>ROI & Cost Configuration</CardTitle>
                    <CardDescription>
                        Set the base costs for the AI platform to calculate accurate ROI.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="platform_monthly_cost">Monthly Platform Cost ($)</Label>
                            <Input
                                id="platform_monthly_cost"
                                type="number"
                                value={formData['platform_monthly_cost'] || ''}
                                onChange={e => setFormData({ ...formData, 'platform_monthly_cost': e.target.value })}
                                placeholder="20"
                            />
                            <p className="text-xs text-muted-foreground">
                                The fixed monthly subscription cost for the AI platform (e.g., ElevenLabs).
                            </p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="platform_monthly_credits">Monthly Credits Included</Label>
                            <Input
                                id="platform_monthly_credits"
                                type="number"
                                value={formData['platform_monthly_credits'] || ''}
                                onChange={e => setFormData({ ...formData, 'platform_monthly_credits': e.target.value })}
                                placeholder="100000"
                            />
                            <p className="text-xs text-muted-foreground">
                                Total credits provided in the monthly plan. Used to calculate cost per credit.
                            </p>
                        </div>
                    </div>

                    <div className="pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <span className="font-medium">Calculated Cost per Credit: </span>
                                <span className="text-muted-foreground">
                                    ${((parseFloat(formData['platform_monthly_cost'] || '0') / parseFloat(formData['platform_monthly_credits'] || '1')) || 0).toFixed(5)}
                                </span>
                            </div>
                            <Button onClick={handleSave} disabled={saving} className="bg-[#003366]">
                                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </Button>
                        </div>
                        {message && (
                            <p className={`text-sm mt-2 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                {message.text}
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
