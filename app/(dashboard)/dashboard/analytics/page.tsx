'use client'

import { useState } from 'react'
import { useAnalytics } from '@/hooks/use-analytics'
import { AnalyticsCards } from '@/components/features/analytics/analytics-cards'
import { CallLogsTable } from '@/components/features/analytics/call-logs-table'
import { Loader2, PhoneIncoming, PhoneOutgoing, LayoutList } from 'lucide-react'

type CallFilter = 'all' | 'inbound' | 'outbound'

export default function AnalyticsPage() {
    const { calls, stats, isLoading } = useAnalytics()
    const [activeFilter, setActiveFilter] = useState<CallFilter>('all')

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
    }

    const filteredCalls = (calls || []).filter((call) => {
        if (activeFilter === 'inbound') return call.type !== 'outbound'
        if (activeFilter === 'outbound') return call.type === 'outbound'
        return true
    })

    const filteredStats = {
        ...stats,
        totalCalls: filteredCalls.length,
    }

    const filters: { key: CallFilter; label: string; icon: React.ReactNode; count: number }[] = [
        { key: 'all', label: 'All Calls', icon: <LayoutList className="h-4 w-4" />, count: calls?.length || 0 },
        { key: 'inbound', label: 'Inbound', icon: <PhoneIncoming className="h-4 w-4" />, count: stats.inboundCount },
        { key: 'outbound', label: 'Outbound', icon: <PhoneOutgoing className="h-4 w-4" />, count: stats.outboundCount },
    ]

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Call Analytics</h1>

            {/* Filter Tabs */}
            <div className="flex gap-2">
                {filters.map((f) => (
                    <button
                        key={f.key}
                        onClick={() => setActiveFilter(f.key)}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-[4px] text-sm font-semibold transition-all duration-200 border ${
                            activeFilter === f.key
                                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                                : 'bg-white text-muted-foreground border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                        }`}
                    >
                        {f.icon}
                        {f.label}
                        <span className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            activeFilter === f.key
                                ? 'bg-white/20 text-primary-foreground'
                                : 'bg-gray-100 text-gray-600'
                        }`}>
                            {f.count}
                        </span>
                    </button>
                ))}
            </div>

            <AnalyticsCards stats={filteredStats} activeFilter={activeFilter} />
            <h2 className="text-xl font-semibold text-foreground">
                {activeFilter === 'outbound' ? 'Outbound Call Logs' : activeFilter === 'inbound' ? 'Inbound Call Logs' : 'All Call Logs'}
            </h2>
            <CallLogsTable calls={filteredCalls} />
        </div>
    )
}
