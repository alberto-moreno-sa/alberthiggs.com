/**
 * city/TileCache.ts — Memory-bounded LRU cache of decoded, GPU-ready tiles.
 *
 * Lives outside React on purpose: it owns fetches, deduplicates in-flight
 * requests, builds the BufferGeometries once, and evicts by least-recent use
 * against a byte budget. React only subscribes.
 *
 * Eviction disposes the geometries. Without that, dropping a tile from the map
 * would free the JavaScript object while leaving its buffers resident on the
 * GPU — the leak would not show up in the byte accounting at all.
 */
import type { BufferGeometry } from 'three'
import { fetchTile, tileKey, type ParsedTile } from './tileLoader'
import { buildingGeometry, terrainGeometry, type BuildingPick } from './geometry'
import { MAX_BUILDING_HEIGHT } from './palette'

export type TileStatus = 'loading' | 'ready' | 'error'

export interface TileEntry {
  tx: number
  ty: number
  key: string
  status: TileStatus
  error?: string
  lastAccess: number
  byteSize: number
  tile?: ParsedTile
  terrain?: BufferGeometry
  buildings?: BufferGeometry
  picks?: BuildingPick[]
}

export interface CacheMetrics {
  usedMb: number
  limitMb: number
  entries: number
}

export interface CacheEvent {
  type: 'load-start' | 'load-end' | 'evict' | 'error' | 'soft-warn'
  key: string
  detail?: string
}

type Listener = (e: CacheEvent) => void

const MB = 1024 * 1024

/** Render the 3 m height grid every other post — 6 m ground, a quarter the vertices. */
const TERRAIN_STRIDE = 2

function geometryBytes(g?: BufferGeometry): number {
  if (!g) return 0
  let n = 0
  for (const name of Object.keys(g.attributes)) {
    n += (g.attributes[name] as { array: ArrayLike<number> & { BYTES_PER_ELEMENT?: number } })
      .array.length * 4
  }
  if (g.index) n += g.index.array.length * 4
  return n
}

export class TileCache {
  private readonly limitBytes: number
  private readonly entries = new Map<string, TileEntry>()
  private readonly inflight = new Map<string, Promise<void>>()
  private readonly aborts = new Map<string, AbortController>()
  private readonly listeners = new Set<Listener>()
  private usedBytes = 0
  private tick = 0
  private metrics: CacheMetrics
  private groundRef: number

  constructor(limitMb: number, groundRef: number) {
    this.limitBytes = Math.max(1, limitMb) * MB
    this.groundRef = groundRef
    this.metrics = { usedMb: 0, limitMb: this.limitBytes / MB, entries: 0 }
  }

  setGroundRef(z: number): void {
    this.groundRef = z
  }

  subscribe(l: Listener): () => void {
    this.listeners.add(l)
    return () => {
      this.listeners.delete(l)
    }
  }

  private emit(e: CacheEvent): void {
    this.tick++
    for (const l of this.listeners) l(e)
  }

  private refresh(): void {
    this.metrics = {
      usedMb: this.usedBytes / MB,
      limitMb: this.limitBytes / MB,
      entries: this.entries.size,
    }
  }

  getTick(): number {
    return this.tick
  }

  getMetrics(): CacheMetrics {
    return this.metrics
  }

  get(tx: number, ty: number): TileEntry | undefined {
    const e = this.entries.get(tileKey(tx, ty))
    if (e) e.lastAccess = performance.now()
    return e
  }

  /** Every ready tile, for rendering. Does not touch LRU order. */
  ready(): TileEntry[] {
    const out: TileEntry[] = []
    for (const e of this.entries.values()) if (e.status === 'ready') out.push(e)
    return out
  }

