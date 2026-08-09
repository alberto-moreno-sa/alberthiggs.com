/**
 * city/geometry.ts — Turn a decoded tile into two BufferGeometries.
 *
 * One tile becomes exactly two draw calls: a terrain/canopy mesh from the height
 * grid, and a single merged mesh holding every building in the tile. Merging
 * matters — a tile can hold 200 buildings, and 200 separate meshes would cost
 * more in draw calls than the whole scene's geometry costs in vertices.
 *
 * Buildings are coloured by measured height, which is the value this project
 * recovers, so the colour carries information rather than decoration.
 */
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  ShapeUtils,
  Vector2,
} from "three";
import type { ParsedTile } from "./tileLoader";
import { HEIGHT_RAMP, TERRAIN_RAMP } from "./palette";

/** Sample a ramp of [stop, Color] pairs at t ∈ [0,1]. */
function ramp(stops: Array<[number, Color]>, t: number, out: Color): Color {
  const u = Math.min(1, Math.max(0, t));
  let i = 0;
  while (i < stops.length - 2 && u > stops[i + 1][0]) i++;
  const [t0, c0] = stops[i];
  const [t1, c1] = stops[i + 1];
  const k = t1 > t0 ? (u - t0) / (t1 - t0) : 0;
  return out.setRGB(
    c0.r + (c1.r - c0.r) * k,
    c0.g + (c1.g - c0.g) * k,
    c0.b + (c1.b - c0.b) * k,
  );
}

/**
 * Terrain + canopy surface for one tile.
 *
 * Vertices are placed in tile-local metres with Z up. Cells whose four corners
 * are all at the tile's floor value are still emitted: skipping them would open
 * holes along tile seams, which read far worse than a flat quad.
 */
export function terrainGeometry(
  tile: ParsedTile,
  groundRef: number,
  stride = 1,
): BufferGeometry {
  const { gw, grid, heights } = tile;
  // Sampling every `stride`-th post keeps the ground readable while cutting the
  // vertex count quadratically. Terrain dominates a tile's GPU footprint, so at
  // stride 1 a handful of tiles would blow any sensible cache budget.
  const w = Math.floor((gw - 1) / stride) + 1;
  const n = w * w;
  const pos = new Float32Array(n * 3);
  const col = new Float32Array(n * 3);
  const c = new Color();

  let lo = Infinity;
  let hi = -Infinity;
  for (let i = 0; i < gw * gw; i++) {
    const h = heights[i];
    if (h < lo) lo = h;
    if (h > hi) hi = h;
  }
  const span = Math.max(hi - lo, 1);

  for (let r = 0; r < w; r++) {
    for (let cx = 0; cx < w; cx++) {
      const src =
        Math.min(r * stride, gw - 1) * gw + Math.min(cx * stride, gw - 1);
      const o = (r * w + cx) * 3;
      pos[o] = cx * stride * grid;
      pos[o + 1] = -r * stride * grid;
      pos[o + 2] = heights[src] - groundRef;
      // Canopy sits well above local ground; tint it toward the vegetation stop.
      ramp(TERRAIN_RAMP, (heights[src] - lo) / span, c);
      col[o] = c.r;
      col[o + 1] = c.g;
      col[o + 2] = c.b;
    }
  }

  const quads = (w - 1) * (w - 1);
  const idx = new Uint32Array(quads * 6);
  let k = 0;
  for (let r = 0; r < w - 1; r++) {
    for (let cx = 0; cx < w - 1; cx++) {
      const a = r * w + cx;
      const b = a + 1;
      const d = a + w;
      const e = d + 1;
      idx[k++] = a;
      idx[k++] = d;
      idx[k++] = b;
      idx[k++] = b;
      idx[k++] = d;
      idx[k++] = e;
    }
  }

  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(pos, 3));
  g.setAttribute("color", new BufferAttribute(col, 3));
  g.setIndex(new BufferAttribute(idx, 1));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}

export interface BuildingPick {
  /** first and last triangle index for this building, for hover lookup */
  start: number;
  count: number;
}

/**
 * Every building in the tile merged into one geometry.
 *
 * Walls are two triangles per footprint edge; roofs are earcut-triangulated by
 * three's ShapeUtils. Rings arrive in an unknown winding, so the roof is flipped
 * when the signed area says it is clockwise — otherwise half the roofs would be
 * back-facing and vanish.
 */
export function buildingGeometry(
  tile: ParsedTile,
  groundRef: number,
  maxHeight: number,
): { geometry: BufferGeometry; picks: BuildingPick[] } {
  const pos: number[] = [];
  const col: number[] = [];
  const picks: BuildingPick[] = [];
  const c = new Color();

  for (const b of tile.buildings) {
    const start = pos.length / 3;
    const base = b.b - groundRef;
    const top = base + b.h;
    // Heights are heavily skewed — median 12 m against a 240 m maximum — so a
    // linear ramp would collapse nine buildings in ten into its first stop.
    // The exponent spreads the low end where nearly all the city lives.
    ramp(HEIGHT_RAMP, Math.pow(Math.min(1, b.h / maxHeight), 0.45), c);

    const n = b.n;
    // Walls.
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const x0 = b.ring[i * 2];
      const y0 = b.ring[i * 2 + 1];
      const x1 = b.ring[j * 2];
      const y1 = b.ring[j * 2 + 1];
      pos.push(x0, y0, base, x1, y1, base, x1, y1, top);
      pos.push(x0, y0, base, x1, y1, top, x0, y0, top);
      for (let v = 0; v < 6; v++) col.push(c.r, c.g, c.b);
    }

    // Roof.
    const contour: Vector2[] = [];
    let signed = 0;
    for (let i = 0; i < n; i++) {
      const x = b.ring[i * 2];
      const y = b.ring[i * 2 + 1];
      contour.push(new Vector2(x, y));
      const j = (i + 1) % n;
      signed += x * b.ring[j * 2 + 1] - b.ring[j * 2] * y;
    }
    const faces = ShapeUtils.triangulateShape(contour, []);
    const flip = signed < 0;
    for (const f of faces) {
      const [i0, i1, i2] = flip ? [f[2], f[1], f[0]] : f;
      for (const i of [i0, i1, i2]) {
        pos.push(contour[i].x, contour[i].y, top);
        col.push(c.r * 1.12, c.g * 1.12, c.b * 1.12);
      }
    }
    picks.push({ start, count: pos.length / 3 - start });
  }

  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return { geometry: g, picks };
}
