import { NextResponse } from "next/server";
import { getFacilityBySlug } from "@/lib/site-map/facilities";
import { fetchFacilityUnits } from "@/lib/site-map/units";

/**
 * Public, read-only live units for a facility's 3D site map.
 * Returns only public-safe fields (no bond). Used by the client to refresh
 * availability without exposing the service-role key to the browser.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);
  if (!facility) {
    return NextResponse.json({ error: "Unknown facility" }, { status: 404 });
  }

  try {
    const units = await fetchFacilityUnits(facility.dbName);
    return NextResponse.json(
      { units },
      { headers: { "Cache-Control": "public, max-age=15, s-maxage=15" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to load availability" },
      { status: 502 },
    );
  }
}
