"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { Canvas } from "@react-three/fiber";
import {
  Compass,
  Play,
  Hash,
  Filter,
  X,
  ArrowUpRight,
  Maximize2,
  Ruler,
  Clock,
  Tag,
} from "lucide-react";
import { Scene, initialCameraPosition } from "./scene";
import type {
  FacilityLayout,
  FacilityMeta,
  LiveUnit,
  PlacedUnit,
  SceneUnit,
} from "@/lib/site-map/types";
import { STATUS_COLORS, STATUS_LABEL, dimensionLabel } from "@/lib/site-map/dimensions";

const ENQUIRE_URL =
  "https://harcourts.net/au/office/ulverstone-and-penguin/storage-units";
const WAITLIST_URL =
  "https://hup.app.n8n.cloud/form/ff09376b-f11d-4325-b11d-b8f11aaed986";
const LOGO =
  "https://resources.cloudhi.io/images/logo/harcourts-international-logo.svg";

function mergeLive(placed: PlacedUnit[], live: LiveUnit[]): SceneUnit[] {
  const m = new Map(live.map((u) => [u.unitNumber, u]));
  return placed.map((p) => {
    const l = m.get(p.unitNumber);
    return {
      ...p,
      status: l?.status ?? "Unavailable",
      size: l?.size,
      price: l?.price,
      accessHours: l?.accessHours,
    };
  });
}

interface Props {
  facility: FacilityMeta;
  layout: FacilityLayout;
  initialUnits: SceneUnit[];
}

