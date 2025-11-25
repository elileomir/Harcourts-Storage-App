'use client'

import { useAnalytics } from '@/hooks/use-analytics'
import { AnalyticsCards } from '@/components/features/analytics/analytics-cards'
import { CallLogsTable } from '@/components/features/analytics/call-logs-table'
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
    const { calls, stats, isLoading } = useAnalytics()

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Call Analytics</h1>
            <AnalyticsCards stats={stats} />
            <h2 className="text-xl font-semibold text-foreground">Call Logs</h2>
            <CallLogsTable calls={calls || []} />
        </div>
    )
}
