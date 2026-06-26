import type { FacilityLayout, FacilityMeta } from "./types";
import { fergusonDriveLayout } from "./layouts/ferguson-drive";
import { ulverstoneLayout } from "./layouts/ulverstone";
import { penguinLayout } from "./layouts/penguin";
import { deeganMarineLayout } from "./layouts/deegan-marine";
import { bayDriveLayout } from "./layouts/bay-drive";
import { marconiCourtLayout } from "./layouts/marconi-court";

/**
 * Registry of the 6 storage facilities. `dbName` MUST match storage_units.facility
 * exactly. Only facilities with `layoutReady: true` have a hand-built 3D layout;
 * the rest are listed so the index page and slug routing already know about them.
 */
export const FACILITIES: FacilityMeta[] = [
  {
    slug: "ferguson-drive",
    dbName: "Ferguson Drive",
    name: "Ferguson Drive",
    address: "7 Ferguson Drive",
    suburb: "Spreyton, TAS 7310",
    blurb:
      "Secure brick sheds and shipping containers with 24/7 drive-up access, moments from the Bass Highway.",
    layoutReady: true,
  },
  {
    slug: "bay-drive",
    dbName: "Bay Drive",
    name: "Bay Drive",
    address: "17 Bay Drive",
    suburb: "Tasmania 7310",
    blurb: "A large multi-size storage yard — sheds and containers to suit any load.",
    layoutReady: true,
  },
  {
    slug: "marconi-court",
    dbName: "Marconi Court",
    name: "Marconi Court",
    address: "9 Marconi Court",
    suburb: "Tasmania 7310",
    blurb: "Our largest facility, with 180+ sheds and containers across the site.",
    layoutReady: true,
  },
  {
    slug: "ulverstone",
    dbName: "Ulverstone",
    name: "Ulverstone",
    address: "45 Fieldings Way",
    suburb: "Ulverstone, TAS",
    blurb: "Roller-door units and containers with on-site car spaces.",
    layoutReady: true,
  },
  {
    slug: "deegan-marine",
    dbName: "Deegan Marine",
    name: "Deegan Marine",
    address: "Deegan Marine site",
    suburb: "Tasmania",
    blurb: "Roller-door units and containers alongside the Deegan Marine yard.",
    layoutReady: true,
  },
  {
    slug: "penguin",
    dbName: "Penguin",
    name: "Penguin",
    address: "780 South Road",
    suburb: "Penguin, TAS",
    blurb: "Roller-door units, work sheds and containers — with more coming soon.",
    layoutReady: true,
  },
];

const LAYOUTS: Record<string, FacilityLayout> = {
  "ferguson-drive": fergusonDriveLayout,
  ulverstone: ulverstoneLayout,
  penguin: penguinLayout,
  "deegan-marine": deeganMarineLayout,
  "bay-drive": bayDriveLayout,
  "marconi-court": marconiCourtLayout,
};

export function getFacilityBySlug(slug: string): FacilityMeta | undefined {
  return FACILITIES.find((f) => f.slug === slug);
}

export function getLayout(slug: string): FacilityLayout | undefined {
  return LAYOUTS[slug];
}
