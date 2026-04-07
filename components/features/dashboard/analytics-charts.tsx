"use client";

import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import { formatPrice } from "@/lib/utils/price";
import type { ApexOptions } from "apexcharts";

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import("react-apexcharts"), { ssr: false });

// ─── Brand Palette ────────────────────────────────────────────────────────────
const BRAND = {
  blue:    "#00ADEF",
  navy:    "#001F49",
  green:   "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  purple:  "#8b5cf6",
  slate:   "#64748b",
  border:  "#e2e8f0",
};

const SERIES_COLORS = [BRAND.blue, BRAND.green, BRAND.amber, BRAND.purple, "#f43f5e", "#06b6d4"];
const FACILITY_COLORS = [BRAND.blue, BRAND.green, BRAND.amber, BRAND.purple];
const FUNNEL_COLORS = ["#00ADEF", "#22d3ee", "#34d399", "#86efac", "#bbf7d0"];

// ─── Shared ApexCharts base options ───────────────────────────────────────────
const baseOptions = (extras: ApexOptions = {}): ApexOptions => ({
  chart: {
    background: "transparent",
    fontFamily: "'Inter', 'system-ui', sans-serif",
    toolbar: { show: false },
    animations: {
      enabled: true,
      speed: 600,
      animateGradually: { enabled: true, delay: 80 },
      dynamicAnimation: { enabled: true, speed: 350 },
    },
    dropShadow: { enabled: false },
    ...extras.chart,
  },
  tooltip: {
    theme: "light",
    style: { fontSize: "12px", fontFamily: "'Inter', sans-serif" },
    ...extras.tooltip,
  },
  grid: {
    borderColor: BRAND.border,
    strokeDashArray: 4,
    xaxis: { lines: { show: false } },
    yaxis: { lines: { show: true } },
    padding: { top: 0, right: 12, bottom: 0, left: 4 },
    ...extras.grid,
  },
  xaxis: {
    axisBorder: { show: false },
    axisTicks: { show: false },
    labels: {
      style: { colors: BRAND.slate, fontSize: "11px" },
    },
    ...extras.xaxis,
  },
  yaxis: {
    labels: {
      style: { colors: BRAND.slate, fontSize: "11px" },
    },
    ...extras.yaxis,
  },
  legend: {
    fontSize: "12px",
    fontFamily: "'Inter', sans-serif",
    labels: { colors: "#334155" },
    markers: { size: 7 },
    itemMargin: { horizontal: 12 },
    ...extras.legend,
  },
  ...extras,
});

