import type { FacilityLayout, PlacedUnit } from "../types";
import { placeLine, boundsOf, type LineItem } from "./_helpers";

/**
 * Penguin — 780 South Road. Reconstructed from the site plan:
 *  - Five west→east rows of 3×6 roller-door units, stacked north→south:
 *      E (top, "coming soon"), D, then C/B back-to-back, then A.
 *  - Far-east column of 3×6 shipping containers (order TBC: 3, 4, 8, 11, 12, 13).
 *  - Work sheds (varied size) in two columns along the south: 7/6/5 (west) and 4/3/2/1 (east).
 *  - Gate on the east side.
 */

const rowItems = (letter: string, n: number): LineItem[] =>
  Array.from({ length: n }, (_, i) => ({
    n: `${letter}${i + 1}`,
    type: "Roller Door",
    size: "3x6m",
  }));

const contP = (n: number): LineItem => ({
  n: String(n),
  type: "Shipping Container",
  size: "3x6m",
});

const wshed = (n: number): LineItem => ({
  n: `Shed ${n}`,
  type: "Work Sheds",
  size: "varied size",
});

const row = (letter: string, n: number, z: number, door: "N" | "S") =>
  placeLine(rowItems(letter, n), {
    axis: "x",
    cross: z,
    start: 0,
    door,
    orient: "depthZ",
  });

const rollers: PlacedUnit[] = [
  ...row("E", 8, 0, "S"),
  ...row("D", 9, 6.4, "S"),
  ...row("C", 9, 16, "N"),
  ...row("B", 9, 22.4, "S"),
  ...row("A", 9, 32, "S"),
];

// Far-east container column.
const containers = placeLine([3, 4, 8, 11, 12, 13].map(contP), {
  axis: "z",
  cross: 42,
  start: 2,
  door: "W",
  orient: "depthX",
});

// Work sheds — west column (7,6,5) and east column (4,3,2,1), well spaced.
const shedsWest = placeLine([7, 6, 5].map(wshed), {
  axis: "z",
  cross: 6,
  start: 42,
  door: "E",
  orient: "depthX",
  gap: 3,
});
const shedsEast = placeLine([4, 3, 2, 1].map(wshed), {
  axis: "z",
  cross: 30,
  start: 40,
  door: "W",
  orient: "depthX",
  gap: 3,
});

const units: PlacedUnit[] = [
  ...rollers,
  ...containers,
  ...shedsWest,
  ...shedsEast,
];
const bounds = boundsOf(units, 4);

export const penguinLayout: FacilityLayout = {
  units,
  features: [
    { kind: "driveway", x: 16, z: 12, fx: 34, fz: 6 },
  ],
  entries: [{ label: "Gate", x: 33, z: 37, rotation: 90 }],
  bounds,
};
