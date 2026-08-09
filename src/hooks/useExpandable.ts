import { useCallback, useEffect, useId, useRef, useState } from "react";

interface ExpandableReturn {
  isExpanded: boolean;
  toggle: () => void;
  contentRef: React.RefObject<HTMLDivElement | null>;
  contentHeight: number;
  /** Put on the element that names the control — usually the card's heading. */
  labelId: string;
  /** Put on the collapsible panel. */
  panelId: string;
  triggerProps: {
    onClick: () => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    role: "button";
    "aria-expanded": boolean;
    "aria-controls": string;
    "aria-labelledby": string;
    tabIndex: number;
  };
}

export const useExpandable = (defaultExpanded = false): ExpandableReturn => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [contentHeight, setContentHeight] = useState(0);
  // React 19 types useRef<T>(null) as RefObject<T | null>, which is the truth:
  // the ref really is null until mount. Under React 18 this file used
  // useRef<T>(null!) to paper over that; the assertion is gone and the return
  // type now says what actually happens.
  const contentRef = useRef<HTMLDivElement>(null);

  const id = useId();
  const labelId = `${id}-label`;
  const panelId = `${id}-panel`;

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
    [toggle],
  );

  return {
    isExpanded,
    toggle,
    contentRef,
    contentHeight,
    labelId,
    panelId,
    triggerProps: {
      onClick: toggle,
      onKeyDown,
      role: "button" as const,
      "aria-expanded": isExpanded,
      // The whole card header is the click target, which is good for pointers
      // but made the accessible name the entire card's text. Naming it from the
      // heading keeps the large hit area without the unreadable announcement,
      // and aria-controls ties it to the panel it opens.
      "aria-controls": panelId,
      "aria-labelledby": labelId,
      tabIndex: 0,
    },
  };
};
