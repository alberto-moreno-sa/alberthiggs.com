/**
 * city/palette.ts — Colour ramps and UI chrome for the city viewer.
 *
 * Buildings are tinted by measured height because that is the value this
 * project recovers from the LiDAR; the ramp is the legend. Terrain and canopy
 * stay desaturated so the buildings carry the reading.
 */
import { Color } from "three";

/** Building height ramp, low to tall. */
export const HEIGHT_RAMP: Array<[number, Color]> = [
  [0.0, new Color("#4a5a70")], // 1-2 floors, cool slate
  [0.25, new Color("#7d8b93")],
  [0.45, new Color("#b3ac8c")],
  [0.62, new Color("#dcb478")], // mid-rise, warm
  [0.8, new Color("#ec8b4c")],
  [1.0, new Color("#f8e2b6")], // the towers, burning out light
];

/** Ground and tree canopy. */
export const TERRAIN_RAMP: Array<[number, Color]> = [
  [0.0, new Color("#1d1f22")],
  [0.35, new Color("#2c3029")],
  [0.7, new Color("#3d4a33")], // canopy
  [1.0, new Color("#55663f")],
];

export const COLORS = {
  background: "#0a0b0d",
  text: "#f2ece4",
  accent: "#e8894f",
  warn: "#e0603f",
  panelBg: "rgba(16, 17, 20, 0.82)",
  panelBorder: "rgba(242, 236, 228, 0.10)",
};

/** Tallest building in the dataset, used to normalise the ramp. */
export const MAX_BUILDING_HEIGHT = 240;
