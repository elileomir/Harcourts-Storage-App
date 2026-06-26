// Shared types for the public 3D storage site-map experience.

/** Live status as stored in storage_units.status */
export type UnitStatus = "Available" | "Submitted" | "Unavailable";

/** Real-world footprint of a unit, in metres. Source: facility plan legends. */
export interface UnitDimensions {
  /** Length along the unit's local long axis (metres). */
  length: number;
  /** Width along the unit's local short axis (metres). */
  width: number;
  /** Height to roof (metres). */
  height: number;
}

/** Compass-ish facing for the roller door / opening. */
export type DoorFace = "N" | "S" | "E" | "W";

/**
 * A single placed unit in the 3D scene. Position is the footprint CENTRE in
 * metres on the ground plane (x = east, z = south). Footprint extents are the
 * real dimensions already rotated into world axes.
 */
export interface PlacedUnit {
  unitNumber: string;
  type: string;
  /** centre X (m) */
  x: number;
  /** centre Z (m) */
  z: number;
  /** footprint extent along world X (m) */
  fx: number;
  /** footprint extent along world Z (m) */
  fz: number;
  /** roof height (m) */
  height: number;
  /** which face the door sits on */
  door: DoorFace;
}

/** Live data merged onto a placed unit (from storage_units). */
export interface LiveUnit {
  unitNumber: string;
  type: string;
  size: string;
  price: string;
  accessHours: string;
  status: UnitStatus;
}

/** A unit ready to render: geometry + (optional) live data. */
export interface SceneUnit extends PlacedUnit {
  size?: string;
  price?: string;
  accessHours?: string;
  status: UnitStatus;
}

/** Non-rentable site features drawn for context (driveways, buildings, gates). */
export interface SiteFeature {
  kind: "driveway" | "building" | "gate" | "carpark";
  label?: string;
  x: number;
  z: number;
  fx: number;
  fz: number;
}

export interface EntryMarker {
  label: string;
  x: number;
  z: number;
  /** rotation of the arrow in degrees (0 = pointing +Z/south) */
  rotation: number;
}

export interface FacilityLayout {
  units: PlacedUnit[];
  features: SiteFeature[];
  entries: EntryMarker[];
  /** Scene bounds for camera framing & ground sizing (metres). */
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
}

export interface FacilityMeta {
  /** URL slug, e.g. "ferguson-drive" */
  slug: string;
  /** Exact storage_units.facility value */
  dbName: string;
  /** Public display name */
  name: string;
  /** Street address as shown on the plan */
  address: string;
  suburb: string;
  /** One-line description for the public page */
  blurb: string;
  /** Whether a hand-built precise layout exists yet */
  layoutReady: boolean;
}

/** Legend entry: a unit type with its colour + real dimensions for the key. */
export interface LegendType {
  type: string;
  /** human dimension label, e.g. "7.5 × 3.5 × 2.8 m" */
  dimensionLabel: string;
}
