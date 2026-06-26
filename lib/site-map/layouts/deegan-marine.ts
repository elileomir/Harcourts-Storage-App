import type { FacilityLayout, PlacedUnit } from "../types";
import { placeLine, boundsOf, type LineItem } from "./_helpers";

/**
 * Deegan Marine. Reconstructed from the site plan:
 *  - Central double-loaded block (15 rows × 2 columns) of mixed 3×6 units —
 *    roller doors, high roller doors, containers, and the 19/20 double-roller pairs.
 *  - Top west→east row: containers 31, 32 then 21–29.
 *  - West standalone column of containers: 44, 33, 37, 36, 30.
 *  - The Deegan Marine building to the east.
 */

const C = (n: string): LineItem => ({ n, type: "Shipping Container", size: "3x6m" });
const R = (n: string): LineItem => ({ n, type: "Roller Door", size: "3x6m" });
const H = (n: string): LineItem => ({ n, type: "High Roller Door", size: "3x6m" });
const D = (n: string): LineItem => ({
  n,
  type: "Double Roller Door Unit",
  size: "3x6m",
});

// Central block — left and right columns, top→bottom, back-to-back.
const leftCol = [
  C("39"), C("35"), R("15"), H("14"), R("13"), C("40"), C("41"),
  D("20a"), R("9"), H("8"), R("7"), D("19a"), R("1"), H("2"), R("3"),
];
const rightCol = [
  C("38"), C("34"), R("18"), H("17"), R("16"), C("43"), C("42"),
  D("20b"), R("12"), H("11"), R("10"), D("19b"), R("6"), H("5"), R("4"),
];

const left = placeLine(leftCol, {
  axis: "z",
  cross: -3,
  start: 0,
  door: "W",
  orient: "depthX",
});
const right = placeLine(rightCol, {
  axis: "z",
  cross: 3,
  start: 0,
  door: "E",
  orient: "depthX",
});

// Top row.
const topRow = placeLine(
  [C("31"), C("32"), R("21"), R("22"), R("23"), C("24"), C("25"), C("26"), C("27"), R("28"), R("29")],
  { axis: "x", cross: -6, start: -10, door: "S", orient: "depthZ" },
);

// West standalone container column (well spaced).
const westCol = placeLine([C("44"), C("33"), C("37"), C("36"), C("30")], {
  axis: "z",
  cross: -16,
  start: 8,
  door: "E",
  orient: "depthZ",
  gap: 4,
});

const units: PlacedUnit[] = [...left, ...right, ...topRow, ...westCol];
const base = boundsOf(units, 4);
const bounds = { ...base, maxX: Math.max(base.maxX, 30) };

export const deeganMarineLayout: FacilityLayout = {
  units,
  features: [
    { kind: "driveway", x: -9.5, z: 24, fx: 6, fz: 54 },
    { kind: "building", label: "Deegan Marine", x: 21, z: 30, fx: 10, fz: 20 },
  ],
  entries: [],
  bounds,
};
