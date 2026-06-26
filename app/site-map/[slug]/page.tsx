import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { getFacilityBySlug, getLayout } from "@/lib/site-map/facilities";
import { fetchFacilityUnits, mergeUnits } from "@/lib/site-map/units";
import { FacilityExperience } from "@/components/site-map/experience";

// Live availability — never cache the page itself.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);
  if (!facility) return { title: "Site Map | Harcourts" };
  return {
    title: `${facility.name} Storage — 3D Site Map | Harcourts`,
    description: `Explore an interactive 3D map of ${facility.name} (${facility.address}). See live unit availability, sizes and pricing. ${facility.blurb}`,
    openGraph: {
      title: `${facility.name} Storage — 3D Site Map`,
      description: facility.blurb,
    },
  };
}

export default async function SiteMapPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const facility = getFacilityBySlug(slug);
  if (!facility) notFound();

  const layout = getLayout(slug);
  if (!layout || !facility.layoutReady) {
    return <ComingSoon name={facility.name} address={facility.address} />;
  }

  let units;
  try {
    const live = await fetchFacilityUnits(facility.dbName);
    units = mergeUnits(layout.units, live);
  } catch {
    units = mergeUnits(layout.units, []);
  }

  return (
    <FacilityExperience facility={facility} layout={layout} initialUnits={units} />
  );
}

function ComingSoon({ name, address }: { name: string; address: string }) {
  return (
    <div className="font-body flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-[#eef2f6] px-6 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#00ADEF]">
        Harcourts Storage
      </p>
      <h1 className="text-3xl font-bold tracking-tight text-[#001F49] sm:text-4xl">
        {name}
      </h1>
      <p className="max-w-md text-[#001F49]/55">
        The interactive 3D map for {address} is being built. In the meantime,
        explore one of our other facilities.
      </p>
      <Link
        href="/site-map"
        className="mt-2 inline-flex items-center gap-2 rounded-full bg-[#001F49] px-5 py-3 text-sm font-semibold text-white transition active:scale-[0.97]"
      >
        <ArrowLeft className="h-4 w-4" />
        All facilities
      </Link>
    </div>
  );
}
