import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

export const useScrollAnimation = <T extends HTMLElement = HTMLDivElement>(
  threshold = 0.1,
) => {
  const ref = useRef<T>(null);
  const [isVisible, setIsVisible] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    // Reveal everything at once rather than fading it in. app.css clamps the
    // transition durations globally, so this was already near-instant — but
    // only by way of that catch-all, which does not cover inline styles or any
    // future JS-driven variant. Make the intent explicit here instead.
    if (reducedMotion) {
      setIsVisible(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold, rootMargin: "0px 0px -50px 0px" },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold, reducedMotion]);

  return { ref, isVisible };
};
