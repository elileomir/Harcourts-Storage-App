"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  ComposedChart,
  PieChart,
  Pie,
  Cell,
  Legend,
  LabelList,
} from "recharts";
import { formatPrice } from "@/lib/utils/price";

// --- Colors ---
const COLORS = {
  primary: "#2563eb", // blue-600
  secondary: "#16a34a", // green-600
  accent: "#f59e0b", // amber-500
  muted: "#94a3b8", // slate-400
  danger: "#dc2626", // red-600
  background: "#f8fafc", // slate-50
};

const FACILITY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"];
const FUNNEL_COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

// --- Info Tooltip Component ---
function ChartInfo({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-2 text-muted-foreground hover:text-foreground transition-colors">
            <Info className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent className="maxw-xs p-3">
          <p className="font-semibold mb-1">{title}</p>
          <p className="text-sm text-muted-foreground">{children}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// --- Existing Components (unchanged) ---

export function CallVolumeChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Call Volume & Bookings</CardTitle>
          <ChartInfo title="Call Volume & Bookings">
            Shows daily call volume and successful bookings over the last 30
            days. The blue bars represent total calls received, while the green
            line shows calls that resulted in bookings.
          </ChartInfo>
        </div>
        <CardDescription>
          Daily call volume and successful bookings over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <ComposedChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                itemStyle={{ fontSize: "12px" }}
                labelStyle={{
                  fontWeight: "bold",
                  color: "#1e293b",
                  marginBottom: "4px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              <Bar
                dataKey="calls"
                name="Total Calls"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
                barSize={20}
              />
              <Line
                type="monotone"
                dataKey="bookings"
                name="Bookings"
                stroke={COLORS.secondary}
                strokeWidth={2}
                dot={{ r: 3, fill: COLORS.secondary }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CsatChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>CSAT Distribution</CardTitle>
          <ChartInfo title="CSAT Distribution">
            Customer Satisfaction (CSAT) scores rated from 1-5 stars. This shows
            how many customers gave each rating. Higher stars (4-5) indicate
            positive experiences.
          </ChartInfo>
        </div>
        <CardDescription>Customer satisfaction scores</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis type="number" hide />
              <YAxis
                dataKey="score"
                type="category"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={60}
              />
              <RechartsTooltip
                cursor={{ fill: "transparent" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar
                dataKey="count"
                name="Count"
                radius={[0, 4, 4, 0]}
                barSize={24}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      index >= 3
                        ? COLORS.secondary
                        : index === 2
                        ? COLORS.accent
                        : COLORS.danger
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeadQualityChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  const RADIAN = Math.PI / 180;
  interface CustomizedLabelProps {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
  }

  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
  }: CustomizedLabelProps) => {
    if (
      typeof cx !== "number" ||
      typeof cy !== "number" ||
      typeof midAngle !== "number" ||
      typeof innerRadius !== "number" ||
      typeof outerRadius !== "number" ||
      typeof percent !== "number"
    )
      return null;

    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return percent > 0 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null;
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Lead Quality</CardTitle>
          <ChartInfo title="Lead Quality">
            AI-assessed quality of each lead based on conversation analysis.
            High quality leads show strong intent to rent, Medium shows
            interest, and Low shows minimal engagement.
          </ChartInfo>
        </div>
        <CardDescription>AI-assessed lead quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full flex justify-center">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "High"
                        ? COLORS.secondary
                        : entry.name === "Medium"
                        ? COLORS.accent
                        : COLORS.muted
                    }
                  />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function UnitStatusChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  const total = data.reduce((sum, item) => sum + Number(item.value), 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Unit Status</CardTitle>
          <ChartInfo title="Unit Status">
            Current occupancy overview. Available = ready to rent, Pending Apps
            = application submitted, Occupied = currently rented out.
          </ChartInfo>
        </div>
        <CardDescription>Current occupancy overview</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full flex items-center justify-center">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.name === "Available"
                        ? COLORS.secondary
                        : entry.name === "Pending Apps"
                        ? COLORS.accent
                        : COLORS.danger
                    }
                  />
                ))}
              </Pie>
              <RechartsTooltip />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
              <text
                x="50%"
                y="45%"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                <tspan
                  x="50%"
                  dy="0"
                  fontSize="28"
                  fontWeight="bold"
                  fill="#1e293b"
                >
                  {total}
                </tspan>
                <tspan x="50%" dy="1.6em" fontSize="13" fill="#64748b">
                  Total Units
                </tspan>
              </text>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function FacilityBreakdownChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Bookings by Facility</CardTitle>
          <ChartInfo title="Bookings by Facility">
            Total number of bookings for each facility location. Helps identify
            which facilities are most in demand.
          </ChartInfo>
        </div>
        <CardDescription>Booking performance across facilities</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="facility"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar
                dataKey="bookings"
                name="Bookings"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function OccupancyByFacilityChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Occupancy by Facility</CardTitle>
          <ChartInfo title="Occupancy by Facility">
            Shows available vs. occupied units for each facility. Calculated as
            (Occupied Units / Total Units) × 100%.
          </ChartInfo>
        </div>
        <CardDescription>Availability across locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="facility"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Bar
                dataKey="availableUnits"
                name="Available"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="occupiedUnits"
                name="Occupied"
                fill={COLORS.danger}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function DurationTrendChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Average Call Duration</CardTitle>
          <ChartInfo title="Average Call Duration">
            Average duration of calls in seconds over time. Trends can indicate
            engagement levels and conversation quality.
          </ChartInfo>
        </div>
        <CardDescription>Call duration trends over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <LineChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{
                  value: "Seconds",
                  angle: -90,
                  position: "insideLeft",
                  style: { fontSize: 12 },
                }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgDuration"
                name="Avg Duration (s)"
                stroke={COLORS.primary}
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompetitorMentions({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  if (data.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader>
          <div className="flex items-center">
            <CardTitle>Competitor Mentions</CardTitle>
            <ChartInfo title="Competitor Mentions">
              Tracks when competitors are mentioned during calls. Helps
              understand competitive landscape and customer shopping behavior.
            </ChartInfo>
          </div>
          <CardDescription>Competitors mentioned in calls</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[250px] flex items-center justify-center text-muted-foreground">
            No competitor mentions recorded
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Competitor Mentions</CardTitle>
          <ChartInfo title="Competitor Mentions">
            Tracks when competitors are mentioned during calls. Helps understand
            competitive landscape and customer shopping behavior.
          </ChartInfo>
        </div>
        <CardDescription>Competitors mentioned in calls</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data} layout="vertical">
              <CartesianGrid
                strokeDasharray="3 3"
                horizontal={true}
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                type="number"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                dataKey="name"
                type="category"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                width={100}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar
                dataKey="count"
                name="Mentions"
                fill={COLORS.accent}
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

// --- NEW ROI & PERFORMANCE CHARTS ---

export function ROITrendChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>ROI Trend</CardTitle>
          <ChartInfo title="ROI Trend">
            Return on Investment over time. Shows (Revenue - Platform Cost) /
            Platform Cost × 100%. Tracks how efficiently your investment in the
            AI platform generates revenue.
          </ChartInfo>
        </div>
        <CardDescription>30-day ROI performance</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <ComposedChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: "ROI %", angle: -90, position: "insideLeft" }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "roi") return [`${value}%`, "ROI"];
                  if (name === "cost") return [`$${value}`, "Cost"];
                  if (name === "revenue")
                    return [formatPrice(value), "Revenue"];
                  return [value, name];
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="roi"
                name="ROI %"
                stroke={COLORS.secondary}
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function RevenueByFacilityChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Revenue by Facility</CardTitle>
          <ChartInfo title="Revenue by Facility">
            Monthly recurring revenue from active bookings at each facility.
            Helps identify top revenue-generating locations.
          </ChartInfo>
        </div>
        <CardDescription>Monthly revenue breakdown</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="facility"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `$${value}`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(value: number) => [formatPrice(value), "Revenue"]}
              />
              <Bar
                dataKey="revenue"
                name="Monthly Revenue"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FACILITY_COLORS[index % FACILITY_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConversionFunnelChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Conversion Funnel</CardTitle>
          <ChartInfo title="Conversion Funnel">
            Shows conversion rates at each stage from initial call to active
            lease. Identifies where potential customers drop off in the booking
            process.
          </ChartInfo>
        </div>
        <CardDescription>Lead-to-booking progression</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[320px] w-full">
          <ResponsiveContainer width="100%" height="100%" minWidth={0}>
            <BarChart data={data} layout="horizontal">
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="stage"
                stroke="#64748b"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                angle={-15}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={(value: number, name: string) => {
                  if (name === "rate")
                    return [`${value.toFixed(1)}%`, "Conversion Rate"];
                  return [value, name];
                }}
              />
              <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]}
                  />
                ))}
                <LabelList
                  dataKey="rate"
                  position="top"
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  formatter={(value: any) => `${Number(value).toFixed(1)}%`}
                  fontSize={11}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function LeadQualityPerformanceChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any, name: string) => {
    if (name === "Conversion Rate") return [`${value.toFixed(1)}%`, name];
    return [value, name];
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Lead Quality Performance</CardTitle>
          <ChartInfo title="Lead Quality Performance">
            Compares conversion rates by AI-assessed lead quality. Shows if
            high-quality leads actually convert better, validating the AI
            scoring.
          </ChartInfo>
        </div>
        <CardDescription>Conversion by lead quality</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <BarChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="quality"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="left"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value: number) => `${value}%`}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
                formatter={tooltipFormatter}
              />
              <Legend />
              <Bar
                yAxisId="left"
                dataKey="count"
                name="Lead Count"
                fill={COLORS.primary}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                yAxisId="right"
                dataKey="rate"
                name="Conversion Rate"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

export function CreditBreakdownChart({
  data,
}: {
  data: Record<string, string | number>[];
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center">
          <CardTitle>Credit Usage Breakdown</CardTitle>
          <ChartInfo title="Credit Usage Breakdown">
            Shows how ElevenLabs credits are being spent: LLM credits for AI
            processing vs Voice credits for call time. Helps optimize usage.
          </ChartInfo>
        </div>
        <CardDescription>LLM vs Voice credit usage</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
            minWidth={0}
            minHeight={0}
          >
            <ComposedChart data={data}>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#e2e8f0"
              />
              <XAxis
                dataKey="date"
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                minTickGap={30}
              />
              <YAxis
                stroke="#64748b"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                label={{ value: "Credits", angle: -90, position: "insideLeft" }}
              />
              <RechartsTooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Bar
                dataKey="llmCredits"
                name="LLM Credits"
                stackId="a"
                fill={COLORS.primary}
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="voiceCredits"
                name="Voice Credits"
                stackId="a"
                fill={COLORS.accent}
                radius={[4, 4, 0, 0]}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
