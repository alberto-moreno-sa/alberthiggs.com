/**
 * city/Timeline.tsx — Scrubber over the 50 flight stations along Reforma.
 *
 * Clicking or dragging the track seeks; space toggles playback. The track is a
 * plain div rather than an <input type=range> so that the tick marks can show
 * which stations exist without fighting the native control's styling.
 */
import { useCallback, useEffect, useRef, type CSSProperties } from 'react'
import { cityStore, usePlaying, useStation } from './cityStore'
import { COLORS } from './palette'

const bar: CSSProperties = {
  position: 'absolute',
  left: '50%',
  bottom: 24,
  transform: 'translateX(-50%)',
  display: 'flex',
  alignItems: 'center',
  gap: 14,
  padding: '10px 16px',
  background: COLORS.panelBg,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: 10,
  backdropFilter: 'blur(8px)',
  color: COLORS.text,
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  fontSize: 12,
  zIndex: 8,
  maxWidth: 'calc(100vw - 32px)',
}

const button: CSSProperties = {
  width: 28,
  height: 24,
  border: `1px solid ${COLORS.panelBorder}`,
  borderRadius: 5,
  background: 'transparent',
  color: COLORS.text,
  cursor: 'pointer',
  lineHeight: 1,
}

export function Timeline({ count }: { count: number }) {
  const station = useStation()
  const playing = usePlaying()
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const seekFromEvent = useCallback(
    (clientX: number) => {
      const el = trackRef.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const t = Math.min(1, Math.max(0, (clientX - r.left) / r.width))
      cityStore.setStation(Math.round(t * (count - 1)))
    },
    [count],
  )

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (dragging.current) seekFromEvent(e.clientX)
    }
    const up = () => {
      dragging.current = false
    }
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [seekFromEvent])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return
      if (e.code === 'Space') {
        e.preventDefault()
        cityStore.setPlaying(!cityStore.isPlaying())
      } else if (e.code === 'ArrowLeft') {
        cityStore.setStation(Math.max(0, cityStore.getStation() - 1))
      } else if (e.code === 'ArrowRight') {
        cityStore.setStation(Math.min(count - 1, cityStore.getStation() + 1))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [count])

  const pct = count > 1 ? (station / (count - 1)) * 100 : 0

  return (
    <div style={bar}>
      <button
        type="button"
        style={button}
        onClick={() => cityStore.setPlaying(!playing)}
        aria-label={playing ? 'Pause' : 'Play'}
      >
        {playing ? '❚❚' : '▶'}
      </button>
      <span style={{ minWidth: 58, opacity: 0.85 }}>
        {String(station).padStart(2, '0')} / {count - 1}
      </span>
      <div
        ref={trackRef}
        onPointerDown={e => {
          dragging.current = true
          seekFromEvent(e.clientX)
        }}
        style={{
          position: 'relative',
          width: 340,
          maxWidth: '40vw',
          height: 8,
          borderRadius: 4,
          background: 'rgba(242,236,228,0.12)',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            width: `${pct}%`,
            borderRadius: 4,
            background: COLORS.accent,
            opacity: 0.85,
          }}
        />
      </div>
      <span style={{ opacity: 0.5, fontSize: 11 }}>space · ← →</span>
    </div>
  )
}
