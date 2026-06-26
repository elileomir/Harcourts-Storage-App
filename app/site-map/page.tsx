import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, Box, MapPin } from "lucide-react";
import { FACILITIES } from "@/lib/site-map/facilities";
import { fetchAvailabilityByFacility } from "@/lib/site-map/units";
import type { FacilityMeta } from "@/lib/site-map/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Storage Site Maps — Explore in 3D | Harcourts",
  description:
    "Browse our self-storage facilities in interactive 3D. See live unit availability, sizes and pricing across Tasmania's North-West coast.",
};

const LOGO =
  "https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg";

type Counts = Record<string, { available: number; total: number }>;

export default async function SiteMapIndex() {
  let counts: Counts = {};
  try {
    counts = await fetchAvailabilityByFacility();
  } catch {
    counts = {};
  }

  const ready = FACILITIES.filter((f) => f.layoutReady);
  const totalAvailable = Object.values(counts).reduce(
    (s, c) => s + c.available,
    0,
  );

  // Hero = the facility with the most available units, else the largest.
  const hero =
    [...ready].sort(
      (a, b) =>
        (counts[b.dbName]?.available ?? 0) - (counts[a.dbName]?.available ?? 0) ||
        (counts[b.dbName]?.total ?? 0) - (counts[a.dbName]?.total ?? 0),
    )[0] ?? ready[0];
  const rest = FACILITIES.filter((f) => f.slug !== hero?.slug);

  return (
    <div className="font-body min-h-[100dvh] bg-[#eef2f6] text-[#001F49]">
      <div className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-16">
        {/* Header */}
        <header className="flex flex-col gap-6 border-b border-[#001F49]/10 pb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Harcourts" className="mb-6 h-10 w-auto" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#00ADEF]">
              Self-Storage · North-West Tasmania
            </p>
            <h1 className="mt-2 text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Walk the yard
              <br />
              before you book.
            </h1>
            <p className="mt-4 max-w-md text-[17px] leading-relaxed text-[#001F49]/60">
              Every facility, mapped in 3D to real dimensions. Spin, zoom and
              click any unit to see what&apos;s available right now.
            </p>
          </div>
          <div className="flex gap-3">
            <Stat value={FACILITIES.length} label="Facilities" />
            <Stat value={totalAvailable} label="Available now" accent />
          </div>
        </header>

        {/* Hero + grid */}
        <section className="mt-10 grid gap-5 lg:grid-cols-3">
          {hero && (
            <HeroCard facility={hero} c={counts[hero.dbName]} />
          )}
          {rest.map((f) => (
            <FacilityCard key={f.slug} facility={f} c={counts[f.dbName]} />
          ))}
        </section>

        <footer className="mt-14 border-t border-[#001F49]/10 pt-6 text-center text-xs text-[#001F49]/40">
          Harcourts Storage · Live availability updates automatically · Indicative
          3D layouts, not to exact survey scale.
        </footer>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  accent,
}: {
  value: number;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/60 bg-white/70 px-5 py-4 text-center backdrop-blur-md">
      <div
        className={`text-3xl font-bold tabular-nums ${accent ? "text-[#00ADEF]" : "text-[#001F49]"}`}
      >
        {value}
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-[#001F49]/45">
        {label}
      </div>
    </div>
  );
}

function HeroCard({
  facility: f,
  c,
}: {
  facility: FacilityMeta;
  c?: { available: number; total: number };
}) {
  return (
    <Link
      href={`/site-map/${f.slug}`}
      className="group relative col-span-1 flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[28px] border border-white/60 bg-gradient-to-br from-[#001F49] to-[#0a3168] p-6 text-white shadow-[0_24px_60px_-24px_rgba(0,31,73,0.6)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_70px_-24px_rgba(0,31,73,0.7)] lg:col-span-2 lg:row-span-2"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-[#00ADEF]/25 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
        aria-hidden
      />
      <div className="relative flex items-start justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00ADEF] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide">
            <Box className="h-3 w-3" /> Explore in 3D
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            {f.name}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-white/60">
            <MapPin className="h-3.5 w-3.5" />
            {f.address}, {f.suburb}
          </p>
        </div>
        <ArrowUpRight className="h-6 w-6 text-white/40 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:text-[#00ADEF]" />
      </div>
      <div className="relative flex items-end justify-between">
        <p className="max-w-sm text-sm leading-relaxed text-white/70">{f.blurb}</p>
        {c && (
          <div className="text-right">
            <div className="text-3xl font-bold tabular-nums text-[#00ADEF]">
              {c.available}
            </div>
            <div className="text-[11px] uppercase tracking-wide text-white/45">
              of {c.total} free
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

function FacilityCard({
  facility: f,
  c,
}: {
  facility: FacilityMeta;
  c?: { available: number; total: number };
}) {
  const hasFree = (c?.available ?? 0) > 0;
  return (
    <Link
      href={`/site-map/${f.slug}`}
      className="group flex min-h-[150px] flex-col justify-between rounded-[24px] border border-[#001F49]/8 bg-white/70 p-5 backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00ADEF]/40 hover:bg-white hover:shadow-[0_16px_40px_-20px_rgba(0,31,73,0.4)]"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold tracking-tight">{f.name}</h3>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-[#001F49]/50">
            <MapPin className="h-3 w-3" />
            {f.address}
          </p>
        </div>
        <ArrowUpRight className="h-5 w-5 text-[#001F49]/25 transition-all duration-200 group-hover:text-[#00ADEF]" />
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[#001F49]/45">
          {c ? `${c.total} units` : "Explore in 3D"}
        </span>
        {hasFree ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00ADEF]/12 px-2 py-0.5 text-xs font-semibold text-[#0090c7]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00ADEF]" />
            {c?.available} available
          </span>
        ) : (
          <span className="text-xs font-medium text-[#001F49]/35">Fully booked</span>
        )}
      </div>
    </Link>
  );
}
