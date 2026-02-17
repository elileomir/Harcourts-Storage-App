import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CallLog } from "@/hooks/use-analytics";
import { CallDetailsDrawer } from "./call-details-drawer";

interface CallLogsTableProps {
  calls: CallLog[];
}

function CallDetailsButton({ call }: { call: CallLog }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        View
      </Button>
      <CallDetailsDrawer call={call} open={open} onOpenChange={setOpen} />
    </>
  );
}

export function CallLogsTable({ calls = [] }: CallLogsTableProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date & Time</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead>Cost</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Handoff</TableHead>
            <TableHead>CSAT</TableHead>
            <TableHead>Lead Quality</TableHead>
            <TableHead>Churn Reason</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {calls.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                No call logs available
              </TableCell>
            </TableRow>
          ) : (
            calls.map((call) => (
              <TableRow key={call.call_id}>
                <TableCell className="font-medium">
                  {call.start_time
                    ? format(new Date(call.start_time), "MMM d, yyyy h:mm a")
                    : "-"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`${
                      call.platform === "retell"
                        ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-50"
                        : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-50"
                    }`}
                  >
                    {call.platform === "retell" ? "Retell" : "ElevenLabs"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {call.platform === "retell" ? (
                    <span className="font-mono text-xs">
                      ${call.cost_credits?.toFixed(2)}
                    </span>
                  ) : (
                    <span className="font-mono text-xs text-muted-foreground">
                      {Math.round(call.cost_credits || 0)} credits
                    </span>
                  )}
                </TableCell>
                <TableCell>{call.duration_seconds}s</TableCell>
                <TableCell>
                  <Badge
                    variant={call.handoff_success ? "default" : "secondary"}
                  >
                    {call.handoff_success ? "Success" : "Failed"}
                  </Badge>
                </TableCell>
                <TableCell>{call.csat_score || "-"}</TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      call.lead_quality_score === "High"
                        ? "border-green-500 text-green-500"
                        : call.lead_quality_score === "Medium"
                          ? "border-yellow-500 text-yellow-500"
                          : "border-gray-500 text-gray-500"
                    }
                  >
                    {call.lead_quality_score || "N/A"}
                  </Badge>
                </TableCell>
                <TableCell
                  className="max-w-[120px] truncate"
                  title={call.primary_churn_reason}
                >
                  {call.primary_churn_reason || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <CallDetailsButton call={call} />
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
