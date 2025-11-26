'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useDashboard, DashboardFilters } from '@/hooks/use-dashboard'
import { Phone, Users, TrendingUp, Star, DollarSign, Info, Percent, Award, Zap } from 'lucide-react'
import {
    CallVolumeChart,
    CsatChart,
    LeadQualityChart,
    UnitStatusChart,
    FacilityBreakdownChart,
    OccupancyByFacilityChart,
    DurationTrendChart,
    CompetitorMentions,
    ROITrendChart,
    RevenueByFacilityChart,
    ConversionFunnelChart,
    LeadQualityPerformanceChart,
    CreditBreakdownChart
} from '@/components/features/dashboard/analytics-charts'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { CallDetailsDrawer } from '@/components/features/analytics/call-details-drawer'
import { CallLog } from '@/hooks/use-analytics'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import { Button } from '@/components/ui/button'

function DashboardContent() {
    const searchParams = useSearchParams()
    const [filters, setFilters] = useState<DashboardFilters>({
        dateRange: 'all',
        facility: 'all'
    })
    const [selectedCall, setSelectedCall] = useState<CallLog | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)

    const { data, isLoading, error } = useDashboard(filters)
    const metrics = data?.metrics
    const facilities = data?.facilities || []

    const handleCallClick = (call: CallLog) => {
        setSelectedCall(call)
        setDrawerOpen(true)
    }

    const updateFilter = (key: keyof DashboardFilters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }))
    }

    // Show toast if user was redirected due to unauthorized access
    useEffect(() => {
        const error = searchParams.get('error')
        if (error === 'unauthorized') {
            toast.error('Access denied. You do not have permission to view that page.')
        }
    }, [searchParams])

    if (isLoading) {
        return <div className="p-8 flex items-center justify-center h-full">Loading dashboard...</div>
    }

    if (error) {
        return (
            <div className="p-8 flex flex-col items-center justify-center h-full space-y-4">
                <div className="text-red-500 font-medium">Failed to load dashboard data</div>
                <p className="text-sm text-muted-foreground">{error.message || 'Unknown error occurred'}</p>
                <Button
                    onClick={() => window.location.reload()}
                    variant="default"
                >
                    Retry
                </Button>
            </div>
        )
    }

    return (
        <TooltipProvider>
            <div className="flex-1 space-y-4 p-8 pt-6">
                {/* Header & Filters */}
                <div className="flex items-center justify-between space-y-2">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                        <p className="text-muted-foreground">
                            Overview of your AI agent&apos;s performance and facility metrics.
                        </p>
                    </div>
                    <div className="flex items-center space-x-2">
                        {/* Date Range Filter */}
                        <Select value={filters.dateRange} onValueChange={(value) => updateFilter('dateRange', value)}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Date Range" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Time</SelectItem>
                                <SelectItem value="today">Today</SelectItem>
                                <SelectItem value="week">Last 7 Days</SelectItem>
                                <SelectItem value="month">This Month</SelectItem>
                                <SelectItem value="year">This Year</SelectItem>
                            </SelectContent>
                        </Select>

                        {/* Facility Filter */}
                        <Select value={filters.facility} onValueChange={(value) => updateFilter('facility', value)}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Facility" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Facilities</SelectItem>
                                {facilities.map((facility: string) => (
                                    <SelectItem key={facility} value={facility}>{facility}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                Total Interactions
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-xs">Total inbound voice calls and chat conversations processed by the AI agent.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                        </CardHeader >
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className="text-2xl font-bold">{metrics?.totalCalls || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                {filters.dateRange === 'all' ? 'All time' : 'In selected period'}
                            </p>
                        </CardContent>
                    </Card >
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                Booking Rate
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-xs">Percentage of interactions resulting in a booking (Pending or Approved).</p>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            Formula: ({data?.metrics.totalBookings || 0} Bookings / {data?.metrics.totalCalls || 0} Interactions) × 100%
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <TrendingUp className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className="text-2xl font-bold">{metrics?.handoffSuccessRate || '0.0'}%</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics?.approvedBookings || 0} approved bookings
                            </p>
                        </CardContent>
                    </Card>
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                Average CSAT
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-xs">Average Customer Satisfaction Score (1-5) from post-call surveys.</p>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            Based on {data?.metrics.csatCount ?? 0} surveys collected.
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <Star className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className="text-2xl font-bold">{metrics?.avgCsat || 'N/A'}</div>
                            <p className="text-xs text-muted-foreground">
                                Out of 5.0
                            </p>
                        </CardContent>
                    </Card>
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                Occupancy
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-xs">Percentage of total units currently occupied.</p>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            Formula: ({data?.metrics.occupiedUnits || 0} Occupied / {data?.metrics.totalUnits || 0} Total) × 100%
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className="text-2xl font-bold">{metrics?.occupancyRate || '0.0'}%</div>
                            <p className="text-xs text-muted-foreground">
                                {metrics?.availableUnits || 0} available
                            </p>
                        </CardContent>
                    </Card>
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                ElevenLabs Credits
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="font-semibold mb-1">ElevenLabs Platform Credits</p>
                                        <p className="text-xs">
                                            Credits are used for voice synthesis and processing.
                                            One credit roughly equals one character of text.
                                        </p>
                                        <div className="mt-2 border-t pt-2">
                                            <p className="text-xs font-medium">Usage Breakdown:</p>
                                            <ul className="list-disc pl-3 text-xs text-muted-foreground mt-1">
                                                <li>Voice Synthesis</li>
                                                <li>Speech Recognition</li>
                                                <li>Language Processing</li>
                                            </ul>
                                        </div>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <Zap className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className="text-2xl font-bold">{metrics?.totalCredits?.toLocaleString() || '0'}</div>
                            <p className="text-xs text-muted-foreground">
                                Total credits used
                            </p>
                        </CardContent>
                    </Card>
                    <Card sash>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium flex items-center gap-1">
                                Estimated ROI
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-3 w-3 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent className="max-w-xs">
                                        <p className="text-xs">Estimated Return on Investment based on automated bookings vs. platform costs.</p>
                                        <p className="text-xs mt-1 text-muted-foreground">
                                            Formula: ((Revenue - Costs) / Costs) × 100%
                                        </p>
                                    </TooltipContent>
                                </Tooltip>
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent className="min-h-[60px] flex flex-col justify-center">
                            <div className={`text-2xl font-bold ${metrics?.roi && metrics.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {metrics?.roi ? `${metrics.roi > 0 ? '+' : ''}${metrics.roi}%` : '0%'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                ${metrics?.netRevenue?.toLocaleString() || '0'} net revenue
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    <Card className="col-span-1 lg:col-span-4">
                        <CardHeader>
                            <CardTitle>Call Volume & Bookings</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <CallVolumeChart data={data?.charts.callVolumeData || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1 lg:col-span-3">
                        <CardHeader>
                            <CardTitle>Lead Quality Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LeadQualityChart data={data?.charts.leadQualityData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Unit Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <UnitStatusChart data={data?.charts.unitStatusDistribution || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Facility Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FacilityBreakdownChart data={data?.charts.facilityBreakdown || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>CSAT Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CsatChart data={data?.charts.csatChartData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Occupancy by Facility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <OccupancyByFacilityChart data={data?.charts.facilityBreakdown || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Call Duration Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <DurationTrendChart data={data?.charts.durationTrendData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Competitor Mentions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CompetitorMentions data={data?.charts.competitorData || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>ROI Trend</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ROITrendChart data={data?.charts.roiTrendData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Revenue by Facility</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RevenueByFacilityChart data={data?.charts.revenueByFacility || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Conversion Funnel</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ConversionFunnelChart data={data?.charts.conversionFunnelData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Lead Quality Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LeadQualityPerformanceChart data={data?.charts.leadQualityPerformanceData || []} />
                        </CardContent>
                    </Card>
                    <Card className="col-span-1">
                        <CardHeader>
                            <CardTitle>Credit Usage Breakdown</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <CreditBreakdownChart data={data?.charts.creditBreakdownData || []} />
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-4 grid-cols-1 lg:grid-cols-7">
                    <Card className="col-span-7">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {data?.recentCalls && data.recentCalls.length > 0 ? (
                                    data.recentCalls.map((call: Partial<CallLog>) => (
                                        <div key={call.call_id} className="flex items-center cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors" onClick={() => call.call_id && handleCallClick(call as CallLog)}>
                                            <div className="space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none">
                                                    Call from {call.start_time ? format(new Date(call.start_time), 'MMM d, h:mm a') : 'Unknown time'}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    Duration: {call.duration_seconds}s • CSAT: {call.csat_score || 'N/A'} • Lead: {call.lead_quality_score || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="ml-auto font-medium">
                                                {call.handoff_success ? (
                                                    <Badge className="bg-green-500">Booked</Badge>
                                                ) : (
                                                    <Badge variant="secondary">Not Booked</Badge>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-8">No recent calls</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <CallDetailsDrawer
                    open={drawerOpen}
                    onOpenChange={setDrawerOpen}
                    call={selectedCall}
                />
            </div>
        </TooltipProvider>
    )
}

export default function DashboardPage() {
    return (
        <Suspense fallback={<div className="p-8 flex items-center justify-center h-full">Loading dashboard...</div>}>
            <DashboardContent />
        </Suspense>
    )
}
