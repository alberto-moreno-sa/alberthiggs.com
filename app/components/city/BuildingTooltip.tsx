/**
 * city/BuildingTooltip.tsx — Readout for the building under the cursor.
 *
 * Shows what was measured rather than what was downloaded: the height comes
 * from the LiDAR surface minus terrain, and the floor count is derived from it,
 * so it is labelled as an estimate.
 */
import type { CSSProperties } from 'react'
import { useHover } from './cityStore'
import { COLORS } from './palette'

const WIDTH = 226
const HEIGHT_ESTIMATE = 150
const OFFSET = 14

const panel: CSSProperties = {
  position: 'fixed',
  width: WIDTH,
  padding: '10px 12px',
  background: COLORS.panelBg,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: 8,
  backdropFilter: 'blur(8px)',
  color: COLORS.text,
  pointerEvents: 'none',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  fontSize: 12,
  lineHeight: 1.45,
  zIndex: 10,
}

const row: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 11,
  color: 'rgba(242, 236, 228, 0.85)',
}

const key: CSSProperties = { color: 'rgba(242, 236, 228, 0.5)' }

/** Typical Mexico City floor-to-floor, for the derived floor count. */
const FLOOR_M = 3.2

export function BuildingTooltip() {
  const hover = useHover()
  if (!hover) return null
  const { building: b, screen } = hover

  const left = Math.min(screen.x + OFFSET, window.innerWidth - WIDTH - 8)
  const top = Math.min(screen.y + OFFSET, window.innerHeight - HEIGHT_ESTIMATE - 8)
  const floors = Math.max(1, Math.round(b.h / FLOOR_M))

  return (
    <div style={{ ...panel, left, top }}>
      <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#fff' }}>
        {b.t ?? 'Unnamed'}
      </div>
      <div style={row}>
        <span style={key}>height</span>
        <span>{b.h.toFixed(1)} m</span>
      </div>
      <div style={row}>
        <span style={key}>floors approx.</span>
        <span>{floors}</span>
      </div>
      <div style={row}>
        <span style={key}>footprint</span>
        <span>{b.a.toLocaleString()} m²</span>
      </div>
      <div style={row}>
        <span style={key}>use</span>
        <span>{b.c ?? '—'}</span>
      </div>
      <div style={{ ...row, marginTop: 6, fontSize: 10, opacity: 0.55 }}>
        <span>height measured from LiDAR</span>
      </div>
    </div>
  )
}
