"use client";

import { format } from "date-fns";
import { CalendarClock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ScheduleBadgeProps {
  scheduledStatus?: string | null;
  scheduledStatusDate?: string | null;
}

function prettyStatus(status: string): string {
  // Insert a space before capital letters that follow a lowercase letter,
  // e.g. "UnderConstruction" -> "Under Construction".
  return status.replace(/([a-z])([A-Z])/g, "$1 $2");
}

export function ScheduleBadge({
  scheduledStatus,
  scheduledStatusDate,
}: ScheduleBadgeProps) {
  if (!scheduledStatus || !scheduledStatusDate) {
    return null;
  }

  const scheduled = new Date(scheduledStatusDate);
  if (isNaN(scheduled.getTime())) {
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  scheduled.setHours(0, 0, 0, 0);

  // Hide if the scheduled date has already passed (cron will have applied it).
  if (scheduled < today) {
    return null;
  }

  return (
    <Badge
      variant="outline"
      className="w-fit gap-1 bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-50 font-medium"
    >
      <CalendarClock className="h-3 w-3" aria-hidden="true" />
      {prettyStatus(scheduledStatus)} · {format(scheduled, "d MMM")}
    </Badge>
  );
}
