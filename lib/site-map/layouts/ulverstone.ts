import type { FacilityLayout, PlacedUnit } from "../types";
import { placeLine, seq, boundsOf, type LineItem } from "./_helpers";

/**
 * Ulverstone — 45 Fieldings Way. Reconstructed from the site plan:
 *  - Central double-loaded block of 3×6 roller-door units:
 *      left column 1→23 (doors west), right column 48→26 (doors east), back-to-back.
 *  - East column: container 51, roller doors 52–78 (no 66), container 79 (doors west).
 *  - South-west column: small 2.4×3 containers 87→80 (doors east).
 *  - Car-space bay and gate on the west side.
 */

const roller = (n: number): LineItem => ({ n: String(n), type: "Roller Door" });
const cont = (n: number): LineItem => ({ n: String(n), type: "Shipping Container" });
const smlc = (n: number): LineItem => ({
  n: String(n),
  type: "Sml Shipping Container",
});

// Central block — two back-to-back columns.
const leftCol = placeLine(seq(1, 23).map(roller), {
  axis: "z",
  cross: -3,
  start: 0,
  door: "W",
  orient: "depthX",
});
const rightCol = placeLine(seq(48, 26).map(roller), {
  axis: "z",
  cross: 3,
  start: 0,
  door: "E",
  orient: "depthX",
});

// East column: 51 (container), 52–65, 67–78 (rollers), 79 (container).
const eastItems: LineItem[] = [
  cont(51),
  ...seq(52, 65).map(roller),
  ...seq(67, 78).map(roller),
  cont(79),
];
const eastCol = placeLine(eastItems, {
  axis: "z",
  cross: 17,
  start: 0,
  door: "W",
  orient: "depthX",
});

// South-west small-container column.
const smlCol = placeLine(seq(87, 80).map(smlc), {
  axis: "z",
  cross: -22,
  start: 42,
  door: "E",
  orient: "depthX",
});

const units: PlacedUnit[] = [...leftCol, ...rightCol, ...eastCol, ...smlCol];
const bounds = boundsOf(units, 4);
const driveZ = (bounds.minZ + bounds.maxZ) / 2;

export const ulverstoneLayout: FacilityLayout = {
  units,
  features: [
    // Main aisle between the central block and the east column.
    { kind: "driveway", x: 10, z: driveZ, fx: 8, fz: bounds.maxZ - bounds.minZ },
    // Car spaces on the west side.
    { kind: "carpark", label: "Car spaces", x: -13, z: 26, fx: 7, fz: 16 },
  ],
  entries: [{ label: "Gate", x: -22, z: bounds.minZ + 1, rotation: 0 }],
  bounds,
};
