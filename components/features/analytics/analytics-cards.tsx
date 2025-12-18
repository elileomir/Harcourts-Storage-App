import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, CheckCircle2, Star, AlertTriangle } from "lucide-react";

interface AnalyticsCardsProps {
  stats: {
    totalCalls: number;
    handoffRate: number;
    csatScore: string;
    topChurn: [string, number][];
  };
}

export function AnalyticsCards({ stats }: AnalyticsCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
          <Phone className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalCalls}</div>
          <p className="text-xs text-muted-foreground">
            Total inbound calls processed
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Handoff Rate</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.handoffRate}%</div>
          <p className="text-xs text-muted-foreground">
            Successful open new tab
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">CSAT Score</CardTitle>
          <Star className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.csatScore}</div>
          <p className="text-xs text-muted-foreground">
            Average customer satisfaction
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Top Churn Reason
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div
            className="text-2xl font-bold truncate"
            title={stats.topChurn?.[0]?.[0] || "N/A"}
          >
            {stats.topChurn?.[0]?.[0] || "N/A"}
          </div>
          <p className="text-xs text-muted-foreground">
            Most common reason for drop-off
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
