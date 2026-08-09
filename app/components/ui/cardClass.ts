/**
 * The site's card shell, as a class string.
 *
 * Five hand-written copies had drifted into five different combinations of
 * radius, background opacity and transition duration — one card was rounded-2xl
 * while the rest were rounded-xl, durations split between 300ms and 500ms. The
 * variation was accidental, so geometry and timing are fixed here and only the
 * deliberate axes stay configurable.
 *
 * Exposed as a function, not just a component, because some cards render as an
 * <a> and need the classes on an element they own.
 *
 * Composed with `cn`, so a caller passing `className` genuinely overrides the
 * defaults instead of depending on stylesheet order — `cardClass({ className:
 * "rounded-none" })` drops the rounded-xl rather than emitting both.
 */
import { cn } from "~/lib/cn";

/** `raised` is the primary surface; `sunken` sits back for secondary content. */
export type CardTone = "raised" | "sunken";

const TONE: Record<CardTone, string> = {
  raised: "bg-card/50",
  sunken: "bg-card/30",
};

const BASE =
  "rounded-xl border border-border hover:border-border-light transition-all duration-500";

export const cardClass = ({
  tone = "raised",
  interactive = false,
  className = "",
}: {
  tone?: CardTone;
  /** Adds the lift-and-shadow hover used by cards that link somewhere. */
  interactive?: boolean;
  className?: string;
} = {}) =>
  cn(
    BASE,
    TONE[tone],
    interactive && "hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20",
    className,
  );
