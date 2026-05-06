"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Clock, CheckCircle2, PhoneOutgoing } from "lucide-react";
import { WaitlistRequest } from "@/hooks/use-waitlist";

interface WaitlistStatsProps {
  requests: WaitlistRequest[];
}

export function WaitlistStats({ requests }: WaitlistStatsProps) {
  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === "Pending").length;
  const acceptedRequests = requests.filter(
    (r) => r.status === "Accepted"
  ).length;

  const conversionRate =
    totalRequests > 0
      ? Math.round((acceptedRequests / totalRequests) * 100)
      : 0;

  // Outbound call stats
  const calledRequests = requests.filter((r) => r.penny_called_at);
  const calledCount = calledRequests.length;

  // Avg response time (created_at → penny_called_at)
  const avgResponseHours = calledCount > 0
    ? (() => {
        const totalMs = calledRequests.reduce((acc, r) => {
          const created = new Date(r.created_at).getTime();
          const called = new Date(r.penny_called_at!).getTime();
          return acc + Math.max(0, called - created);
        }, 0);
        return Math.round(totalMs / calledCount / (1000 * 60 * 60));
      })()
    : null;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests}</div>
          <p className="text-xs text-muted-foreground">
            All time waitlist entries
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingRequests}</div>
          <p className="text-xs text-muted-foreground">
            Awaiting contact or offer
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{conversionRate}%</div>
          <p className="text-xs text-muted-foreground">
            Requests converted to bookings
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Penny Outbound</CardTitle>
          <PhoneOutgoing className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{calledCount}</div>
          <p className="text-xs text-muted-foreground">
            {avgResponseHours !== null
              ? `Avg ${avgResponseHours}h response time`
              : "Calls made by Penny AI"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
