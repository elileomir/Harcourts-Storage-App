import type { DoorFace, PlacedUnit } from "../types";
import { dimensionsFor } from "../dimensions";

export interface LineItem {
  n: string;
  type: string;
  size?: string;
}

export interface LineOpts {
  /** Stacking axis: "z" = run north→south, "x" = run west→east. */
  axis: "z" | "x";
  /** Fixed coordinate on the cross axis (x when axis="z", else z). */
  cross: number;
  /** Edge where the run starts on the stacking axis. */
  start: number;
  door: DoorFace;
  /** "depthX" = unit long axis runs east–west; "depthZ" = north–south. */
  orient: "depthX" | "depthZ";
  gap?: number;
}

/** Lay a run of units along one axis, accumulating each unit's real extent. */
export function placeLine(items: LineItem[], opts: LineOpts): PlacedUnit[] {
  const gap = opts.gap ?? 0.12;
  let cursor = opts.start;
  const out: PlacedUnit[] = [];
  for (const it of items) {
    const d = dimensionsFor(it.type, it.size);
    const fx = opts.orient === "depthX" ? d.length : d.width;
    const fz = opts.orient === "depthX" ? d.width : d.length;
    const along = opts.axis === "z" ? fz : fx;
    const center = cursor + along / 2;
    out.push({
      unitNumber: it.n,
      type: it.type,
      x: opts.axis === "z" ? opts.cross : center,
      z: opts.axis === "z" ? center : opts.cross,
      fx,
      fz,
      height: d.height,
      door: opts.door,
    });
    cursor += along + gap;
  }
  return out;
}

export const seq = (a: number, b: number): number[] =>
  a <= b
    ? Array.from({ length: b - a + 1 }, (_, i) => a + i)
    : Array.from({ length: a - b + 1 }, (_, i) => a - i);

export function boundsOf(
  units: PlacedUnit[],
  margin = 3,
): { minX: number; maxX: number; minZ: number; maxZ: number } {
  let minX = Infinity,
    maxX = -Infinity,
    minZ = Infinity,
    maxZ = -Infinity;
  for (const u of units) {
    minX = Math.min(minX, u.x - u.fx / 2);
    maxX = Math.max(maxX, u.x + u.fx / 2);
    minZ = Math.min(minZ, u.z - u.fz / 2);
    maxZ = Math.max(maxZ, u.z + u.fz / 2);
  }
  return {
    minX: minX - margin,
    maxX: maxX + margin,
    minZ: minZ - margin,
    maxZ: maxZ + margin,
  };
}
