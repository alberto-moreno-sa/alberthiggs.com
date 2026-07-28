/**
 * city/CityViewer.tsx — The Reforma-Chapultepec flyover.
 *
 * Streams city tiles around the camera through a memory-bounded LRU cache while
 * the timeline walks 50 stations along the corridor. Buildings are extruded from
 * Overture footprints at heights measured off the INEGI LiDAR, and are tinted by
 * that measured height.
 */
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  DoubleSide,
  Group,
  Mesh,
  MeshLambertMaterial,
  Raycaster,
  Vector2,
  type PerspectiveCamera,
} from "three";
import type { OrbitControls as OrbitControlsImpl } from "three/examples/jsm/controls/OrbitControls.js";
import { TileCache, type TileEntry } from "./TileCache";
import { cityStore, usePlaying, useStation } from "./cityStore";
import { COLORS } from "./palette";
import { Timeline } from "./Timeline";
import { BuildingTooltip } from "./BuildingTooltip";
import { CacheStatus } from "./CacheStatus";
import type { Building } from "./tileLoader";
import { useFlightControls } from "./useFlightControls";

interface CityIndex {
  nx: number;
  ny: number;
  x0: number;
  y1: number;
  tile: number;
  grid: number;
  gw: number;
  source: string;
  crs: string;
  flight: {
    ground: number;
    heading: number;
    stations: Array<[number, number]>;
  };
}

// Budget has to clear the working set with room to spare: the prefetch window
// alone is ~30 tiles, and a limit below that makes the LRU evict tiles it is
// about to need again, which thrashes instead of caching.
const CACHE_MB = 64;
const PREFETCH_RADIUS = 3.2;
const CAMERA_BACK = 780;
const CAMERA_UP = 480;
const FPS = 6;
/** Distance at which tiles fade into the background, hiding the loaded edge. */
const FOG_NEAR = 900;
const FOG_FAR = 2600;
/** Picking budget: 15 Hz is imperceptible on hover and frees the frame. */
const RAYCAST_MS = 66;
/** Retina renders 4x the pixels at 2; 1.5 keeps edges clean for a third less cost. */
const MAX_DPR = 1.5;

// Buildings are closed volumes, so backfaces can be culled — DoubleSide here
// doubled the fragment work for nothing. Terrain is a single sheet and keeps it.
const BUILDING_MAT = new MeshLambertMaterial({ vertexColors: true });
const TERRAIN_MAT = new MeshLambertMaterial({
  vertexColors: true,
  side: DoubleSide,
});

/** Which building a triangle index belongs to, via the per-tile pick table. */
function pickBuilding(
  entry: TileEntry,
  faceIndex: number,
): Building | undefined {
  if (!entry.picks || !entry.tile) return undefined;
  const vertex = faceIndex * 3;
  for (let i = 0; i < entry.picks.length; i++) {
    const p = entry.picks[i];
    if (vertex >= p.start && vertex < p.start + p.count) {
      return entry.tile.buildings[i];
    }
  }
  return undefined;
}