export function FacilityExperience({ facility, layout, initialUnits }: Props) {
  const [units, setUnits] = useState<SceneUnit[]>(initialUnits);
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [filterAvailable, setFilterAvailable] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [ready, setReady] = useState(false);
  const [tourToken, setTourToken] = useState(0);
  const [resetToken, setResetToken] = useState(0);

  const placed = useRef(layout.units);

  // Live availability refresh.
  useEffect(() => {
    let alive = true;
    const tick = async () => {
      try {
        const res = await fetch(`/api/site-map/${facility.slug}`, {
          cache: "no-store",
        });
        if (!res.ok) return;
        const data: { units: LiveUnit[] } = await res.json();
        if (alive && data.units) setUnits(mergeLive(placed.current, data.units));
      } catch {
        /* keep last-known state */
      }
    };
    const id = setInterval(tick, 20000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [facility.slug]);

  const summary = useMemo(() => {
    const available = units.filter((u) => u.status === "Available").length;
    const reserved = units.filter((u) => u.status === "Submitted").length;
    return { total: units.length, available, reserved };
  }, [units]);

  const selectedUnit = useMemo(
    () => units.find((u) => u.unitNumber === selected) ?? null,
    [units, selected],
  );

  const focusTarget = useMemo(() => {
    const u = units.find((x) => x.unitNumber === selected);
    return u ? { x: u.x, z: u.z } : null;
  }, [units, selected]);

  const handleSelect = useCallback((n: string | null) => setSelected(n), []);
  const resetView = useCallback(() => {
    setSelected(null);
    setResetToken((t) => t + 1);
  }, []);

  return (
    <div className="font-body relative h-[100dvh] w-full overflow-hidden bg-[#eef2f6]">
      <Canvas
        shadows="soft"
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        camera={{
          position: initialCameraPosition(layout.bounds),
          fov: 38,
          near: 0.5,
          far: 3000,
        }}
        onCreated={() => setReady(true)}
      >
        <Suspense fallback={null}>
          <Scene
            layout={layout}
            units={units}
            selected={selected}
            hovered={hovered}
            onSelect={handleSelect}
            onHover={setHovered}
            filterAvailable={filterAvailable}
            showLabels={showLabels}
            focusTarget={focusTarget}
            tourToken={tourToken}
            resetToken={resetToken}
            onTourComplete={() => {}}
          />
        </Suspense>
      </Canvas>

      {/* Loading veil */}
      {!ready && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 bg-[#eef2f6]">
          <div className="h-9 w-9 animate-spin rounded-full border-[3px] border-[#001F49]/15 border-t-[#00ADEF]" />
          <p className="text-sm font-medium text-[#001F49]/60">
            Building {facility.name}…
          </p>
        </div>
      )}

      {/* ===== Overlay chrome ===== */}
      <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-3 sm:p-5">
        {/* Top bar */}
        <div className="flex items-start justify-between gap-3">
          <div className="pointer-events-auto flex items-center gap-3 rounded-2xl border border-white/60 bg-white/70 px-3.5 py-2.5 shadow-[0_8px_30px_-12px_rgba(0,31,73,0.35)] backdrop-blur-md sm:gap-4 sm:px-5 sm:py-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO} alt="Harcourts" className="h-7 w-auto sm:h-9" />
            <div className="h-8 w-px bg-[#001F49]/10" />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#00ADEF]">
                Storage Site Map
              </p>
              <h1 className="text-base font-bold tracking-tight text-[#001F49] sm:text-lg">
                {facility.name}
              </h1>
              <p className="hidden text-xs text-[#001F49]/55 sm:block">
                {facility.address} · {facility.suburb}
              </p>
            </div>
          </div>

          <SummaryPills {...summary} />
        </div>

        {/* Bottom bar */}
        <div className="flex items-end justify-between gap-3">
          <Legend />
          <Controls
            tour={() => {
              setSelected(null);
              setTourToken((t) => t + 1);
            }}
            reset={resetView}
            labels={showLabels}
            toggleLabels={() => setShowLabels((v) => !v)}
            filter={filterAvailable}
            toggleFilter={() => setFilterAvailable((v) => !v)}
          />
        </div>
      </div>

      {/* Unit detail */}
      {selectedUnit && (
        <UnitDetail
          unit={selectedUnit}
          facility={facility}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- */

function SummaryPills({
  total,
  available,
  reserved,
}: {
  total: number;
  available: number;
  reserved: number;
}) {
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/60 bg-white/70 px-3 py-2 shadow-[0_8px_30px_-12px_rgba(0,31,73,0.35)] backdrop-blur-md">
      <Stat value={available} label="Available" tone="cyan" />
      {reserved > 0 && <Stat value={reserved} label="Reserved" tone="amber" />}
      <Stat value={total} label="Units" tone="slate" />
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "cyan" | "amber" | "slate";
}) {
  const color =
    tone === "cyan"
      ? "text-[#00ADEF]"
      : tone === "amber"
        ? "text-[#e0921f]"
        : "text-[#001F49]";
  return (
    <div className="px-1.5 text-center">
      <div className={`text-lg font-bold leading-none tabular-nums ${color}`}>
        {value}
      </div>
      <div className="mt-0.5 text-[10px] font-medium uppercase tracking-wide text-[#001F49]/45">
        {label}
      </div>
    </div>
  );
}

function Legend() {
  const rows: { label: string; status: keyof typeof STATUS_COLORS }[] = [
    { label: "Available now", status: "Available" },
    { label: "Reserved", status: "Submitted" },
    { label: "Occupied", status: "Unavailable" },
  ];
  return (
    <div className="pointer-events-auto hidden rounded-2xl border border-white/60 bg-white/70 px-4 py-3 shadow-[0_8px_30px_-12px_rgba(0,31,73,0.35)] backdrop-blur-md sm:block">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#001F49]/45">
        Availability
      </p>
      <div className="flex flex-col gap-1.5">
        {rows.map((r) => (
          <div key={r.status} className="flex items-center gap-2">
            <span
              className="h-3 w-3 rounded-[3px] ring-1 ring-black/5"
              style={{ background: STATUS_COLORS[r.status].body }}
            />
            <span className="text-xs font-medium text-[#001F49]/70">
              {r.label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-2.5 max-w-[170px] border-t border-[#001F49]/8 pt-2 text-[10px] leading-snug text-[#001F49]/40">
        Indicative layout — unit positions and sizes are approximate, not to exact
        survey scale.
      </p>
    </div>
  );
}

function Controls({
  tour,
  reset,
  labels,
  toggleLabels,
  filter,
  toggleFilter,
}: {
  tour: () => void;
  reset: () => void;
  labels: boolean;
  toggleLabels: () => void;
  filter: boolean;
  toggleFilter: () => void;
}) {
  return (
    <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
      <PillButton onClick={tour} primary>
        <Play className="h-4 w-4" />
        <span className="hidden sm:inline">Take the tour</span>
      </PillButton>
      <PillButton onClick={toggleFilter} active={filter}>
        <Filter className="h-4 w-4" />
        <span className="hidden sm:inline">Available only</span>
      </PillButton>
      <PillButton onClick={toggleLabels} active={labels}>
        <Hash className="h-4 w-4" />
        <span className="hidden md:inline">Numbers</span>
      </PillButton>
      <PillButton onClick={reset}>
        <Compass className="h-4 w-4" />
        <span className="hidden md:inline">Reset view</span>
      </PillButton>
    </div>
  );
}

function PillButton({
  children,
  onClick,
  primary,
  active,
}: {
  children: ReactNode;
  onClick: () => void;
  primary?: boolean;
  active?: boolean;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-semibold shadow-[0_8px_30px_-12px_rgba(0,31,73,0.4)] backdrop-blur-md transition-all duration-150 active:scale-[0.96]";
  const style = primary
    ? "bg-[#00ADEF] text-white hover:bg-[#0099d4]"
    : active
      ? "bg-[#001F49] text-white hover:bg-[#0a2c5c] border border-white/10"
      : "bg-white/70 text-[#001F49] hover:bg-white border border-white/60";
  return (
    <button onClick={onClick} className={`${base} ${style}`}>
      {children}
    </button>
  );
}

function UnitDetail({
  unit,
  facility,
  onClose,
}: {
  unit: SceneUnit;
  facility: FacilityMeta;
  onClose: () => void;
}) {
  const palette = STATUS_COLORS[unit.status];
  const isAvailable = unit.status === "Available";
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto absolute inset-x-3 bottom-3 z-30 sm:inset-x-auto sm:right-5 sm:top-24 sm:bottom-auto sm:w-80">
      <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/90 shadow-[0_24px_60px_-20px_rgba(0,31,73,0.5)] backdrop-blur-xl">
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ background: palette.body }}
        >
          <div className="leading-tight text-white">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-white/80">
              Unit
            </p>
            <p className="text-2xl font-bold tabular-nums">{unit.unitNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 p-1.5 text-white transition active:scale-90"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 p-5">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
              style={{
                background: isAvailable ? "#00ADEF18" : "#001F4910",
                color: isAvailable ? "#0090c7" : "#475569",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: palette.body }}
              />
              {STATUS_LABEL[unit.status]}
            </span>
          </div>

          <Row icon={<Tag className="h-4 w-4" />} label="Type" value={unit.type} />
          <Row
            icon={<Ruler className="h-4 w-4" />}
            label="Dimensions"
            value={dimensionLabel(unit.type, unit.size)}
          />
          {unit.price && (
            <Row
              icon={<Maximize2 className="h-4 w-4" />}
              label="Price"
              value={`$${unit.price} / month`}
            />
          )}
          {unit.accessHours && (
            <Row
              icon={<Clock className="h-4 w-4" />}
              label="Access"
              value={unit.accessHours}
            />
          )}

          <a
            href={isAvailable ? ENQUIRE_URL : WAITLIST_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-1 flex w-full items-center justify-center gap-1.5 rounded-full px-4 py-3 text-sm font-semibold transition-all active:scale-[0.97] ${
              isAvailable
                ? "bg-[#00ADEF] text-white hover:bg-[#0099d4]"
                : "bg-[#001F49] text-white hover:bg-[#0a2c5c]"
            }`}
          >
            {isAvailable ? "Enquire about this unit" : "Join the waitlist"}
            <ArrowUpRight className="h-4 w-4" />
          </a>
          <p className="text-center text-[11px] text-[#001F49]/40">
            {facility.name} · {facility.address}
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#001F49]/5 pb-2.5 last:border-0">
      <span className="flex items-center gap-2 text-xs font-medium text-[#001F49]/50">
        {icon}
        {label}
      </span>
      <span className="text-right text-sm font-semibold text-[#001F49]">
        {value}
      </span>
    </div>
  );
}
