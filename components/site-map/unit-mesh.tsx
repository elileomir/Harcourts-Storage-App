"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text, Billboard } from "@react-three/drei";
import * as THREE from "three";

const LABEL_FONT = "/fonts/source-sans-3-600.woff";
const LABEL_COLOR: Record<string, string> = {
  Available: "#0096cf",
  Submitted: "#d9871a",
  Unavailable: "#2b3a4f",
};
import type { SceneUnit } from "@/lib/site-map/types";
import { STATUS_COLORS } from "@/lib/site-map/dimensions";

interface Props {
  unit: SceneUnit;
  selected: boolean;
  hovered: boolean;
  dimmed: boolean;
  showLabel: boolean;
  detail: boolean; // render slats/ribbing (perf-gated for large sites)
  onSelect: (n: string) => void;
  onHover: (n: string | null) => void;
}

const MONUMENT = "#2b2f36"; // Colorbond charcoal — tracks, handle, trims

// Shared hip/gable-ish roof geometry (1×1 footprint, apex at y=1).
function useRoofGeometry() {
  return useMemo(() => {
    const g = new THREE.ConeGeometry(Math.SQRT1_2, 1, 4);
    g.rotateY(Math.PI / 4);
    g.translate(0, 0.5, 0);
    return g;
  }, []);
}

