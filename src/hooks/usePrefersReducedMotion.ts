import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Tracks the user's reduced-motion preference, and keeps tracking it — the OS
 * toggle can flip mid-session.
 *
 * app.css already clamps CSS transition and animation durations globally, but
 * that cannot reach motion driven by JavaScript or WebGL. Components in that
 * category have to ask directly.
 *
 * Starts false so the server render and the first client render agree; the
 * effect corrects it before paint matters.
 */
export const usePrefersReducedMotion = (): boolean => {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(QUERY);
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduced;
};
