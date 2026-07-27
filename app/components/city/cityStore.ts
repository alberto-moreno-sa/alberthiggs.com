/**
 * city/cityStore.ts — Tiny external store for viewer state.
 *
 * Built on useSyncExternalStore rather than Context so that the per-frame work
 * (raycasting, the flight loop) can publish without re-rendering the tree: each
 * hook subscribes to one slice and the setters early-return when nothing
 * actually changed.
 */
import { useSyncExternalStore } from 'react'
import type { Building } from './tileLoader'

export interface HoverTarget {
  building: Building
  /** projected position, for the tooltip */
  screen: { x: number; y: number }
}

type Listener = () => void

let station = 0
let playing = false
let hover: HoverTarget | null = null

const listeners = new Set<Listener>()

const emit = () => {
  for (const l of listeners) l()
}

const subscribe = (l: Listener): (() => void) => {
  listeners.add(l)
  return () => {
    listeners.delete(l)
  }
}

export const cityStore = {
  getStation: () => station,
  setStation(n: number) {
    if (n === station) return
    station = n
    emit()
  },
  isPlaying: () => playing,
  setPlaying(v: boolean) {
    if (v === playing) return
    playing = v
    emit()
  },
  getHover: () => hover,
  setHover(next: HoverTarget | null) {
    const same =
      (next === null && hover === null) ||
      (next !== null && hover !== null && next.building === hover.building &&
        next.screen.x === hover.screen.x && next.screen.y === hover.screen.y)
    if (same) return
    hover = next
    emit()
  },
  subscribe,
}

const serverStation = () => 0
const serverPlaying = () => false
const serverHover = (): HoverTarget | null => null

export const useStation = (): number =>
  useSyncExternalStore(subscribe, cityStore.getStation, serverStation)

export const usePlaying = (): boolean =>
  useSyncExternalStore(subscribe, cityStore.isPlaying, serverPlaying)

export const useHover = (): HoverTarget | null =>
  useSyncExternalStore(subscribe, cityStore.getHover, serverHover)
