import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  format,
  subDays,
  parseISO,
  isWithinInterval,
  startOfDay,
  endOfDay,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { parseCSAT } from "@/lib/utils/parse-csat";
import { parseMonthlyPrice } from "@/lib/utils/price";
import { usePlatformSettings } from "./use-platform-settings";
import { Unit } from "./use-units";
import { Booking } from "./use-bookings";
import { useRealtimeChannel } from "@/lib/hooks/use-realtime-channel";

interface FacilityItem {
  facility: string | null;
}

interface CallAnalytics {
  call_id: string;
  start_time: string;
  duration_seconds: number;
  handoff_success: boolean;
  csat_score: string | null;
  lead_quality_score: string | null;
  created_at: string;
  cost_credits: number;
  llm_charge: number;
  call_charge: number;
  competitor_mention: string | null;
  requested_move_in_window: string | null;
}

interface BookingWithUnit extends Omit<Booking, "storage_units"> {
  storage_units: {
    unit_number: string;
    facility: string;
    price?: string;
    size?: string;
  } | null;
}

export interface DashboardFilters {
  dateRange?: "all" | "today" | "week" | "month" | "year" | "custom";
  startDate?: Date;
  endDate?: Date;
  facility?: string; // 'all' or specific facility name
}

export function useDashboard(filters: DashboardFilters = {}) {
  const supabase = createClient();
  const queryClient = useQueryClient();
  const { getCostPerCredit, getRevenueCommissionRate } = usePlatformSettings();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard", filters],
    queryFn: async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      try {
        // Fetch all data in parallel
        const [unitsRes, bookingsRes, callsRes, facilitiesRes] =
          await Promise.all([
            supabase
              .from("storage_units")
              .select("*")
              .abortSignal(controller.signal),
            supabase
              .from("bookings")
              .select("*, storage_units(unit_number, facility, price, size)")
              .abortSignal(controller.signal),
            supabase
              .from("call_analytics")
              .select(
                "call_id, start_time, duration_seconds, handoff_success, csat_score, lead_quality_score, created_at, cost_credits, llm_charge, call_charge, competitor_mention, requested_move_in_window"
              )
              .order("start_time", { ascending: false })
              .abortSignal(controller.signal),
            supabase
              .from("storage_units")
              .select("facility")
              .not("facility", "is", null)
              .abortSignal(controller.signal),
          ]);

        clearTimeout(timeoutId);

        if (unitsRes.error) throw unitsRes.error;
        if (bookingsRes.error) throw bookingsRes.error;
        if (callsRes.error) throw callsRes.error;
        if (facilitiesRes.error) throw facilitiesRes.error;

        let units = unitsRes.data || [];
        let bookings = bookingsRes.data || [];
        let allCalls = callsRes.data || [];

        // Get distinct facilities
        const facilitiesSet = new Set<string>();
        facilitiesRes.data?.forEach((item: FacilityItem) => {
          if (item.facility) facilitiesSet.add(item.facility);
        });
        const facilities = Array.from(facilitiesSet).sort();

        // --- Apply Filters ---

        // Facility Filter
        if (filters.facility && filters.facility !== "all") {
          units = units.filter((u: Unit) => u.facility === filters.facility);
          bookings = bookings.filter(
            (b: BookingWithUnit) =>
              b.storage_units?.facility === filters.facility
          );
        }

        // Date Range Filter
        let dateFilterStart: Date | null = null;
        let dateFilterEnd: Date | null = null;
        const now = new Date();

        switch (filters.dateRange) {
          case "today":
            dateFilterStart = startOfDay(now);
            dateFilterEnd = endOfDay(now);
            break;
          case "week":
            dateFilterStart = subDays(now, 7);
            dateFilterEnd = now;
            break;
          case "month":
            dateFilterStart = startOfMonth(now);
            dateFilterEnd = endOfMonth(now);
            break;
          case "year":
            dateFilterStart = startOfYear(now);
            dateFilterEnd = endOfYear(now);
            break;
          case "custom":
            if (filters.startDate) dateFilterStart = filters.startDate;
            if (filters.endDate) dateFilterEnd = filters.endDate;
            break;
          case "all":
          default:
            // No date filter
            break;
        }

        if (dateFilterStart && dateFilterEnd) {
          allCalls = allCalls.filter((call: CallAnalytics) => {
            if (!call.start_time) return false;
            const callDate = parseISO(call.start_time);
            return isWithinInterval(callDate, {
              start: dateFilterStart!,
              end: dateFilterEnd!,
            });
          });
        }

        // --- Metrics Calculation ---

        // Units
        const totalUnits = units.length;
        const availableUnits = units.filter(
          (u: Unit) => u.status === "Available"
        ).length;
        const occupiedUnits = units.filter(
          (u: Unit) => u.status === "Unavailable"
        ).length;
        const occupancyRate =
          totalUnits > 0
            ? ((occupiedUnits / totalUnits) * 100).toFixed(1)
            : "0.0";

        // Bookings
        const totalBookings = bookings.length;
        const pendingBookings = bookings.filter(
          (b: { status: string }) => b.status.toLowerCase() === "pending"
        ).length;
        const approvedBookings = bookings.filter(
          (b: { status: string }) => b.status.toLowerCase() === "approved"
        ).length;

        // Calls
        const totalCalls = allCalls.length;
        const successfulHandoffs = allCalls.filter(
          (c: { handoff_success: boolean }) => c.handoff_success === true
        ).length;
        // User requested Booking Rate to include ALL bookings regardless of status
        const handoffSuccessRate =
          totalCalls > 0
            ? ((totalBookings / totalCalls) * 100).toFixed(1)
            : "0.0";

        // ElevenLabs Credits (NOT dollars)
        const totalCredits = allCalls.reduce(
          (sum: number, call: CallAnalytics) => sum + (call.cost_credits || 0),
          0
        );
        const totalLLMCredits = allCalls.reduce(
          (sum: number, call: CallAnalytics) => sum + (call.llm_charge || 0),
          0
        );
        const totalCallCredits = allCalls.reduce(
          (sum: number, call: CallAnalytics) => sum + (call.call_charge || 0),
          0
        );
        const avgCreditsPerCall =
          totalCalls > 0 ? Math.round(totalCredits / totalCalls) : 0;

        // CSAT Calculation - using parseCSAT utility
        let totalCsat = 0;
        let csatCount = 0;
        const csatDistribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

        allCalls.forEach((call: CallAnalytics) => {
          const score = parseCSAT(call.csat_score);
          if (score !== null) {
            totalCsat += score;
            csatCount++;
            csatDistribution[
              score.toString() as keyof typeof csatDistribution
            ]++;
          }
        });
        const avgCsat =
          csatCount > 0 ? (totalCsat / csatCount).toFixed(1) : "N/A";

        // --- ROI & Revenue Analytics ---

        // Revenue Calculation from Active Bookings
        const activeBookings = bookings.filter(
          (b: BookingWithUnit) => b.status === "Active"
        );
        const commissionRate = getRevenueCommissionRate() || 0.1;

        const totalMonthlyRevenue = activeBookings.reduce(
          (sum: number, booking: BookingWithUnit) => {
            // Use the actual monthly rent from the booking if available (agreed price),
            // otherwise fall back to the unit's list price
            const price = booking.monthly_rent
              ? Number(booking.monthly_rent)
              : parseMonthlyPrice(booking.storage_units?.price);
            // Apply commission rate (e.g., 10% of monthly rent)
            return sum + price * commissionRate;
          },
          0
        );

        // Average Booking Value
        const avgBookingValue =
          activeBookings.length > 0
            ? totalMonthlyRevenue / activeBookings.length
            : 0;

        // Cost per Booking (CPA) - Count APPROVED bookings only
        const costPerBooking =
          approvedBookings > 0
            ? Math.round(totalCredits / approvedBookings)
            : 0;

        // ROI Calculation (using platform settings cost per credit)
        const creditCost = getCostPerCredit() || 0.0002; // Fallback if settings not loaded
        const estimatedCreditCost = totalCredits * creditCost;
        const roi =
          totalMonthlyRevenue > 0
            ? Number(
                (
                  ((totalMonthlyRevenue - estimatedCreditCost) /
                    estimatedCreditCost) *
                  100
                ).toFixed(1)
              )
            : 0;

        // Call Efficiency (bookings per 1000 credits)
        const callEfficiency =
          totalCredits > 0
            ? ((totalBookings / totalCredits) * 1000).toFixed(2)
            : "0.00";

        // --- Conversion Funnel Metrics ---

        // Lead Quality Breakdown
        const highQualityLeads = allCalls.filter(
          (c: CallAnalytics) => c.lead_quality_score === "High"
        ).length;
        const mediumQualityLeads = allCalls.filter(
          (c: CallAnalytics) => c.lead_quality_score === "Medium"
        ).length;
        const lowQualityLeads = allCalls.filter(
          (c: CallAnalytics) => c.lead_quality_score === "Low"
        ).length;

        // Lead Quality Rates
        const highQualityRate =
          totalCalls > 0
            ? ((highQualityLeads / totalCalls) * 100).toFixed(1)
            : "0.0";

        // Conversion by Lead Quality
        const highQualityConversion =
          highQualityLeads > 0
            ? ((successfulHandoffs / highQualityLeads) * 100).toFixed(1)
            : "0.0";

        // --- Performance Trends ---

        // Time-based performance (last 30 days)
        const performanceByDay = new Map<
          string,
          { revenue: number; bookings: number; calls: number; credits: number }
        >();

        for (let i = 29; i >= 0; i--) {
          const date = subDays(new Date(), i);
          const dateStr = format(date, "MMM dd");
          performanceByDay.set(dateStr, {
            revenue: 0,
            bookings: 0,
            calls: 0,
            credits: 0,
          });
        }

        allCalls.forEach((call: CallAnalytics) => {
          if (call.start_time) {
            const dateStr = format(parseISO(call.start_time), "MMM dd");
            if (performanceByDay.has(dateStr)) {
              const entry = performanceByDay.get(dateStr)!;
              entry.calls++;
              entry.credits += call.cost_credits || 0;
              if (call.handoff_success) entry.bookings++;
            }
          }
        });

        const roiTrendData = Array.from(performanceByDay.entries()).map(
          ([date, data]) => {
            const dayCost = data.credits * 0.001;
            const dayROI =
              dayCost > 0 ? ((data.revenue - dayCost) / dayCost) * 100 : 0;
            return {
              date,
              roi: parseFloat(dayROI.toFixed(1)),
              revenue: data.revenue,
              cost: parseFloat(dayCost.toFixed(2)),
              bookings: data.bookings,
            };
          }
        );

        // Conversion Funnel Data
        const conversionFunnelData = [
          { stage: "Total Calls", count: totalCalls, rate: 100 },
          {
            stage: "High Quality Leads",
            count: highQualityLeads,
            rate: totalCalls > 0 ? (highQualityLeads / totalCalls) * 100 : 0,
          },
          {
            stage: "Successful Handoffs",
            count: successfulHandoffs,
            rate: totalCalls > 0 ? (successfulHandoffs / totalCalls) * 100 : 0,
          },
          {
            stage: "Approved Bookings",
            count: approvedBookings,
            rate: totalCalls > 0 ? (approvedBookings / totalCalls) * 100 : 0,
          },
          {
            stage: "Active Leases",
            count: activeBookings.length,
            rate:
              totalCalls > 0 ? (activeBookings.length / totalCalls) * 100 : 0,
          },
        ];

        // Lead Quality Performance
        const leadQualityPerformanceData = [
          {
            quality: "High",
            count: highQualityLeads,
            conversions: allCalls.filter(
              (c: CallAnalytics) =>
                c.lead_quality_score === "High" && c.handoff_success
            ).length,
            rate:
              highQualityLeads > 0
                ? (allCalls.filter(
                    (c: CallAnalytics) =>
                      c.lead_quality_score === "High" && c.handoff_success
                  ).length /
                    highQualityLeads) *
                  100
                : 0,
          },
          {
            quality: "Medium",
            count: mediumQualityLeads,
            conversions: allCalls.filter(
              (c: CallAnalytics) =>
                c.lead_quality_score === "Medium" && c.handoff_success
            ).length,
            rate:
              mediumQualityLeads > 0
                ? (allCalls.filter(
                    (c: CallAnalytics) =>
                      c.lead_quality_score === "Medium" && c.handoff_success
                  ).length /
                    mediumQualityLeads) *
                  100
                : 0,
          },
          {
            quality: "Low",
            count: lowQualityLeads,
            conversions: allCalls.filter(
              (c: CallAnalytics) =>
                c.lead_quality_score === "Low" && c.handoff_success
            ).length,
            rate:
              lowQualityLeads > 0
                ? (allCalls.filter(
                    (c: CallAnalytics) =>
                      c.lead_quality_score === "Low" && c.handoff_success
                  ).length /
                    lowQualityLeads) *
                  100
                : 0,
          },
        ];

        // --- Chart Data Preparation ---

        // 1. Call Volume (Last 30 Days)
        const volumeMap = new Map<
          string,
          {
            date: string;
            calls: number;
            bookings: number;
            avgDuration: number;
            totalDuration: number;
          }
        >();
        const daysToShow = 30;
        const today = new Date();

        for (let i = daysToShow - 1; i >= 0; i--) {
          const date = subDays(today, i);
          const dateStr = format(date, "MMM dd");
          volumeMap.set(dateStr, {
            date: dateStr,
            calls: 0,
            bookings: 0,
            avgDuration: 0,
            totalDuration: 0,
          });
        }

        allCalls.forEach((call: CallAnalytics) => {
          if (call.start_time) {
            const dateStr = format(parseISO(call.start_time), "MMM dd");
            if (volumeMap.has(dateStr)) {
              const entry = volumeMap.get(dateStr)!;
              entry.calls++;
              if (call.handoff_success) entry.bookings++;
              entry.totalDuration += call.duration_seconds || 0;
            }
          }
        });

        // Calculate averages
        volumeMap.forEach((entry) => {
          if (entry.calls > 0) {
            entry.avgDuration = Math.round(entry.totalDuration / entry.calls);
          }
        });

        const callVolumeData = Array.from(volumeMap.values());

        // 2. CSAT Chart Data
        const csatChartData = Object.entries(csatDistribution).map(
          ([score, count]) => ({
            score: `${score} Star`,
            count,
          })
        );

        // 3. Lead Quality Distribution
        const leadQualityMap = { High: 0, Medium: 0, Low: 0 };
        allCalls.forEach((call: CallAnalytics) => {
          if (
            call.lead_quality_score &&
            ["High", "Medium", "Low"].includes(call.lead_quality_score)
          ) {
            leadQualityMap[
              call.lead_quality_score as keyof typeof leadQualityMap
            ]++;
          }
        });
        const leadQualityData = Object.entries(leadQualityMap).map(
          ([name, value]) => ({ name, value })
        );

        // 4. Unit status distribution
        const unitStatusDistribution = [
          { name: "Available", value: availableUnits },
          {
            name: "Pending Apps",
            value: units.filter((u: Unit) => u.status === "Submitted").length,
          },
          {
            name: "Occupied",
            value: units.filter((u: Unit) => u.status === "Unavailable").length,
          },
        ];

        // 5. Facility-Level Analytics
        const facilityBreakdown = facilities.map((facility) => {
          const facilityUnits = units.filter(
            (u: Unit) => u.facility === facility
          );
          const facilityBookings = bookings.filter(
            (b: BookingWithUnit) => b.storage_units?.facility === facility
          );

          return {
            facility,
            totalUnits: facilityUnits.length,
            availableUnits: facilityUnits.filter(
              (u: Unit) => u.status === "Available"
            ).length,
            occupiedUnits: facilityUnits.filter(
              (u: Unit) => u.status === "Unavailable"
            ).length,
            bookings: facilityBookings.length,
            occupancyRate:
              facilityUnits.length > 0
                ? (
                    (facilityUnits.filter(
                      (u: Unit) => u.status === "Unavailable"
                    ).length /
                      facilityUnits.length) *
                    100
                  ).toFixed(1)
                : "0.0",
          };
        });

        // 6. Duration Trend
        const durationTrendData = callVolumeData.map((d) => ({
          date: d.date,
          avgDuration: d.avgDuration,
        }));

        // 7. Competitor Mentions
        const competitorMentions: Record<string, number> = {};
        allCalls.forEach((call: CallAnalytics) => {
          if (call.competitor_mention && call.competitor_mention !== "None") {
            competitorMentions[call.competitor_mention] =
              (competitorMentions[call.competitor_mention] || 0) + 1;
          }
        });
        const competitorData = Object.entries(competitorMentions)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count);

        // 8. Move-in Window Analysis
        const moveInWindows: Record<string, number> = {};
        allCalls.forEach((call: CallAnalytics) => {
          if (
            call.requested_move_in_window &&
            call.requested_move_in_window !== "Not Specified"
          ) {
            moveInWindows[call.requested_move_in_window] =
              (moveInWindows[call.requested_move_in_window] || 0) + 1;
          }
        });
        const moveInWindowData = Object.entries(moveInWindows)
          .map(([window, count]) => ({ window, count }))
          .sort((a, b) => b.count - a.count);

        // 9. Credit Breakdown (LLM vs Voice)
        const creditBreakdownData = callVolumeData.map((day) => {
          const dateCalls = allCalls.filter((call: CallAnalytics) => {
            if (!call.start_time) return false;
            return format(parseISO(call.start_time), "MMM dd") === day.date;
          });

          const llmCredits = dateCalls.reduce(
            (sum: number, call: CallAnalytics) => sum + (call.llm_charge || 0),
            0
          );
          const voiceCredits = dateCalls.reduce(
            (sum: number, call: CallAnalytics) => sum + (call.call_charge || 0),
            0
          );

          return {
            date: day.date,
            voiceCredits,
          };
        });

        // 10. Revenue by Facility
        const revenueByFacility = activeBookings.reduce(
          (
            acc: { name: string; value: number }[],
            booking: BookingWithUnit
          ) => {
            const facility = booking.storage_units?.facility || "Unknown";
            const price = booking.monthly_rent
              ? Number(booking.monthly_rent)
              : parseMonthlyPrice(booking.storage_units?.price);

            const existing = acc.find((item) => item.name === facility);
            if (existing) {
              existing.value += price;
            } else {
              acc.push({ name: facility, value: price });
            }
            return acc;
          },
          []
        );

        return {
          facilities,
          metrics: {
            totalUnits,
            availableUnits,
            occupiedUnits,
            occupancyRate,
            totalBookings,
            pendingBookings,
            approvedBookings,
            totalCalls,
            successfulHandoffs, // Export raw count
            handoffSuccessRate,
            avgCsat,
            csatCount, // Export raw count
            totalCredits,
            totalLLMCredits,
            totalCallCredits,
            avgCreditsPerCall,
            // ROI & Revenue Metrics
            totalMonthlyRevenue,
            avgBookingValue,
            costPerBooking,
            roi,
            callEfficiency,
            estimatedCreditCost,
            // Conversion Metrics
            highQualityLeads,
            mediumQualityLeads,
            lowQualityLeads,
            highQualityRate,
            highQualityConversion,
            activeBookingsCount: activeBookings.length,
            netRevenue: totalMonthlyRevenue - estimatedCreditCost,
          },
          charts: {
            unitStatusDistribution,
            callVolumeData,
            csatChartData,
            leadQualityData,
            facilityBreakdown,
            durationTrendData,
            competitorData,
            moveInWindowData,
            // New ROI & Performance Charts
            roiTrendData,
            revenueByFacility,
            conversionFunnelData,
            leadQualityPerformanceData,
            creditBreakdownData,
          },
          recentBookings: bookings.slice(0, 5),
          recentCalls: allCalls.slice(0, 5),
        };
      } finally {
        clearTimeout(timeoutId);
      }
    },
    retry: 1,
  });

  useRealtimeChannel("dashboard-realtime", [
    {
      event: "*",
      schema: "public",
      table: "storage_units",
      callback: () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    },
    {
      event: "*",
      schema: "public",
      table: "bookings",
      callback: () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    },
    {
      event: "*",
      schema: "public",
      table: "call_analytics",
      callback: () =>
        queryClient.invalidateQueries({ queryKey: ["dashboard"] }),
    },
  ]);

  return { data, isLoading, error };
}
