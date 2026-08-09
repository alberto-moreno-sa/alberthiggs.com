/**
 * Small inline tag — technology chips, category badges, the "Featured" marker.
 *
 * Seven use sites had grown five different combinations of padding, radius and
 * colour for what reads as the same element. The two axes below are the ones
 * that were actually meaningful; the rest were drift.
 */

/** `accent` marks something highlighted; `neutral` is a plain metadata tag. */
export type PillTone = "accent" | "accent-strong" | "neutral";

const TONE: Record<PillTone, string> = {
  accent: "text-accent/70 bg-accent/5 border-accent/10",
  "accent-strong": "text-accent border-accent/30",
  neutral: "bg-surface text-text-secondary border-border/50",
};

const SIZE = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-xs",
} as const;

export const Pill = ({
  tone = "neutral",
  size = "sm",
  className = "",
  children,
}: {
  tone?: PillTone;
  size?: keyof typeof SIZE;
  className?: string;
  children: React.ReactNode;
}) => (
  <span
    className={`${SIZE[size]} font-mono rounded border ${TONE[tone]} ${className}`}
  >
    {children}
  </span>
);