// ─── Info Tooltip ─────────────────────────────────────────────────────────────
function ChartInfo({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-3">
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-sm text-muted-foreground">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// ─── Chart Card Wrapper ───────────────────────────────────────────────────────
function ChartCard({
  title,
  description,
  info,
  height = 300,
  children,
}: {
  title: string;
  description: string;
  info: string;
  height?: number;
  children: React.ReactNode;
}) {
  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center">
          <CardTitle className="text-base font-semibold">{title}</CardTitle>
          <ChartInfo title={title}>{info}</ChartInfo>
        </div>
        <CardDescription className="text-xs">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-0 pt-0">
        <div style={{ height }} className="w-full px-2 pb-2">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── 1. Call Volume & Bookings ─────────────────────────────────────────────────
export function CallVolumeChart({ data }: { data: Record<string, string | number>[] }) {
  const categories = data.map((d) => String(d.date));
  const options: ApexOptions = baseOptions({
    chart: {
      type: "bar",
      stacked: false,
    },
    colors: [BRAND.blue, BRAND.green],
    stroke: { curve: "smooth", width: [0, 2.5], colors: [BRAND.blue, BRAND.green] },
    plotOptions: {
      bar: { columnWidth: "45%", borderRadius: 4 },
    },
    xaxis: {
      categories,
      labels: { rotate: -30, style: { fontSize: "10px", colors: BRAND.slate } },
      tooltip: { enabled: false },
    },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `${val}` },
    },
    fill: {
      type: ["solid", "gradient"],
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.85,
        opacityTo: 0.6,
      },
    },
    legend: { position: "top", horizontalAlign: "right" },
    dataLabels: { enabled: false },
  });

  const series = [
    { name: "Total Calls", type: "bar", data: data.map((d) => Number(d.calls)) },
    { name: "Bookings", type: "line", data: data.map((d) => Number(d.bookings)) },
  ];

  return (
    <ChartCard
      title="Call Volume & Bookings"
      description="Daily call volume and successful bookings over the last 30 days"
      info="Shows daily call volume and successful bookings over the last 30 days. Blue bars = total calls, green line = bookings."
      height={300}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 2. CSAT Distribution ─────────────────────────────────────────────────────
export function CsatChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: data.map((_, i) =>
      i >= 3 ? BRAND.green : i === 2 ? BRAND.amber : BRAND.red
    ),
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 4,
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetX: 20,
      style: { fontSize: "12px", colors: ["#334155"], fontWeight: 600 },
    },
    xaxis: { categories: data.map((d) => String(d.score)), labels: { style: { fontSize: "11px", colors: BRAND.slate } } },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    tooltip: { y: { formatter: (val: number) => `${val} responses` } },
    legend: { show: false },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  });

  const series = [{ name: "Responses", data: data.map((d) => Number(d.count)) }];

  return (
    <ChartCard
      title="CSAT Distribution"
      description="Customer satisfaction scores"
      info="CSAT scores rated 1–5 stars. Green = positive (4–5), Amber = neutral, Red = negative (1–2)."
      height={250}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 3. Lead Quality (Donut) ──────────────────────────────────────────────────
export function LeadQualityChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "donut" },
    colors: [BRAND.green, BRAND.amber, BRAND.slate],
    labels: data.map((d) => String(d.name)),
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { fontSize: "13px", color: "#334155", fontFamily: "Inter" },
            value: { fontSize: "22px", fontWeight: 700, color: BRAND.navy, fontFamily: "Inter" },
            total: {
              show: true,
              label: "Leads",
              fontSize: "12px",
              color: BRAND.slate,
              formatter: (w: { globals: { seriesTotals: number[] } }) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0).toString(),
            },
          },
        },
      },
    },
    legend: { position: "bottom", horizontalAlign: "center" },
    tooltip: { y: { formatter: (val: number) => `${val} leads` } },
    stroke: { width: 2, colors: ["#fff"] },
  });

  const series = data.map((d) => Number(d.value));

  return (
    <ChartCard
      title="Lead Quality"
      description="AI-assessed lead quality distribution"
      info="AI-assessed quality based on conversation analysis. High = strong intent, Medium = interested, Low = minimal engagement."
      height={260}
    >
      <Chart options={options} series={series} type="donut" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 4. Unit Status (Radial/Donut) ───────────────────────────────────────────
export function UnitStatusChart({ data }: { data: Record<string, string | number>[] }) {
  const colorMap: Record<string, string> = {
    Available: BRAND.green,
    "Pending Apps": BRAND.amber,
    Occupied: BRAND.red,
  };

  const options: ApexOptions = baseOptions({
    chart: { type: "donut" },
    colors: data.map((d) => colorMap[String(d.name)] || BRAND.blue),
    labels: data.map((d) => String(d.name)),
    dataLabels: { enabled: false },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: { fontSize: "13px", color: "#334155", fontFamily: "Inter" },
            value: { fontSize: "24px", fontWeight: 700, color: BRAND.navy },
            total: {
              show: true,
              label: "Total Units",
              fontFamily: "Inter",
              fontSize: "12px",
              color: BRAND.slate,
              formatter: (w: { globals: { seriesTotals: number[] } }) =>
                w.globals.seriesTotals.reduce((a, b) => a + b, 0).toString(),
            },
          },
        },
      },
    },
    legend: { position: "bottom" },
    stroke: { width: 2, colors: ["#fff"] },
    tooltip: { y: { formatter: (val: number) => `${val} units` } },
  });

  const series = data.map((d) => Number(d.value));

  return (
    <ChartCard
      title="Unit Status"
      description="Current occupancy overview"
      info="Available = ready to rent, Pending Apps = application submitted, Occupied = currently rented."
      height={260}
    >
      <Chart options={options} series={series} type="donut" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 5. Bookings by Facility ──────────────────────────────────────────────────
export function FacilityBreakdownChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: FACILITY_COLORS,
    plotOptions: {
      bar: {
        columnWidth: "55%",
        borderRadius: 5,
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetY: -18,
      style: { fontSize: "11px", colors: ["#334155"], fontWeight: 600 },
    },
    xaxis: { categories: data.map((d) => String(d.facility)), labels: { style: { fontSize: "11px", colors: BRAND.slate } } },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    legend: { show: false },
    tooltip: { y: { formatter: (val: number) => `${val} bookings` } },
  });

  const series = [{ name: "Bookings", data: data.map((d) => Number(d.bookings)) }];

  return (
    <ChartCard
      title="Bookings by Facility"
      description="Booking performance across facilities"
      info="Total number of bookings per facility location. Helps identify which facilities are most in demand."
      height={260}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 6. Occupancy by Facility (Grouped Bar) ───────────────────────────────────
export function OccupancyByFacilityChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: [BRAND.green, BRAND.red],
    plotOptions: {
      bar: { columnWidth: "60%", borderRadius: 4, borderRadiusApplication: "end" },
    },
    dataLabels: { enabled: false },
    xaxis: { categories: data.map((d) => String(d.facility)), labels: { style: { fontSize: "11px", colors: BRAND.slate } } },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    legend: { position: "top", horizontalAlign: "right" },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `${val} units` },
    },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    fill: { opacity: 1 },
  });

  const series = [
    { name: "Available", data: data.map((d) => Number(d.availableUnits)) },
    { name: "Occupied", data: data.map((d) => Number(d.occupiedUnits)) },
  ];

  return (
    <ChartCard
      title="Occupancy by Facility"
      description="Availability across locations"
      info="Shows available vs occupied units per facility. Calculated as (Occupied / Total) × 100%."
      height={260}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 7. Average Call Duration (Area) ─────────────────────────────────────────
export function DurationTrendChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "area" },
    colors: [BRAND.blue],
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.35,
        opacityTo: 0.02,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => String(d.date)),
      labels: { rotate: -30, style: { fontSize: "10px", colors: BRAND.slate } },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${val}s`,
        style: { colors: BRAND.slate, fontSize: "11px" },
      },
    },
    tooltip: { y: { formatter: (val: number) => `${val} seconds` } },
    markers: { size: 0, hover: { size: 5 } },
  });

  const series = [{ name: "Avg Duration (s)", data: data.map((d) => Number(d.avgDuration)) }];

  return (
    <ChartCard
      title="Average Call Duration"
      description="Call duration trends over time"
      info="Average duration of calls in seconds. Trends indicate engagement levels and conversation quality."
      height={260}
    >
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 8. Competitor Mentions ───────────────────────────────────────────────────
export function CompetitorMentions({ data }: { data: Record<string, string | number>[] }) {
  if (data.length === 0) {
    return (
      <ChartCard
        title="Competitor Mentions"
        description="Competitors mentioned in calls"
        info="Tracks when competitors are mentioned during calls."
        height={260}
      >
        <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
          No competitor mentions recorded
        </div>
      </ChartCard>
    );
  }

  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: [BRAND.amber],
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4, distributed: false },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => `${val}`,
      offsetX: 20,
      style: { fontSize: "11px", colors: ["#334155"], fontWeight: 600 },
    },
    xaxis: { categories: data.map((d) => String(d.name)), labels: { style: { fontSize: "11px", colors: BRAND.slate } } },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    legend: { show: false },
    tooltip: { y: { formatter: (val: number) => `${val} mentions` } },
    grid: { xaxis: { lines: { show: true } }, yaxis: { lines: { show: false } } },
  });

  const series = [{ name: "Mentions", data: data.map((d) => Number(d.count)) }];

  return (
    <ChartCard
      title="Competitor Mentions"
      description="Competitors mentioned in calls"
      info="Tracks when competitors are mentioned during calls. Helps understand the competitive landscape."
      height={260}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 9. ROI Trend (Area + Line) ───────────────────────────────────────────────
export function ROITrendChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "line" },
    colors: [BRAND.green, BRAND.blue, BRAND.amber],
    stroke: { curve: "smooth", width: [3, 2, 2] },
    fill: {
      type: ["gradient", "solid", "solid"],
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.3,
        opacityTo: 0.02,
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => String(d.date)),
      labels: { rotate: -30, style: { fontSize: "10px", colors: BRAND.slate } },
      tooltip: { enabled: false },
    },
    yaxis: [
      {
        title: { text: "ROI %", style: { color: BRAND.green, fontSize: "11px" } },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { colors: BRAND.slate, fontSize: "11px" },
        },
      },
      { show: false },
      { show: false },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val: number) => `${val.toFixed(1)}%` },
        { formatter: (val: number) => formatPrice(val) },
        { formatter: (val: number) => `$${val.toFixed(2)}` },
      ],
    },
    legend: { position: "top", horizontalAlign: "right" },
    markers: { size: 0, hover: { size: 5 } },
  });

  const series = [
    { name: "ROI %", type: "area", data: data.map((d) => Number(d.roi)) },
    { name: "Revenue", type: "line", data: data.map((d) => Number(d.revenue)) },
    { name: "Cost", type: "line", data: data.map((d) => Number(d.cost)) },
  ];

  return (
    <ChartCard
      title="ROI Trend"
      description="30-day ROI performance"
      info="Return on Investment over time. Shows (Revenue - Platform Cost) / Platform Cost × 100%."
      height={300}
    >
      <Chart options={options} series={series} type="line" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 10. Revenue by Facility (Gradient Bar) ───────────────────────────────────
export function RevenueByFacilityChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: FACILITY_COLORS,
    plotOptions: {
      bar: {
        columnWidth: "50%",
        borderRadius: 6,
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (val: number) => formatPrice(val),
      offsetY: -20,
      style: { fontSize: "10px", colors: ["#334155"], fontWeight: 600 },
    },
    xaxis: { categories: data.map((d) => String(d.facility)), labels: { style: { fontSize: "11px", colors: BRAND.slate } } },
    yaxis: {
      labels: {
        formatter: (val: number) => `$${(val / 1000).toFixed(0)}k`,
        style: { colors: BRAND.slate, fontSize: "11px" },
      },
    },
    legend: { show: false },
    tooltip: { y: { formatter: (val: number) => formatPrice(val) } },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 0.95,
        opacityTo: 0.7,
      },
    },
  });

  const series = [{ name: "Revenue", data: data.map((d) => Number(d.revenue)) }];

  return (
    <ChartCard
      title="Revenue by Facility"
      description="Monthly revenue breakdown"
      info="Monthly recurring revenue from active bookings at each facility."
      height={300}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 11. Conversion Funnel ────────────────────────────────────────────────────
export function ConversionFunnelChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: FUNNEL_COLORS,
    plotOptions: {
      bar: {
        columnWidth: "60%",
        borderRadius: 5,
        distributed: true,
        dataLabels: { position: "top" },
      },
    },
    dataLabels: {
      enabled: true,
      formatter: (_val: number, opts?: { dataPointIndex: number }) => {
        const rate = data[opts?.dataPointIndex ?? 0]?.rate;
        return rate != null ? `${Number(rate).toFixed(1)}%` : "";
      },
      offsetY: -20,
      style: { fontSize: "10px", colors: ["#334155"], fontWeight: 600 },
    },
    xaxis: {
      categories: data.map((d) => String(d.stage)),
      labels: { rotate: -20, style: { fontSize: "10px", colors: BRAND.slate } },
    },
    yaxis: { labels: { style: { colors: BRAND.slate, fontSize: "11px" } } },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val: number, opts) => {
        const rate = data[opts?.dataPointIndex ?? 0]?.rate;
        return `${val} leads${rate != null ? ` (${Number(rate).toFixed(1)}%)` : ""}`;
      }},
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "light",
        type: "vertical",
        opacityFrom: 1,
        opacityTo: 0.7,
      },
    },
  });

  const series = [{ name: "Count", data: data.map((d) => Number(d.count)) }];

  return (
    <ChartCard
      title="Conversion Funnel"
      description="Lead-to-booking progression"
      info="Shows conversion rates at each stage from initial call to active lease."
      height={320}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 12. Lead Quality Performance (Mixed) ────────────────────────────────────
export function LeadQualityPerformanceChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "bar" },
    colors: [BRAND.blue, BRAND.green],
    plotOptions: {
      bar: { columnWidth: "55%", borderRadius: 4, borderRadiusApplication: "end" },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => String(d.quality)),
      labels: { style: { fontSize: "12px", colors: BRAND.slate } },
    },
    yaxis: [
      {
        title: { text: "Lead Count", style: { color: BRAND.blue, fontSize: "11px" } },
        labels: { style: { colors: BRAND.slate, fontSize: "11px" } },
      },
      {
        opposite: true,
        title: { text: "Conv. Rate %", style: { color: BRAND.green, fontSize: "11px" } },
        labels: {
          formatter: (val: number) => `${val.toFixed(0)}%`,
          style: { colors: BRAND.slate, fontSize: "11px" },
        },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val: number) => `${val} leads` },
        { formatter: (val: number) => `${val.toFixed(1)}%` },
      ],
    },
    legend: { position: "top", horizontalAlign: "right" },
    stroke: { show: true, width: [0, 2.5], colors: [BRAND.blue, BRAND.green] },
    fill: { opacity: [0.9, 1] },
  });

  const series = [
    { name: "Lead Count", type: "bar", data: data.map((d) => Number(d.count)) },
    { name: "Conversion Rate", type: "line", data: data.map((d) => Number(d.rate)) },
  ];

  return (
    <ChartCard
      title="Lead Quality Performance"
      description="Conversion by lead quality tier"
      info="Compares conversion rates by AI-assessed lead quality. Validates whether high-quality leads convert better."
      height={300}
    >
      <Chart options={options} series={series} type="bar" height="100%" width="100%" />
    </ChartCard>
  );
}

// ─── 13. Credit Breakdown (Stacked Area) ──────────────────────────────────────
export function CreditBreakdownChart({ data }: { data: Record<string, string | number>[] }) {
  const options: ApexOptions = baseOptions({
    chart: { type: "area", stacked: true },
    colors: [BRAND.blue, BRAND.amber],
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.2,
        stops: [0, 90, 100],
      },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: data.map((d) => String(d.date)),
      labels: { rotate: -30, style: { fontSize: "10px", colors: BRAND.slate } },
      tooltip: { enabled: false },
    },
    yaxis: {
      labels: {
        formatter: (val: number) => `${(val / 1000).toFixed(0)}k`,
        style: { colors: BRAND.slate, fontSize: "11px" },
      },
      title: { text: "Credits", style: { color: BRAND.slate, fontSize: "11px" } },
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val: number) => `${val.toLocaleString()} credits` },
    },
    legend: { position: "top", horizontalAlign: "right" },
    markers: { size: 0, hover: { size: 4 } },
  });

  const series = [
    { name: "LLM Credits", data: data.map((d) => Number(d.llmCredits)) },
    { name: "Voice Credits", data: data.map((d) => Number(d.voiceCredits)) },
  ];

  return (
    <ChartCard
      title="Credit Usage Breakdown"
      description="LLM vs Voice credit spend over time"
      info="Shows how ElevenLabs credits are split: LLM credits for AI processing vs Voice credits for call time."
      height={300}
    >
      <Chart options={options} series={series} type="area" height="100%" width="100%" />
    </ChartCard>
  );
}
