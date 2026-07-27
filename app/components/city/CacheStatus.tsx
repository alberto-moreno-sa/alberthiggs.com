/**
 * city/CacheStatus.tsx — Live readout of the tile cache budget.
 *
 * Subscribes to the cache's own event stream rather than polling, and turns the
 * bar red past the soft-warn threshold so eviction pressure is visible while
 * flying rather than only in a profiler.
 */
import { useSyncExternalStore, type CSSProperties } from 'react'
import type { TileCache } from './TileCache'
import { COLORS } from './palette'

const panel: CSSProperties = {
  position: 'absolute',
  top: 16,
  right: 16,
  padding: '9px 12px',
  minWidth: 168,
  background: COLORS.panelBg,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: 8,
  backdropFilter: 'blur(8px)',
  color: COLORS.text,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  zIndex: 8,
  pointerEvents: 'none',
}

const row: CSSProperties = { display: 'flex', justifyContent: 'space-between', gap: 12 }
const key: CSSProperties = { opacity: 0.55 }

export function CacheStatus({ cache }: { cache: TileCache }) {
  const metrics = useSyncExternalStore(
    cb => cache.subscribe(cb),
    () => cache.getMetrics(),
    () => cache.getMetrics(),
  )
  const ratio = metrics.limitMb > 0 ? metrics.usedMb / metrics.limitMb : 0
  const hot = ratio >= 0.8

  return (
    <div style={panel}>
      <div style={row}>
        <span style={key}>tiles</span>
        <span>{metrics.entries}</span>
      </div>
      <div style={row}>
        <span style={key}>GPU</span>
        <span style={{ color: hot ? COLORS.warn : COLORS.text }}>
          {metrics.usedMb.toFixed(1)} / {metrics.limitMb.toFixed(0)} MB
        </span>
      </div>
      <div
        style={{
          marginTop: 6,
          height: 3,
          borderRadius: 2,
          background: 'rgba(242,236,228,0.12)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, ratio * 100)}%`,
            height: '100%',
            background: hot ? COLORS.warn : COLORS.accent,
          }}
        />
      </div>
    </div>
  )
}
