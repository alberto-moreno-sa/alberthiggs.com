import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const posRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Skip on touch devices or reduced motion
    if (
      "ontouchstart" in window ||
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    setIsVisible(true);
    document.documentElement.style.cursor = "none";

    const handleMouseMove = (e: MouseEvent) => {
      posRef.current = { x: e.clientX, y: e.clientY };

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        if (innerRef.current) {
          innerRef.current.style.left = `${posRef.current.x}px`;
          innerRef.current.style.top = `${posRef.current.y}px`;
        }
        if (outerRef.current) {
          outerRef.current.style.left = `${posRef.current.x}px`;
          outerRef.current.style.top = `${posRef.current.y}px`;
        }
      });
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest(
          'a, button, [role="button"], input, textarea, select, label',
        )
      ) {
        setIsHovering(true);
      }
    };

    const handleMouseOut = (e: MouseEvent) => {
      const target = e.relatedTarget as HTMLElement | null;
      if (
        !target ||
        !target.closest(
          'a, button, [role="button"], input, textarea, select, label',
        )
      ) {
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseover", handleMouseOver, { passive: true });
    document.addEventListener("mouseout", handleMouseOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", handleMouseLeave);
    document.documentElement.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      document.documentElement.style.cursor = "";
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseover", handleMouseOver);
      document.removeEventListener("mouseout", handleMouseOut);
      document.documentElement.removeEventListener(
        "mouseleave",
        handleMouseLeave,
      );
      document.documentElement.removeEventListener(
        "mouseenter",
        handleMouseEnter,
      );
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      {/* Outer ring */}
      <div
        ref={outerRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: isHovering ? 48 : 32,
          height: isHovering ? 48 : 32,
          border: "1px solid var(--color-accent)",
          borderRadius: "50%",
          opacity: isHovering ? 0.8 : 0.5,
          transition:
            "width 0.2s ease-out, height 0.2s ease-out, opacity 0.2s ease-out, left 0.15s ease-out, top 0.15s ease-out",
        }}
      />
      {/* Inner dot */}
      <div
        ref={innerRef}
        className="fixed pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2"
        style={{
          width: isHovering ? 8 : 6,
          height: isHovering ? 8 : 6,
          backgroundColor: "var(--color-accent)",
          borderRadius: "50%",
          transition: "width 0.2s ease-out, height 0.2s ease-out",
        }}
      />
    </>
  );
}
