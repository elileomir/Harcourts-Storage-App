import type { DoorFace, FacilityLayout, PlacedUnit, UnitDimensions } from "../types";
import { TYPE_DIMENSIONS } from "../dimensions";

/**
 * 7 Ferguson Drive, Spreyton — 26 units.
 * Reconstructed to match "Facility Map - 7 Ferguson Drive.pdf" exactly:
 *
 *   ┌──────────────────────────────────────────────┐
 *   │ [1][2][3][4][5][6][7][8][9][10]   [26][25][24]│   ← north row: sheds + container cluster
 *   │                                               │ ▽ (entry, right)
 *   │                driveway / yard          [23]  │
 *   │  ▷         [11][12]…[20][21][22]               │   ← south row: containers
 *   └──────────────────────────────────────────────┘
 *      (entry, bottom-left)
 *
 * Units 1–10 = Large Sheds (7.5 × 3.5 m), doors face the driveway (south).
 * Units 11–22 = Shipping Containers (6 × 2.4 m), doors face the driveway (north).
 * Units 24–26 = Containers at the east end of the north row.
 * Unit 23 = a single container offset at the east end of the south band.
 * Positions are faithful to the plan's arrangement and relative scale.
 */

const SHED = TYPE_DIMENSIONS["Large Shed"]; // 7.5 × 3.5 × 2.8
const CONT = TYPE_DIMENSIONS["Shipping Container"]; // 6.0 × 2.4 × 2.6
const GAP = 0.18;

const NORTH_Z = 0; // centre-line of the shed row (Z)
const DRIVE = 11.5; // driveway depth between the two rows (m)

/** Lay a run of units west→east. width runs along X, length is the Z depth. */
function rowAlongX(
  numbers: string[],
  type: string,
  dims: UnitDimensions,
  startX: number,
  topZ: number, // north (smaller-Z) edge of the run
  door: DoorFace,
): PlacedUnit[] {
  const fx = dims.width; // along the row
  const fz = dims.length; // depth
  const pitch = fx + GAP;
  return numbers.map((n, i) => ({
    unitNumber: n,
    type,
    x: startX + i * pitch + fx / 2,
    z: topZ + fz / 2,
    fx,
    fz,
    height: dims.height,
    door,
  }));
}

const range = (a: number, b: number) =>
  Array.from({ length: b - a + 1 }, (_, i) => String(a + i));

// North row: Large Sheds 1–10, doors face south (toward the driveway).
const shedTopZ = NORTH_Z - SHED.length / 2;
const sheds = rowAlongX(range(1, 10), "Large Shed", SHED, 0, shedTopZ, "S");
const shed10 = sheds[sheds.length - 1];
const shedRightEdge = shed10.x + shed10.fx / 2;

// East container cluster 26 → 25 → 24, aligned to the sheds' north edge.
const cluster = rowAlongX(
  ["26", "25", "24"],
  "Shipping Container",
  CONT,
  shedRightEdge + 1.6,
  shedTopZ,
  "S",
);

// South row: Containers 11–22, doors face north (toward the driveway), indented.
const contTopZ = NORTH_Z + SHED.length / 2 + DRIVE;
const containers = rowAlongX(
  range(11, 22),
  "Shipping Container",
  CONT,
  6.5,
  contTopZ,
  "N",
);
const cont22 = containers[containers.length - 1];

// Unit 23: single container offset to the east, between driveway and south row.
const u23: PlacedUnit = {
  unitNumber: "23",
  type: "Shipping Container",
  x: cont22.x + cont22.fx / 2 + 1.6 + CONT.width / 2,
  z: NORTH_Z + SHED.length / 2 + DRIVE * 0.45,
  fx: CONT.width,
  fz: CONT.length,
  height: CONT.height,
  door: "W",
};

const units: PlacedUnit[] = [...sheds, ...cluster, ...containers, u23];

const cluster24 = cluster[cluster.length - 1];
const minX = -2;
const maxX = cluster24.x + cluster24.fx / 2 + 2;
const minZ = shedTopZ - 2;
const maxZ = contTopZ + CONT.length + 2;
const driveZ = (NORTH_Z + SHED.length / 2 + contTopZ) / 2;

export const fergusonDriveLayout: FacilityLayout = {
  units,
  features: [
    {
      kind: "driveway",
      x: (minX + maxX) / 2,
      z: driveZ,
      fx: maxX - minX,
      fz: DRIVE + 2,
    },
  ],
  entries: [
    // Right side, between the 24–26 cluster and unit 23 (down arrow on the plan).
    { label: "Entry / Exit", x: maxX - 0.5, z: driveZ - 3, rotation: 0 },
    // Bottom-left, west of container 11 (right arrow on the plan).
    { label: "Entry / Exit", x: 2.5, z: contTopZ + CONT.length - 1, rotation: 90 },
  ],
  bounds: { minX, maxX, minZ, maxZ },
};
