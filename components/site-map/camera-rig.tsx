"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { FacilityLayout } from "@/lib/site-map/types";

interface Waypoint {
  pos: THREE.Vector3;
  look: THREE.Vector3;
}

type Ctrl = { target: THREE.Vector3; update: () => void; enabled: boolean } | null;

// Toggle OrbitControls during scripted camera moves (intended drei API).
function setControlsEnabled(ctrl: Ctrl, enabled: boolean) {
  if (ctrl) ctrl.enabled = enabled;
}

interface Props {
  bounds: FacilityLayout["bounds"];
  focusTarget: { x: number; z: number } | null;
  tourToken: number; // increments to (re)start a tour
  resetToken: number; // increments to glide back to overview
  onTourComplete: () => void;
}

export function CameraRig({
  bounds,
  focusTarget,
  tourToken,
  resetToken,
  onTourComplete,
}: Props) {
  const { camera, controls } = useThree();

  const center = useMemo(
    () =>
      new THREE.Vector3(
        (bounds.minX + bounds.maxX) / 2,
        0,
        (bounds.minZ + bounds.maxZ) / 2,
      ),
    [bounds],
  );

  const overview = useMemo(() => {
    const size = Math.max(bounds.maxX - bounds.minX, bounds.maxZ - bounds.minZ);
    return new THREE.Vector3(
      center.x + size * 0.5,
      size * 0.78,
      center.z + size * 0.92,
    );
  }, [bounds, center]);

  const queue = useRef<Waypoint[]>([]);
  const running = useRef(false);
  const wasTour = useRef(false);

  // Initial framing.
  useEffect(() => {
    const ctrl = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!ctrl) return;
    ctrl.target.copy(center);
    ctrl.update();
  }, [controls, center]);

  // Fly to a selected unit.
  useEffect(() => {
    if (!focusTarget) return;
    queue.current = [
      {
        pos: new THREE.Vector3(focusTarget.x + 7, 6.5, focusTarget.z + 9),
        look: new THREE.Vector3(focusTarget.x, 1.4, focusTarget.z),
      },
    ];
    wasTour.current = false;
  }, [focusTarget]);

  // Scripted ground-level tour that glides down the driveway, returning to overview.
  useEffect(() => {
    if (tourToken === 0) return;
    const width = bounds.maxX - bounds.minX;
    const depth = bounds.maxZ - bounds.minZ;

    if (width >= depth) {
      // Driveway runs east–west: traverse along X at ground level.
      queue.current = [
        {
          pos: new THREE.Vector3(bounds.minX + 2, 2.3, center.z),
          look: new THREE.Vector3(bounds.maxX, 2, center.z),
        },
        {
          pos: new THREE.Vector3(center.x - width * 0.18, 1.9, center.z),
          look: new THREE.Vector3(center.x, 2, bounds.minZ),
        },
        {
          pos: new THREE.Vector3(center.x + width * 0.18, 1.9, center.z),
          look: new THREE.Vector3(center.x, 2, bounds.maxZ),
        },
        { pos: overview.clone(), look: center.clone() },
      ];
    } else {
      // Driveway runs north–south: traverse along Z.
      queue.current = [
        {
          pos: new THREE.Vector3(center.x, 2.3, bounds.maxZ - 2),
          look: new THREE.Vector3(center.x, 2, bounds.minZ),
        },
        {
          pos: new THREE.Vector3(center.x, 1.9, center.z + depth * 0.12),
          look: new THREE.Vector3(center.x + 4, 2, center.z),
        },
        {
          pos: new THREE.Vector3(center.x, 1.9, center.z - depth * 0.12),
          look: new THREE.Vector3(center.x - 4, 2, center.z),
        },
        { pos: overview.clone(), look: center.clone() },
      ];
    }
    wasTour.current = true;
  }, [tourToken, bounds, center, overview]);

  // Glide back to the overview framing.
  useEffect(() => {
    if (resetToken === 0) return;
    queue.current = [{ pos: overview.clone(), look: center.clone() }];
    wasTour.current = false;
  }, [resetToken, overview, center]);

  useFrame((_, dt) => {
    const ctrl = controls as unknown as Ctrl;

    if (queue.current.length === 0) {
      if (running.current) {
        running.current = false;
        setControlsEnabled(ctrl, true);
      }
      return;
    }
    if (!running.current) {
      running.current = true;
      setControlsEnabled(ctrl, false);
    }

    const wp = queue.current[0];
    const a = 1 - Math.pow(0.0016, Math.min(dt, 0.05));
    camera.position.lerp(wp.pos, a);
    if (ctrl) {
      ctrl.target.lerp(wp.look, a);
      ctrl.update();
    } else {
      camera.lookAt(wp.look);
    }

    if (camera.position.distanceTo(wp.pos) < 0.4) {
      queue.current.shift();
      if (queue.current.length === 0 && wasTour.current) {
        wasTour.current = false;
        onTourComplete();
      }
    }
  });

  return null;
}