function Scene({ cache, index }: { cache: TileCache; index: CityIndex }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const cam = camera as PerspectiveCamera;

  const station = useStation();
  const playing = usePlaying();
  const [, force] = useState(0);

  // Local scene origin: the first station. Keeping world coordinates (millions
  // of metres in UTM) out of the vertex data avoids float32 precision loss.
  const origin = useMemo(() => index.flight.stations[0], [index]);

  useEffect(() => {
    const un = cache.subscribe((e) => {
      if (e.type === "load-end" || e.type === "evict") force((v) => v + 1);
    });
    return un;
  }, [cache]);

  // Stream the tiles around the active station.
  //
  // Stations are ~90 m apart and tiles are 500 m, so most steps stay inside the
  // same tile. Re-running the prefetch on every station would restart the queue
  // mid-flight and stall playback behind geometry building for tiles already in
  // hand, so it only fires when the flight actually crosses into a new tile.
  const lastTile = useRef<string>("");
  useEffect(() => {
    const [sx, sy] = index.flight.stations[station];
    const cx = (sx - index.x0) / index.tile;
    const cy = (index.y1 - sy) / index.tile;
    const k = `${Math.floor(cx)}_${Math.floor(cy)}`;
    if (k === lastTile.current) return;
    lastTile.current = k;
    cache.prefetch(cx, cy, PREFETCH_RADIUS, index.nx, index.ny);
  }, [cache, index, station]);

  // Move the camera to the active station.
  //
  // OrbitControls mounts after the first effect pass, so this has to retry once
  // the ref lands — otherwise the very first station never gets framed and the
  // opening view points at empty space.
  const [controlsReady, setControlsReady] = useState(false);
  useEffect(() => {
    if (!controlsReady && controlsRef.current) setControlsReady(true);
  }, [controlsReady]);

  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;
    const [sx, sy] = index.flight.stations[station];
    const hdg = (index.flight.heading * Math.PI) / 180;
    const dx = Math.sin(hdg);
    const dy = Math.cos(hdg);
    const tx = sx - origin[0];
    const ty = sy - origin[1];
    controls.target.set(tx, ty, 40);
    cam.position.set(tx - dx * CAMERA_BACK, ty - dy * CAMERA_BACK, CAMERA_UP);
    controls.update();
  }, [index, station, origin, controlsReady, cam]);

  // Free-flight keyboard navigation over the city.
  useFlightControls(cam, controlsRef);

  // Playback.
  const acc = useRef(0);
  useFrame((_, dt) => {
    if (!playing) return;
    acc.current += dt;
    if (acc.current < 1 / FPS) return;
    acc.current = 0;
    const next = station + 1;
    if (next >= index.flight.stations.length) {
      cityStore.setPlaying(false);
    } else {
      cityStore.setStation(next);
    }
  });

  // Hover.
  const raycaster = useMemo(() => new Raycaster(), []);
  const pointer = useRef({ ndc: new Vector2(), x: 0, y: 0, active: false });
  const meshes = useRef<Mesh[]>([]);

  useEffect(() => {
    const dom = gl.domElement;
    const move = (e: PointerEvent) => {
      const r = dom.getBoundingClientRect();
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.ndc.set(
        ((e.clientX - r.left) / r.width) * 2 - 1,
        -((e.clientY - r.top) / r.height) * 2 + 1,
      );
      pointer.current.active = true;
    };
    const leave = () => {
      pointer.current.active = false;
      cityStore.setHover(null);
    };
    dom.addEventListener("pointermove", move);
    dom.addEventListener("pointerleave", leave);
    return () => {
      dom.removeEventListener("pointermove", move);
      dom.removeEventListener("pointerleave", leave);
    };
  }, [gl]);

  const lastPick = useRef({ t: 0, x: -1, y: -1 });
  useFrame(() => {
    if (!pointer.current.active || meshes.current.length === 0) return;
    const now = performance.now();
    const p = pointer.current;
    if (now - lastPick.current.t < RAYCAST_MS) return;
    if (p.x === lastPick.current.x && p.y === lastPick.current.y) return;
    lastPick.current = { t: now, x: p.x, y: p.y };
    raycaster.setFromCamera(pointer.current.ndc, cam);
    const hits = raycaster.intersectObjects<Mesh>(meshes.current, false);
    const hit = hits[0];
    if (!hit || hit.faceIndex == null) {
      cityStore.setHover(null);
      return;
    }
    const entry = hit.object.userData.entry as TileEntry | undefined;
    const b = entry ? pickBuilding(entry, hit.faceIndex) : undefined;
    cityStore.setHover(
      b
        ? {
            building: b,
            screen: { x: pointer.current.x, y: pointer.current.y },
          }
        : null,
    );
  });

  const tiles = cache.ready();
  const groupRef = useRef<Group>(null);

  // Rebuild the pickable list after each commit. Writing it during render would
  // desync from what is actually mounted, and React forbids it outright.
  useEffect(() => {
    const list: Mesh[] = [];
    groupRef.current?.traverse((o) => {
      const m = o as Mesh;
      if (m.isMesh && m.userData.entry) list.push(m);
    });
    meshes.current = list;
  }, [tiles]);

  return (
    <>
      <color attach="background" args={[COLORS.background]} />
      <fog attach="fog" args={[COLORS.background, FOG_NEAR, FOG_FAR]} />
      <hemisphereLight args={["#dce4f2", "#3a332a", 1.6]} />
      <directionalLight position={[-900, -700, 1400]} intensity={2.1} />
      <directionalLight position={[700, 500, 400]} intensity={0.45} />
      <OrbitControls
        ref={controlsRef as never}
        enableDamping
        dampingFactor={0.09}
        enablePan
        screenSpacePanning={false}
        minDistance={60}
        maxDistance={4000}
        maxPolarAngle={Math.PI / 2.05}
      />
      <group ref={groupRef}>
        {tiles.map((e) => {
          const ox = e.tile!.x0 - origin[0];
          const oy = e.tile!.y1 - origin[1];
          return (
            <group key={e.key} position={[ox, oy, 0]}>
              {e.terrain && (
                <mesh geometry={e.terrain} material={TERRAIN_MAT} />
              )}
              {e.buildings && (
                <mesh
                  geometry={e.buildings}
                  material={BUILDING_MAT}
                  userData={{ entry: e }}
                />
              )}
            </group>
          );
        })}
      </group>
    </>
  );
}

export default function CityViewer() {
  const [index, setIndex] = useState<CityIndex | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let live = true;
    fetch("/data/city/index.json")
      .then((r) => {
        if (!r.ok) throw new Error(`index ${r.status}`);
        return r.json();
      })
      .then((j) => {
        if (live) setIndex(j as CityIndex);
      })
      .catch((e) => {
        if (live) setError((e as Error).message);
      });
    return () => {
      live = false;
    };
  }, []);

  const cache = useMemo(
    () => (index ? new TileCache(CACHE_MB, index.flight.ground) : null),
    [index],
  );

  useEffect(() => () => cache?.clear(), [cache]);

  if (error) {
    return (
      <div style={overlayStyle}>Could not load the city index: {error}</div>
    );
  }
  if (!index || !cache) {
    return <div style={overlayStyle}>Loading city…</div>;
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Canvas
        dpr={[1, MAX_DPR]}
        gl={{ antialias: true }}
        camera={{
          fov: 55,
          near: 1,
          far: 20000,
          position: [0, -700, 320],
          up: [0, 0, 1],
        }}
      >
        <Suspense fallback={null}>
          <Scene cache={cache} index={index} />
        </Suspense>
      </Canvas>
      <CacheStatus cache={cache} />
      <Timeline count={index.flight.stations.length} />
      <BuildingTooltip />
    </div>
  );
}

const overlayStyle: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: COLORS.text,
  background: COLORS.background,
  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
  fontSize: 13,
  opacity: 0.75,
};
