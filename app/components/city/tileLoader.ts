/**
 * city/tileLoader.ts — Fetch + decode one city tile.
 *
 * A tile holds a ground+canopy height grid and the buildings whose centroid
 * falls inside it. Both come from the same gzip stream: the grid as row-major
 * uint16 quantised over the tile's own z range, then each building's footprint
 * ring as uint16 pairs in tile-local coordinates. Building attributes travel in
 * the JSON header, where they stay readable and compress well.
 *
 * Wire layout (little-endian):
 *   uint32        header length
 *   <headerLen>   UTF-8 JSON header
 *   <rest>        gzip: (gw*gw) uint16 grid, then sum(n_i) uint16 ring pairs
 */
export const TILE_URL_BASE = '/data/city/'

export interface BuildingAttrs {
  /** vertex count of the footprint ring */
  n: number
  /** ground elevation at the footprint, metres above the ellipsoid */
  b: number
  /** measured height, metres */
  h: number
  /** footprint area, m² */
  a: number
  /** class or subtype, when Overture carries one */
  c?: string | null
  /** name, when Overture carries one */
  t?: string | null
}

export interface TileHeader {
  v: number
  tx: number
  ty: number
  x0: number
  y1: number
  tile: number
  grid: number
  gw: number
  zlo: number
  zhi: number
  buildings: BuildingAttrs[]
}

export interface Building extends BuildingAttrs {
  /** footprint ring in tile-local metres, [x0,y0, x1,y1, …] with y pointing north */
  ring: Float32Array
}

export interface ParsedTile {
  tx: number
  ty: number
  /** tile origin in projected metres (north-west corner) */
  x0: number
  y1: number
  tile: number
  grid: number
  gw: number
  /** ground + canopy heights, row-major, metres */
  heights: Float32Array
  zMin: number
  zMax: number
  buildings: Building[]
}

export const tileKey = (tx: number, ty: number): string => `${tx}_${ty}`
export const tileUrl = (tx: number, ty: number): string =>
  `${TILE_URL_BASE}t_${tx}_${ty}.bin`

async function gunzip(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

/** Ring coordinates were packed over a 1500 m span offset by 250 m; undo that. */
const RING_SPAN = 1500 / 65535
const RING_OFFSET = 250

export const fetchTile = async (
  tx: number,
  ty: number,
  signal?: AbortSignal,
): Promise<ParsedTile> => {
  const res = await fetch(tileUrl(tx, ty), { signal })
  if (!res.ok) throw new Error(`Failed to fetch tile ${tx},${ty}: ${res.status}`)
  const buf = await res.arrayBuffer()
  const headerLen = new DataView(buf).getUint32(0, true)
  const header = JSON.parse(
    new TextDecoder().decode(new Uint8Array(buf, 4, headerLen)),
  ) as TileHeader
  if (header.v !== 1) throw new Error(`Unsupported tile version ${header.v}`)

  const raw = await gunzip(new Uint8Array(buf, 4 + headerLen))
  const u16 = new Uint16Array(raw.buffer, raw.byteOffset, raw.byteLength >> 1)

  const cells = header.gw * header.gw
  const span = (header.zhi - header.zlo) / 65535
  const heights = new Float32Array(cells)
  for (let i = 0; i < cells; i++) heights[i] = header.zlo + u16[i] * span

  const buildings: Building[] = []
  let p = cells
  for (const b of header.buildings) {
    const ring = new Float32Array(b.n * 2)
    for (let i = 0; i < b.n; i++) {
      ring[i * 2] = u16[p + i * 2] * RING_SPAN - RING_OFFSET
      // packed as distance south of the tile's north edge
      ring[i * 2 + 1] = -(u16[p + i * 2 + 1] * RING_SPAN - RING_OFFSET)
    }
    p += b.n * 2
    buildings.push({ ...b, ring })
  }

  return {
    tx: header.tx,
    ty: header.ty,
    x0: header.x0,
    y1: header.y1,
    tile: header.tile,
    grid: header.grid,
    gw: header.gw,
    heights,
    zMin: header.zlo,
    zMax: header.zhi,
    buildings,
  }
}
