/**
 * city/useFlightControls.ts — Free-flight keyboard navigation over the city.
 *
 * OrbitControls alone only lets you circle a fixed point: you can look at the
 * spot the timeline chose, but not travel anywhere else. This moves the camera
 * and its orbit target together, so W/S/A/D fly across the city, Q/E change
 * altitude, and the arrow keys swing the view — while the mouse keeps orbiting
 * and zooming as before.
 *
 * Movement is frame-rate independent (units per second) and scales with how far
 * the camera is from its target, so the same keypress feels right whether you
 * are down among the buildings or looking at the whole corridor.
 */
import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Vector3, type PerspectiveCamera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";

const MOVE_KEYS = new Set([
  "KeyW",
  "KeyA",
  "KeyS",
  "KeyD",
  "KeyQ",
  "KeyE",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

/**
 * Fraction of the orbit distance travelled per second.
 *
 * Tuned by flying it: 0.55 crossed the whole 2 km of loaded city in two
 * seconds, which overshoots before you can see where you are going. At 0.15 a
 * held key moves about a block per second from the default altitude, and Shift
 * is there when you do want to cover ground.
 */
const BASE_SPEED = 0.15;
const ROTATE_SPEED = 1.1; // radians per second
const BOOST = 3;
const MIN_PITCH = 0.05;
const MAX_PITCH = Math.PI / 2 - 0.05;

export function useFlightControls(
  camera: PerspectiveCamera,
  controlsRef: React.MutableRefObject<OrbitControlsImpl | null>,
  enabled = true,
) {
  const keys = useRef(new Set<string>());
  const scratch = useRef({
    forward: new Vector3(),
    right: new Vector3(),
    offset: new Vector3(),
  });

  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
      if (
        !MOVE_KEYS.has(e.code) &&
        e.code !== "ShiftLeft" &&
        e.code !== "ShiftRight"
      )
        return;
      // Arrows also drive the timeline; only claim them for looking around when
      // a movement key is held, so stepping stations still works on its own.
      if (e.code.startsWith("Arrow") && !hasMovement(keys.current)) return;
      e.preventDefault();
      keys.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.code);
    const blur = () => keys.current.clear();
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [enabled]);

  useFrame((_, dt) => {
    const controls = controlsRef.current;
    if (!enabled || !controls || keys.current.size === 0) return;

    const k = keys.current;
    const { forward, right, offset } = scratch.current;
    const target = controls.target;
    const distance = camera.position.distanceTo(target);
    const step =
      BASE_SPEED *
      distance *
      dt *
      (k.has("ShiftLeft") || k.has("ShiftRight") ? BOOST : 1);

    // Ground-plane basis from the current view direction. Z is up here, so the
    // forward vector is flattened before use — otherwise looking down would
    // bury the camera in the terrain on every W press.
    forward.subVectors(target, camera.position);
    forward.z = 0;
    if (forward.lengthSq() < 1e-6) forward.set(0, 1, 0);
    forward.normalize();
    right.set(forward.y, -forward.x, 0);

    offset.set(0, 0, 0);
    if (k.has("KeyW")) offset.addScaledVector(forward, step);
    if (k.has("KeyS")) offset.addScaledVector(forward, -step);
    if (k.has("KeyD")) offset.addScaledVector(right, step);
    if (k.has("KeyA")) offset.addScaledVector(right, -step);
    if (k.has("KeyE")) offset.z += step;
    if (k.has("KeyQ")) offset.z -= step;

    if (offset.lengthSq() > 0) {
      camera.position.add(offset);
      target.add(offset);
    }

    // Arrow keys swing the camera around the target, matching mouse orbiting.
    const yaw = (k.has("ArrowLeft") ? 1 : 0) - (k.has("ArrowRight") ? 1 : 0);
    const pitch = (k.has("ArrowUp") ? 1 : 0) - (k.has("ArrowDown") ? 1 : 0);
    if (yaw || pitch) {
      const v = camera.position.clone().sub(target);
      const radius = v.length();
      let theta = Math.atan2(v.y, v.x);
      let phi = Math.acos(Math.min(1, Math.max(-1, v.z / radius)));
      theta += yaw * ROTATE_SPEED * dt;
      phi = Math.min(
        Math.PI / 2 - MIN_PITCH,
        Math.max(MIN_PITCH, phi - pitch * ROTATE_SPEED * dt),
      );
      const s = Math.sin(phi);
      camera.position.set(
        target.x + radius * s * Math.cos(theta),
        target.y + radius * s * Math.sin(theta),
        target.z + radius * Math.cos(phi),
      );
    }

    camera.lookAt(target);
    controls.update();
  });
}

function hasMovement(keys: Set<string>): boolean {
  return (
    keys.has("KeyW") ||
    keys.has("KeyA") ||
    keys.has("KeyS") ||
    keys.has("KeyD") ||
    keys.has("KeyQ") ||
    keys.has("KeyE")
  );
}

export { MAX_PITCH };
