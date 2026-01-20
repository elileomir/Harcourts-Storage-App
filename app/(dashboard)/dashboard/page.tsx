"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDashboard, DashboardFilters } from "@/hooks/use-dashboard";
import {
  Phone,
  Users,
  TrendingUp,
  Star,
  DollarSign,
  Info,
  Percent,
  Award,
  Zap,
} from "lucide-react";
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
  CreditBreakdownChart,
} from "@/components/features/dashboard/analytics-charts";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { CallDetailsDrawer } from "@/components/features/analytics/call-details-drawer";
import { useState } from "react";
import { CallLog } from "@/hooks/use-analytics";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const [filters, setFilters] = useState<DashboardFilters>({
    dateRange: "all",
    facility: "all",
  });
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { data, isLoading, error } = useDashboard(filters);
  const metrics = data?.metrics;
  const facilities = data?.facilities || [];

  const handleCallClick = (call: CallLog) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  const updateFilter = (key: keyof DashboardFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        Loading dashboard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-full space-y-4">
        <div className="text-red-500 font-medium">
          Failed to load dashboard data
        </div>
        <p className="text-sm text-muted-foreground">
          {error.message || "Unknown error occurred"}
        </p>
        <Button onClick={() => window.location.reload()} variant="default">
          Retry
        </Button>
      </div>
    );
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
            <Select
              value={filters.dateRange}
              onValueChange={(value) => updateFilter("dateRange", value)}
            >
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
            <Select
              value={filters.facility}
              onValueChange={(value) => updateFilter("facility", value)}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Facility" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Facilities</SelectItem>
                {facilities.map((facility: string) => (
                  <SelectItem key={facility} value={facility}>
                    {facility}
                  </SelectItem>
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
                    <p className="text-xs">
                      Total inbound voice calls and chat conversations processed
                      by the AI agent.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Phone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.totalCalls || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                {filters.dateRange === "all"
                  ? "All time"
                  : "In selected period"}
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Booking Rate
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Percentage of interactions resulting in a booking (all
                      statuses).
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula: ({data?.metrics.totalBookings || 0} Bookings /{" "}
                      {data?.metrics.totalCalls || 0} Interactions) × 100%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.handoffSuccessRate || "0.0"}%
              </div>
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
                    <p className="text-xs">
                      Average Customer Satisfaction Score (1-5) from post-call
                      surveys.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Based on {data?.metrics.csatCount ?? 0} surveys collected.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.avgCsat || "N/A"}
              </div>
              <p className="text-xs text-muted-foreground">Out of 5.0</p>
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
                    <p className="text-xs">
                      Percentage of total units currently occupied.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula: ({data?.metrics.occupiedUnits || 0} Occupied /{" "}
                      {data?.metrics.totalUnits || 0} Total) × 100%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.occupancyRate || "0.0"}%
              </div>
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
                    <p className="font-semibold mb-1">
                      ElevenLabs Platform Credits
                    </p>
                    <p className="text-xs">
                      Total credits consumed (not dollars). Credits are charged
                      for:
                    </p>
                    <ul className="text-xs mt-1 space-y-1">
                      <li>
                        ΓÇó <strong>LLM Usage</strong>: AI conversation
                        processing (e.g., natural language understanding)
                      </li>
                      <li>
                        ΓÇó <strong>Voice Calls</strong>: Call time duration
                      </li>
                    </ul>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Check your ElevenLabs dashboard for credit pricing
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.totalCredits || 0}
              </div>
              <div className="text-xs text-muted-foreground space-y-0.5">
                <div>LLM: {metrics?.totalLLMCredits || 0}</div>
                <div>Voice: {metrics?.totalCallCredits || 0}</div>
              </div>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Avg Credits/Call
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Average ElevenLabs credits consumed per conversation.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula:{" "}
                      {data?.metrics.totalCredits?.toLocaleString() || 0}{" "}
                      Credits / {data?.metrics.totalCalls || 0} Interactions
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.avgCreditsPerCall || 0}
              </div>
              <p className="text-xs text-muted-foreground">Per conversation</p>
            </CardContent>
          </Card>
        </div>

        {/* Business Performance KPI Cards */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-6">
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Cost per Booking
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      ElevenLabs credits spent per approved booking. Lower is
                      better.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula:{" "}
                      {data?.metrics.totalCredits?.toLocaleString() || 0}{" "}
                      Credits / {data?.metrics.approvedBookings || 0} Approved
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.costPerBooking || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Credits per conversion
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Monthly Revenue
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Monthly commission revenue from all Active bookings (10%
                      of monthly rent).
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Commission from {data?.metrics.activeBookingsCount || 0}{" "}
                      active leases
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                $
                {metrics?.totalMonthlyRevenue?.toLocaleString(undefined, {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 2,
                }) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                From {metrics?.activeBookingsCount || 0} active leases
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                ROI
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs p-3">
                    <p className="font-semibold mb-2">
                      ROI Calculation Breakdown
                    </p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Revenue:</span>
                        <span>
                          $
                          {data?.metrics.totalMonthlyRevenue?.toLocaleString(
                            undefined,
                            {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            },
                          ) || 0}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">
                          Est. Cost:
                        </span>
                        <span className="text-destructive">
                          -${data?.metrics.estimatedCreditCost?.toFixed(2) || 0}
                        </span>
                      </div>
                      <div className="border-t my-1 pt-1 flex justify-between gap-4 font-medium">
                        <span>Net Profit:</span>
                        <span className="text-green-600">
                          $
                          {(
                            (data?.metrics.totalMonthlyRevenue || 0) -
                            (data?.metrics.estimatedCreditCost || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-2 border-t pt-2 space-y-1">
                        <p>Cost derived from usage:</p>
                        <div className="flex justify-between">
                          <span> Credits Used:</span>
                          <span>
                            {data?.metrics.totalCredits?.toLocaleString()}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span> Rate:</span>
                          <span>
                            ${data?.metrics.costPerCredit?.toFixed(5)}/credit
                          </span>
                        </div>
                        <p className="italic opacity-80 mt-1">
                          (Based on ${data?.metrics.platformMonthlyCost}/mo for{" "}
                          {data?.metrics.platformMonthlyCredits?.toLocaleString()}{" "}
                          credits)
                        </p>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">{metrics?.roi || "0.0"}%</div>
              <p className="text-xs text-muted-foreground">
                Platform efficiency
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Lead Quality
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Percentage of calls rated as &quot;High&quot; quality by
                      AI.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula: ({data?.metrics.highQualityLeads || 0} High
                      Quality / {data?.metrics.totalCalls || 0} Total) × 100%
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.highQualityRate || "0.0"}%
              </div>
              <p className="text-xs text-muted-foreground">
                {metrics?.highQualityLeads || 0} high quality leads
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Call Efficiency
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Number of bookings generated per 1,000 credits spent.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Formula: ({data?.metrics.totalBookings || 0} Bookings /{" "}
                      {data?.metrics.totalCredits?.toLocaleString() || 0}{" "}
                      Credits) × 1000
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.callEfficiency || "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">
                Bookings per 1K credits
              </p>
            </CardContent>
          </Card>
          <Card sash>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-1">
                Active Leases
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p className="text-xs">
                      Total number of currently active bookings generating
                      revenue.
                    </p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Currently {data?.metrics.activeBookingsCount || 0} active
                      leases
                    </p>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="min-h-[60px] flex flex-col justify-center">
              <div className="text-2xl font-bold">
                {metrics?.activeBookingsCount || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently generating revenue
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts Section */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            {data?.charts?.callVolumeData && (
              <CallVolumeChart data={data.charts.callVolumeData} />
            )}
          </div>
          <div className="col-span-3">
            {data?.charts?.unitStatusDistribution && (
              <UnitStatusChart data={data.charts.unitStatusDistribution} />
            )}
          </div>
        </div>

        {/* ROI & Performance Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            {data?.charts?.roiTrendData && (
              <ROITrendChart data={data.charts.roiTrendData} />
            )}
          </div>
          <div className="col-span-3">
            {data?.charts?.revenueByFacility && (
              <RevenueByFacilityChart data={data.charts.revenueByFacility} />
            )}
          </div>
        </div>

        {/* Conversion & Lead Quality Analysis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            {data?.charts?.conversionFunnelData && (
              <ConversionFunnelChart data={data.charts.conversionFunnelData} />
            )}
          </div>
          <div className="col-span-2">
            {data?.charts?.leadQualityPerformanceData && (
              <LeadQualityPerformanceChart
                data={data.charts.leadQualityPerformanceData}
              />
            )}
          </div>
        </div>

        {/* Cost Analysis */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            {data?.charts?.creditBreakdownData && (
              <CreditBreakdownChart data={data.charts.creditBreakdownData} />
            )}
          </div>
          <div className="col-span-2">
            {data?.charts?.durationTrendData && (
              <DurationTrendChart data={data.charts.durationTrendData} />
            )}
          </div>
        </div>

        {/* Secondary Charts - CSAT & Lead Quality */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            {data?.charts?.csatChartData && (
              <CsatChart data={data.charts.csatChartData} />
            )}
          </div>
          <div className="col-span-2">
            {data?.charts?.leadQualityData && (
              <LeadQualityChart data={data.charts.leadQualityData} />
            )}
          </div>
        </div>

        {/* Facility-Level Insights */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            {data?.charts?.facilityBreakdown && (
              <FacilityBreakdownChart data={data.charts.facilityBreakdown} />
            )}
          </div>
          <div className="col-span-2">
            {data?.charts?.facilityBreakdown && (
              <OccupancyByFacilityChart data={data.charts.facilityBreakdown} />
            )}
          </div>
        </div>

        {/* Additional Analytics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="col-span-2">
            {data?.charts?.durationTrendData && (
              <DurationTrendChart data={data.charts.durationTrendData} />
            )}
          </div>
          <div className="col-span-2">
            {data?.charts?.competitorData && (
              <CompetitorMentions data={data.charts.competitorData} />
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-7">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data?.recentCalls && data.recentCalls.length > 0 ? (
                  data.recentCalls.map((call: Partial<CallLog>) => (
                    <div
                      key={call.call_id}
                      className="flex items-center cursor-pointer hover:bg-slate-50 p-3 rounded-lg transition-colors"
                      onClick={() =>
                        call.call_id && handleCallClick(call as CallLog)
                      }
                    >
                      <div className="space-y-1 flex-1">
                        <p className="text-sm font-medium leading-none">
                          Call from{" "}
                          {call.start_time
                            ? format(new Date(call.start_time), "MMM d, h:mm a")
                            : "Unknown time"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Duration: {call.duration_seconds}s • CSAT:{" "}
                          {call.csat_score || "N/A"} • Lead:{" "}
                          {call.lead_quality_score || "N/A"}
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
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No recent calls
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <CallDetailsDrawer
          call={selectedCall}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </div>
    </TooltipProvider>
  );
}
