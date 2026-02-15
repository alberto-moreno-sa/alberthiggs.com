import { useEffect, useRef, useState } from "react";

export const useCountUp = (
  target: number,
  isActive: boolean,
  options?: { duration?: number },
): number => {
  const duration = options?.duration ?? 2000;
  const [value, setValue] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const hasRunRef = useRef(false);

  useEffect(() => {
    if (!isActive || hasRunRef.current || target === 0) return;
    hasRunRef.current = true;

    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) {
      setValue(target);
      return;
    }

    startTimeRef.current = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      setValue(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [isActive, target, duration]);

  return value;
};