  async load(tx: number, ty: number): Promise<void> {
    const key = tileKey(tx, ty)
    const existing = this.entries.get(key)
    if (existing && existing.status === 'ready') {
      existing.lastAccess = performance.now()
      return
    }
    const inflight = this.inflight.get(key)
    if (inflight) return inflight

    const controller = new AbortController()
    this.aborts.set(key, controller)
    this.entries.set(key, {
      tx, ty, key, status: 'loading', lastAccess: performance.now(), byteSize: 0,
    })
    this.emit({ type: 'load-start', key })

    const p = (async () => {
      try {
        const tile = await fetchTile(tx, ty, controller.signal)
        const terrain = terrainGeometry(tile, this.groundRef, TERRAIN_STRIDE)
        const { geometry: buildings, picks } = buildingGeometry(
          tile, this.groundRef, MAX_BUILDING_HEIGHT,
        )
        const byteSize = geometryBytes(terrain) + geometryBytes(buildings)
        const entry = this.entries.get(key)
        if (!entry) {
          terrain.dispose()
          buildings.dispose()
          return
        }
        Object.assign(entry, {
          status: 'ready' as const, tile, terrain, buildings, picks, byteSize,
          lastAccess: performance.now(),
        })
        this.usedBytes += byteSize
        this.evictTo(key)
        this.refresh()
        this.emit({ type: 'load-end', key })
        if (this.usedBytes > this.limitBytes * 0.8) {
          this.emit({ type: 'soft-warn', key })
        }
      } catch (err) {
        if ((err as Error).name === 'AbortError') {
          this.entries.delete(key)
          return
        }
        const entry = this.entries.get(key)
        if (entry) {
          entry.status = 'error'
          entry.error = (err as Error).message
        }
        this.emit({ type: 'error', key, detail: (err as Error).message })
      } finally {
        this.inflight.delete(key)
        this.aborts.delete(key)
      }
    })()

    this.inflight.set(key, p)
    return p
  }

  /** Drop least-recently-used ready tiles until the budget fits. */
  private evictTo(protectedKey: string): void {
    if (this.usedBytes <= this.limitBytes) return
    const victims = [...this.entries.values()]
      .filter(e => e.status === 'ready' && e.key !== protectedKey)
      .sort((a, b) => a.lastAccess - b.lastAccess)
    for (const v of victims) {
      if (this.usedBytes <= this.limitBytes) break
      v.terrain?.dispose()
      v.buildings?.dispose()
      this.usedBytes -= v.byteSize
      this.entries.delete(v.key)
      this.emit({ type: 'evict', key: v.key })
    }
  }

  /**
   * Warm the tiles overlapping a circular window, nearest first.
   *
   * Decoding a tile and building its geometry is synchronous main-thread work
   * (gunzip, then earcut over a couple of hundred footprints). Firing thirty of
   * those at once stalls the first paint for seconds, so the queue keeps a few
   * in flight and lets the nearest tiles reach the screen while the rest wait.
   */
  prefetch(cx: number, cy: number, radius: number, nx: number, ny: number): void {
    const want: Array<[number, number, number]> = []
    for (let ty = 0; ty < ny; ty++) {
      for (let tx = 0; tx < nx; tx++) {
        const d = Math.hypot(tx - cx, ty - cy)
        if (d <= radius) want.push([d, tx, ty])
      }
    }
    want.sort((a, b) => a[0] - b[0])
    this.queue = want.map(([, tx, ty]) => [tx, ty] as [number, number])
    this.pump()
  }

  private queue: Array<[number, number]> = []
  private active = 0
  private static readonly CONCURRENCY = 6

  private pump(): void {
    while (this.active < TileCache.CONCURRENCY && this.queue.length) {
      const [tx, ty] = this.queue.shift()!
      const key = tileKey(tx, ty)
      const e = this.entries.get(key)
      if (e && e.status === 'ready') {
        e.lastAccess = performance.now()
        continue
      }
      this.active++
      void this.load(tx, ty).finally(() => {
        this.active--
        this.pump()
      })
    }
  }

  clear(): void {
    for (const c of this.aborts.values()) c.abort()
    for (const e of this.entries.values()) {
      e.terrain?.dispose()
      e.buildings?.dispose()
    }
    this.entries.clear()
    this.inflight.clear()
    this.aborts.clear()
    this.usedBytes = 0
    this.refresh()
    this.emit({ type: 'evict', key: '*' })
  }
}
