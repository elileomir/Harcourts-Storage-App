import type { UnitDimensions, UnitStatus } from "./types";

/**
 * Real-world unit dimensions (metres) sourced from the facility plan legends.
 * Used to extrude each unit box to true size — this is what makes the map
 * dimensionally honest rather than decorative.
 */
export const TYPE_DIMENSIONS: Record<string, UnitDimensions> = {
  // Ferguson Drive (legend: brick shed w/ roller door)
  "Large Shed": { length: 7.5, width: 3.5, height: 2.8 },
  "Shipping Container": { length: 6.0, width: 2.4, height: 2.6 },
  // Other facilities — used as more layouts come online
  "Super Large Shed": { length: 9.0, width: 4.0, height: 3.0 },
  "Small Shed": { length: 6.0, width: 3.0, height: 2.6 },
  "Roller Door": { length: 6.0, width: 3.0, height: 2.8 },
  "High Roller Door": { length: 6.0, width: 3.0, height: 3.4 },
  "Double Roller Door Unit": { length: 12.0, width: 3.0, height: 2.8 },
  "Small Shipping Container": { length: 3.0, width: 2.4, height: 2.6 },
  "Sml Shipping Container": { length: 3.0, width: 2.4, height: 2.6 },
  "Work Sheds": { length: 8.0, width: 5.0, height: 3.3 },
};

/**
 * Fallback: parse a size string like "7.5x3.5m", "3x6", "2.4x3m" into metres.
 * Returns length (larger) × width (smaller) with a sensible default height.
 */
export function parseSize(size?: string): UnitDimensions | null {
  if (!size) return null;
  const nums = size.match(/[\d.]+/g);
  if (!nums || nums.length < 2) return null;
  const a = parseFloat(nums[0]);
  const b = parseFloat(nums[1]);
  if (!a || !b) return null;
  const length = Math.max(a, b);
  const width = Math.min(a, b);
  return { length, width, height: 2.7 };
}

export function dimensionsFor(type: string, size?: string): UnitDimensions {
  // Prefer the unit's real size string (same type name can differ per facility),
  // but keep the type's tuned height when we have one.
  const parsed = parseSize(size);
  const typed = TYPE_DIMENSIONS[type];
  if (parsed && typed) {
    return { length: parsed.length, width: parsed.width, height: typed.height };
  }
  return parsed ?? typed ?? { length: 6, width: 3, height: 2.7 };
}

/** Human-readable dimension label for the legend / detail panel. */
export function dimensionLabel(type: string, size?: string): string {
  const d = TYPE_DIMENSIONS[type] ?? parseSize(size);
  if (!d) return size ?? "—";
  return `${d.length} × ${d.width} × ${d.height} m`;
}

/**
 * Status-driven palette. The map reads primarily as a live availability view:
 * Available pops in Harcourts cyan; everything else recedes to calm slate.
 */
export const STATUS_COLORS: Record<
  UnitStatus,
  { body: string; roof: string; emissive: string; emissiveIntensity: number }
> = {
  Available: {
    body: "#00ADEF", // Harcourts primary cyan
    roof: "#0a93c9",
    emissive: "#00ADEF",
    emissiveIntensity: 0.45,
  },
  Submitted: {
    body: "#f4a73b", // pending — warm amber
    roof: "#d98a1f",
    emissive: "#f4a73b",
    emissiveIntensity: 0.2,
  },
  Unavailable: {
    body: "#9aa6b2", // occupied — muted slate
    roof: "#74808d",
    emissive: "#000000",
    emissiveIntensity: 0,
  },
};

export const STATUS_LABEL: Record<UnitStatus, string> = {
  Available: "Available now",
  Submitted: "Reserved",
  Unavailable: "Occupied",
};
