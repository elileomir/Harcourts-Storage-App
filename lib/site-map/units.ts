import { createAdminClient } from "@/lib/supabase/server-admin";
import type { LiveUnit, PlacedUnit, SceneUnit, UnitStatus } from "./types";

const VALID_STATUS: UnitStatus[] = ["Available", "Submitted", "Unavailable"];

function coerceStatus(s: unknown): UnitStatus {
  return VALID_STATUS.includes(s as UnitStatus) ? (s as UnitStatus) : "Unavailable";
}

/**
 * Server-only. Reads ALL units for a facility via the service-role client and
 * returns ONLY public-safe fields (deliberately excludes `bond`). RLS lets anon
 * read available units only, so this public page must read server-side.
 */
export async function fetchFacilityUnits(dbName: string): Promise<LiveUnit[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("storage_units")
    .select("unit_number, unit_type, size, price, access_hours, status")
    .eq("facility", dbName);

  if (error) throw error;

  return (data ?? []).map((r) => ({
    unitNumber: String(r.unit_number),
    type: r.unit_type ?? "",
    size: r.size ?? "",
    price: r.price ?? "",
    accessHours: r.access_hours ?? "",
    status: coerceStatus(r.status),
  }));
}

/** Merge live data onto the geometric layout, keyed by unit number. */
export function mergeUnits(placed: PlacedUnit[], live: LiveUnit[]): SceneUnit[] {
  const byNumber = new Map(live.map((u) => [u.unitNumber, u]));
  return placed.map((p) => {
    const l = byNumber.get(p.unitNumber);
    return {
      ...p,
      status: l?.status ?? "Unavailable",
      size: l?.size,
      price: l?.price,
      accessHours: l?.accessHours,
    };
  });
}

/** One grouped read of availability across all facilities (for the index). */
export async function fetchAvailabilityByFacility(): Promise<
  Record<string, { available: number; total: number }>
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("storage_units")
    .select("facility, status");
  if (error) throw error;

  const out: Record<string, { available: number; total: number }> = {};
  for (const r of data ?? []) {
    const key = r.facility as string;
    if (!out[key]) out[key] = { available: 0, total: 0 };
    out[key].total += 1;
    if (r.status === "Available") out[key].available += 1;
  }
  return out;
}

export function summarise(units: SceneUnit[]) {
  const total = units.length;
  const available = units.filter((u) => u.status === "Available").length;
  const reserved = units.filter((u) => u.status === "Submitted").length;
  return { total, available, reserved, occupied: total - available - reserved };
}
