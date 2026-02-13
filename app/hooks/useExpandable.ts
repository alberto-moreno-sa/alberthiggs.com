import { useCallback, useEffect, useRef, useState } from "react";

interface ExpandableReturn {
  isExpanded: boolean;
  toggle: () => void;
  contentRef: React.RefObject<HTMLDivElement>;
  contentHeight: number;
  triggerProps: {
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    role: "button";
    "aria-expanded": boolean;
    tabIndex: number;
  };
}

export function useExpandable(defaultExpanded = false): ExpandableReturn {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null!);

  const toggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  // Measure content height with ResizeObserver
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) => {
      setContentHeight(entry.contentRect.height);
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggle();
      }
    },
    [toggle]
  );

  return {
    isExpanded,
    toggle,
    contentRef,
    contentHeight,
    triggerProps: {
      onClick: toggle,
      onKeyDown,
      role: "button" as const,
      "aria-expanded": isExpanded,
      tabIndex: 0,
    },
  };
}