export function UnitMesh({
  unit,
  selected,
  hovered,
  dimmed,
  showLabel,
  detail,
  onSelect,
  onHover,
}: Props) {
  const group = useRef<THREE.Group>(null);
  const roofGeo = useRoofGeometry();
  const palette = STATUS_COLORS[unit.status];

  const isContainer = /container/i.test(unit.type);
  const isShed = !isContainer;
  const wallH = isShed ? unit.height * 0.8 : unit.height;
  const ridgeH = isShed ? unit.height * 0.42 : 0;

  // Door-face frame: a roller door (sheds/roller units) or container end.
  const frame = useMemo(() => {
    const faceX = unit.door === "E" ? 1 : unit.door === "W" ? -1 : 0;
    const faceZ = unit.door === "S" ? 1 : unit.door === "N" ? -1 : 0;
    const horiz = unit.door === "N" || unit.door === "S"; // door width along X
    const w = Math.min(unit.fx, unit.fz) * 0.66;
    const h = wallH * 0.82;
    const cx = (faceX * unit.fx) / 2;
    const cz = (faceZ * unit.fz) / 2;
    const out = 0.015; // push details just proud of the wall
    return { faceX, faceZ, horiz, w, h, cx, cz, ox: faceX * out, oz: faceZ * out };
  }, [unit.door, unit.fx, unit.fz, wallH]);

  const slats = useMemo(() => {
    if (!detail) return [];
    const { horiz, w, h } = frame;
    if (isContainer) {
      // Vertical ribbing across the door wall.
      const n = 6;
      return Array.from({ length: n }, (_, i) => {
        const t = (i / (n - 1) - 0.5) * w;
        return horiz
          ? { pos: [t, h / 2, 0] as const, size: [0.05, h, 0.06] as const }
          : { pos: [0, h / 2, t] as const, size: [0.06, h, 0.05] as const };
      });
    }
    // Horizontal roller-door slats.
    const n = 5;
    return Array.from({ length: n }, (_, i) => {
      const y = (h * (i + 0.5)) / n;
      return horiz
        ? { pos: [0, y, 0] as const, size: [w, 0.035, 0.07] as const }
        : { pos: [0, y, 0] as const, size: [0.07, 0.035, w] as const };
    });
  }, [detail, frame, isContainer]);

  // Hover/select lift.
  const lift = useRef(0);
  useFrame((_, dt) => {
    if (!group.current) return;
    const target = selected ? 0.5 : hovered ? 0.22 : 0;
    lift.current += (target - lift.current) * Math.min(1, dt * 10);
    group.current.position.y = lift.current;
  });

  const emissiveBoost = selected ? 0.6 : hovered ? 0.35 : 0;
  const opacity = dimmed ? 0.26 : 1;
  const trackSize: readonly [number, number, number] = frame.horiz
    ? [0.09, frame.h, 0.1]
    : [0.1, frame.h, 0.09];

  return (
    <group
      position={[unit.x, 0, unit.z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(unit.unitNumber);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover(unit.unitNumber);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover(null);
        document.body.style.cursor = "auto";
      }}
    >
      <group ref={group}>
        {/* Walls */}
        <mesh position={[0, wallH / 2, 0]} castShadow receiveShadow>
          <boxGeometry args={[unit.fx, wallH, unit.fz]} />
          <meshStandardMaterial
            color={palette.body}
            emissive={palette.emissive}
            emissiveIntensity={palette.emissiveIntensity + emissiveBoost}
            roughness={0.62}
            metalness={0.06}
            transparent
            opacity={opacity}
          />
        </mesh>

        {/* Roof */}
        {isShed ? (
          <mesh
            geometry={roofGeo}
            position={[0, wallH, 0]}
            scale={[unit.fx * 1.05, ridgeH, unit.fz * 1.05]}
            castShadow
          >
            <meshStandardMaterial
              color={palette.roof}
              roughness={0.68}
              transparent
              opacity={opacity}
            />
          </mesh>
        ) : (
          <mesh position={[0, unit.height + 0.05, 0]} castShadow>
            <boxGeometry args={[unit.fx * 1.02, 0.14, unit.fz * 1.02]} />
            <meshStandardMaterial
              color={palette.roof}
              roughness={0.7}
              transparent
              opacity={opacity}
            />
          </mesh>
        )}

        {/* Door panel */}
        <mesh position={[frame.cx + frame.ox, frame.h / 2, frame.cz + frame.oz]}>
          <boxGeometry
            args={frame.horiz ? [frame.w, frame.h, 0.06] : [0.06, frame.h, frame.w]}
          />
          <meshStandardMaterial
            color={unit.status === "Available" ? "#eafaff" : "#586472"}
            roughness={0.5}
            metalness={0.25}
            transparent
            opacity={dimmed ? 0.22 : 1}
          />
        </mesh>

        {/* Slats / ribbing */}
        {!dimmed &&
          slats.map((s, i) => (
            <mesh
              key={i}
              position={[
                frame.cx + s.pos[0] + frame.ox * 1.6,
                s.pos[1],
                frame.cz + s.pos[2] + frame.oz * 1.6,
              ]}
            >
              <boxGeometry args={s.size} />
              <meshStandardMaterial color={MONUMENT} roughness={0.6} />
            </mesh>
          ))}

        {/* Guide tracks + handle */}
        {!dimmed && (
          <>
            {(frame.horiz
              ? [-frame.w / 2, frame.w / 2].map((d) => [d, 0] as const)
              : [-frame.w / 2, frame.w / 2].map((d) => [0, d] as const)
            ).map(([dx, dz], i) => (
              <mesh
                key={`trk-${i}`}
                position={[
                  frame.cx + dx + frame.ox,
                  frame.h / 2,
                  frame.cz + dz + frame.oz,
                ]}
              >
                <boxGeometry args={trackSize} />
                <meshStandardMaterial color={MONUMENT} roughness={0.55} />
              </mesh>
            ))}
            <mesh
              position={[
                frame.cx + frame.ox * 2,
                frame.h * 0.16,
                frame.cz + frame.oz * 2,
              ]}
            >
              <boxGeometry
                args={
                  frame.horiz
                    ? [frame.w * 0.42, 0.09, 0.08]
                    : [0.08, 0.09, frame.w * 0.42]
                }
              />
              <meshStandardMaterial color={MONUMENT} metalness={0.4} roughness={0.4} />
            </mesh>
          </>
        )}

        {showLabel && !dimmed && (
          <Billboard position={[0, unit.height + ridgeH + 0.6, 0]}>
            <Text
              font={LABEL_FONT}
              fontSize={1.15}
              color={LABEL_COLOR[unit.status]}
              anchorX="center"
              anchorY="middle"
              outlineWidth={0.085}
              outlineColor="#ffffff"
              outlineOpacity={0.9}
            >
              {unit.unitNumber}
            </Text>
          </Billboard>
        )}
      </group>
    </group>
  );
}
