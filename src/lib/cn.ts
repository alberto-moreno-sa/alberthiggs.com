import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Compose class names, then let the last Tailwind utility win.
 *
 * `clsx` flattens the conditional forms — strings, arrays, objects, falsy
 * values — into one string. `tailwind-merge` then resolves conflicts within a
 * utility group, so `cn("p-5", "p-8")` yields `p-8` rather than emitting both
 * and leaving the outcome to CSS source order.
 *
 * That second half is what a plain template literal cannot do. A component that
 * accepts `className` and interpolates it after its own defaults only overrides
 * them by accident of ordering in the generated stylesheet; with `cn` the
 * caller reliably wins. Unknown classes — `glass`, `section-label`,
 * `scroll-visible` — pass through untouched.
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
