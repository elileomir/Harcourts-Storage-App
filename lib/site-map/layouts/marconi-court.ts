import type { FacilityLayout, PlacedUnit } from "../types";
import { placeLine, seq, boundsOf, type LineItem } from "./_helpers";

/**
 * 9 Marconi Court — 183 units. The largest facility: a deep yard of long
 * north–south columns of drive-up units. Reconstructed from the RFS A3 plan
 * and the live unit ranges (columns grouped by type, matching the plan):
 *   87–109 Super Large · 110–128 / 131–149 Large · 150–176 / 179–205 Container
 *   206–224 Super Large · 225–252 Container · 253–273 Large
 * (DB gaps 129–130 and 177–178 fall on column breaks, so no phantom units.)
 */

const SLS = (n: number): LineItem => ({
  n: String(n),
  type: "Super Large Shed",
  size: "10x3.5m",
});
const LSh = (n: number): LineItem => ({
  n: String(n),
  type: "Large Shed",
  size: "8.5x3.4m",
});
const cont = (n: number): LineItem => ({
  n: String(n),
  type: "Shipping Container",
  size: "6x2.4m",
});

interface Col {
  items: LineItem[];
  x: number;
}

const columns: Col[] = [
  { items: seq(87, 109).map(SLS), x: 0 },
  { items: seq(110, 128).map(LSh), x: 14 },
  { items: seq(131, 149).map(LSh), x: 26 },
  { items: seq(150, 176).map(cont), x: 37 },
  { items: seq(179, 205).map(cont), x: 46 },
  { items: seq(206, 224).map(SLS), x: 58 },
  { items: seq(225, 252).map(cont), x: 70 },
  { items: seq(253, 273).map(LSh), x: 82 },
];

const units: PlacedUnit[] = columns.flatMap((c) =>
  placeLine(c.items, {
    axis: "z",
    cross: c.x,
    start: 0,
    door: "W",
    orient: "depthX",
  }),
);

const bounds = boundsOf(units, 5);

export const marconiCourtLayout: FacilityLayout = {
  units,
  features: [9, 32, 54, 76].map((x) => ({
    kind: "driveway" as const,
    x,
    z: (bounds.minZ + bounds.maxZ) / 2,
    fx: 3.5,
    fz: bounds.maxZ - bounds.minZ,
  })),
  entries: [{ label: "Entry / Exit", x: bounds.maxX - 3, z: bounds.minZ + 2, rotation: 0 }],
  bounds,
};
