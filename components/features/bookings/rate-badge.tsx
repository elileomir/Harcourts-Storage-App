"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface RateBadgeProps {
  monthlyRent?: number | null;
  newRate?: number | null;
  effectiveDate?: string | null;
}

export function RateBadge({
  monthlyRent,
  newRate,
  effectiveDate,
}: RateBadgeProps) {
  if (monthlyRent === null || monthlyRent === undefined) {
    return <span className="text-muted-foreground">—</span>;
  }

  let pendingLabel: string | null = null;

  if (
    newRate !== null &&
    newRate !== undefined &&
    newRate !== monthlyRent &&
    effectiveDate
  ) {
    const effective = new Date(effectiveDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (!isNaN(effective.getTime()) && effective >= today) {
      pendingLabel = `New $${newRate} from ${format(effective, "d MMM yyyy")}`;
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-muted-foreground">${monthlyRent}/mo</span>
      {pendingLabel && (
        <Badge
          variant="outline"
          className="bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-100"
        >
          {pendingLabel}
        </Badge>
      )}
    </div>
  );
}
