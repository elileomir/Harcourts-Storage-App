"use client";

import { OrbitControls, Html } from "@react-three/drei";
import type { FacilityLayout, SceneUnit } from "@/lib/site-map/types";
import { UnitMesh } from "./unit-mesh";
import { CameraRig } from "./camera-rig";

interface Props {
  layout: FacilityLayout;
  units: SceneUnit[];
  selected: string | null;
  hovered: string | null;
  onSelect: (n: string | null) => void;
  onHover: (n: string | null) => void;
  filterAvailable: boolean;
  showLabels: boolean;
  focusTarget: { x: number; z: number } | null;
  tourToken: number;
  resetToken: number;
  onTourComplete: () => void;
}

export function Scene({
  layout,
  units,
  selected,
  hovered,
  onSelect,
  onHover,
  filterAvailable,
  showLabels,
  focusTarget,
  tourToken,
  resetToken,
  onTourComplete,
}: Props) {
  const { bounds } = layout;
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const padW = bounds.maxX - bounds.minX + 6;
  const padD = bounds.maxZ - bounds.minZ + 6;
  const shadowSpan = Math.max(padW, padD) * 0.75;
  // Perf: per-unit slat/rib detail on smaller sites. Numbers are in-canvas SDF
  // text (cheap), so they show on every facility.
  const detail = units.length <= 60;

  return (
    <>
      <color attach="background" args={["#eef2f6"]} />
      <fog attach="fog" args={["#eef2f6", shadowSpan * 1.6, shadowSpan * 4.5]} />

      <hemisphereLight args={["#dcf2ff", "#cdc8be", 1.0]} />
      <ambientLight intensity={0.28} />
      <directionalLight
        position={[cx - 28, 42, cz - 18]}
        intensity={1.45}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera
          attach="shadow-camera"
          args={[-shadowSpan, shadowSpan, shadowSpan, -shadowSpan, 1, 140]}
        />
      </directionalLight>

      {/* Grass surround (infinite-ish) */}
      <mesh
        position={[cx, -0.02, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[600, 600]} />
        <meshStandardMaterial color="#d8e2d4" roughness={1} />
      </mesh>

      {/* Property pad / concrete */}
      <mesh position={[cx, 0, cz]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[padW, padD]} />
        <meshStandardMaterial color="#e8ecf0" roughness={0.95} />
      </mesh>

      {/* Driveways */}
      {layout.features
        .filter((f) => f.kind === "driveway")
        .map((f, i) => (
          <mesh
            key={`drive-${i}`}
            position={[f.x, 0.012, f.z]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[f.fx, f.fz]} />
            <meshStandardMaterial color="#c9d1da" roughness={0.9} />
          </mesh>
        ))}

      {/* Buildings (context, non-rentable) */}
      {layout.features
        .filter((f) => f.kind === "building")
        .map((f, i) => (
          <group key={`bld-${i}`}>
            <mesh position={[f.x, 1.7, f.z]} castShadow receiveShadow>
              <boxGeometry args={[f.fx, 3.4, f.fz]} />
              <meshStandardMaterial color="#c4ccd5" roughness={0.85} />
            </mesh>
            {f.label && (
              <Html
                position={[f.x, 3.8, f.z]}
                center
                distanceFactor={50}
                style={{ pointerEvents: "none" }}
              >
                <div className="whitespace-nowrap rounded-md bg-white/80 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-[#001F49]/55 backdrop-blur">
                  {f.label}
                </div>
              </Html>
            )}
          </group>
        ))}

      {/* Car parks (context) */}
      {layout.features
        .filter((f) => f.kind === "carpark")
        .map((f, i) => (
          <group key={`car-${i}`}>
            <mesh
              position={[f.x, 0.02, f.z]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <planeGeometry args={[f.fx, f.fz]} />
              <meshStandardMaterial color="#d3dae1" roughness={0.95} />
            </mesh>
            {f.label && (
              <Html
                position={[f.x, 0.4, f.z]}
                center
                distanceFactor={46}
                style={{ pointerEvents: "none" }}
              >
                <div className="whitespace-nowrap text-[11px] font-semibold uppercase tracking-wide text-[#001F49]/40">
                  {f.label}
                </div>
              </Html>
            )}
          </group>
        ))}

      {/* Units */}
      {units.map((u) => {
        const isSel = selected === u.unitNumber;
        const isHov = hovered === u.unitNumber;
        return (
          <UnitMesh
            key={u.unitNumber}
            unit={u}
            selected={isSel}
            hovered={isHov}
            dimmed={filterAvailable && u.status !== "Available"}
            showLabel={showLabels || isSel || isHov}
            detail={detail}
            onSelect={onSelect}
            onHover={onHover}
          />
        );
      })}

      {/* Entry markers */}
      {layout.entries.map((e, i) => (
        <Html
          key={`entry-${i}`}
          position={[e.x, 0.6, e.z]}
          center
          distanceFactor={40}
          style={{ pointerEvents: "none" }}
        >
          <div className="flex items-center gap-1 rounded-full border border-[#001F49]/15 bg-white/85 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#001F49] shadow-sm backdrop-blur">
            <span className="text-[#00ADEF]">▸</span>
            {e.label}
          </div>
        </Html>
      ))}

      {/* Deselect when clicking empty ground */}
      <mesh
        position={[cx, -0.05, cz]}
        rotation={[-Math.PI / 2, 0, 0]}
        onClick={() => onSelect(null)}
      >
        <planeGeometry args={[600, 600]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={6}
        maxDistance={shadowSpan * 3}
        maxPolarAngle={Math.PI / 2.05}
        target={[cx, 0, cz]}
      />
      <CameraRig
        bounds={bounds}
        focusTarget={focusTarget}
        tourToken={tourToken}
        resetToken={resetToken}
        onTourComplete={onTourComplete}
      />
    </>
  );
}

export const initialCameraPosition = (
  bounds: FacilityLayout["bounds"],
): [number, number, number] => {
  const cx = (bounds.minX + bounds.maxX) / 2;
  const cz = (bounds.minZ + bounds.maxZ) / 2;
  const size = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
  return [cx + size * 0.5, size * 0.78, cz + size * 0.92];
};
