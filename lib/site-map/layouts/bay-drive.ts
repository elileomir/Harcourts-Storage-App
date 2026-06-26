import type { FacilityLayout, PlacedUnit } from "../types";
import { dimensionsFor } from "../dimensions";
import { placeLine, seq, boundsOf, type LineItem } from "./_helpers";

/**
 * 17 Bay Drive, Spreyton. Reconstructed from the RFS A3 plan:
 *  - Top row: Super Large Sheds 44→27 (10×3.5 m), doors south.
 *  - Central back-to-back block (18 columns):
 *      top    = containers 45–54 + large sheds 55–62  (doors north)
 *      bottom = containers 86–77 + small sheds 76–69  (doors south)
 *  - Entry/Exit at the south-east.
 */

const SLS = (n: number): LineItem => ({
  n: String(n),
  type: "Super Large Shed",
  size: "10x3.5m",
});
const cont = (n: number): LineItem => ({
  n: String(n),
  type: "Shipping Container",
  size: "6x2.4m",
});
const LS = (n: number): LineItem => ({
  n: String(n),
  type: "Large Shed",
  size: "8.5x3.4m",
});
const SS = (n: number): LineItem => ({
  n: String(n),
  type: "Small Shed",
  size: "3.1x3.4m",
});

// Top row of Super Large Sheds, doors facing south.
const topShed = placeLine(seq(44, 27).map(SLS), {
  axis: "x",
  cross: 5,
  start: 0,
  door: "S",
  orient: "depthZ",
});

// Central back-to-back block.
const topItems: LineItem[] = [...seq(45, 54).map(cont), ...seq(55, 62).map(LS)];
const botItems: LineItem[] = [...seq(86, 77).map(cont), ...seq(76, 69).map(SS)];

const SPINE = 26;
const GAP = 0.15;
const centre: PlacedUnit[] = [];
let cx = 14;
for (let i = 0; i < topItems.length; i++) {
  const t = topItems[i];
  const b = botItems[i];
  const dt = dimensionsFor(t.type, t.size);
  const db = dimensionsFor(b.type, b.size);
  const colW = Math.max(dt.width, db.width);
  const x = cx + colW / 2;
  centre.push({
    unitNumber: t.n,
    type: t.type,
    x,
    z: SPINE - dt.length / 2,
    fx: dt.width,
    fz: dt.length,
    height: dt.height,
    door: "N",
  });
  centre.push({
    unitNumber: b.n,
    type: b.type,
    x,
    z: SPINE + db.length / 2,
    fx: db.width,
    fz: db.length,
    height: db.height,
    door: "S",
  });
  cx += colW + GAP;
}

const units: PlacedUnit[] = [...topShed, ...centre];
const bounds = boundsOf(units, 4);

export const bayDriveLayout: FacilityLayout = {
  units,
  features: [
    { kind: "driveway", x: (bounds.minX + bounds.maxX) / 2, z: 16, fx: bounds.maxX - bounds.minX, fz: 7 },
  ],
  entries: [{ label: "Entry / Exit", x: bounds.maxX - 2, z: bounds.maxZ - 2, rotation: 180 }],
  bounds,
};
