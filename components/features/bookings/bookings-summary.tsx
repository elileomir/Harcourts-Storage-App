'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react'

interface BookingsSummaryProps {
    bookings: Array<{ status: string }>
}

export function BookingsSummary({ bookings }: BookingsSummaryProps) {
    const total = bookings.length
    const pending = bookings.filter(b => b.status.toLowerCase() === 'pending').length
    const approved = bookings.filter(b => b.status.toLowerCase() === 'approved').length
    const rejected = bookings.filter(b => b.status.toLowerCase() === 'rejected').length

    const stats = [
        {
            title: 'Total Bookings',
            value: total,
            icon: Calendar,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
        },
        {
            title: 'Pending',
            value: pending,
            icon: Clock,
            color: 'text-yellow-600',
            bgColor: 'bg-yellow-50',
        },
        {
            title: 'Approved',
            value: approved,
            icon: CheckCircle,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
        },
        {
            title: 'Rejected',
            value: rejected,
            icon: XCircle,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
        },
    ]

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
