'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle, Clock, Users, TrendingUp } from 'lucide-react'

interface UnitsSummaryProps {
    units: Array<{ status: string }>
}

export function UnitsSummary({ units }: UnitsSummaryProps) {
    const total = units.length
    const available = units.filter(u => u.status === 'Available').length
    const pending = units.filter(u => u.status === 'Submitted').length  // Submitted = pending applications
    const occupied = units.filter(u => u.status === 'Unavailable').length  // Unavailable = occupied
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : '0.0'

    const stats = [
        { title: 'Total Units', value: total, icon: Building2, color: 'text-blue-600', bgColor: 'bg-blue-50' },
        { title: 'Available', value: available, icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-50' },
        { title: 'Pending Apps', value: pending, icon: Clock, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
        { title: 'Occupied', value: occupied, icon: Users, color: 'text-orange-600', bgColor: 'bg-orange-50' },
        { title: 'Occupancy Rate', value: `${occupancyRate}%`, icon: TrendingUp, color: 'text-purple-600', bgColor: 'bg-purple-50' },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 mb-6">
            {stats.map((stat) => {
                const Icon = stat.icon
                return (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                                <Icon className={`h-4 w-4 ${stat.color}`} />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
