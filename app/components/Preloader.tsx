import { useEffect, useState } from "react";

export default function Preloader() {
  const [isLoading, setIsLoading] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const minTimer = new Promise<void>((resolve) => setTimeout(resolve, 1500));

    const loadPromise = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });

    Promise.all([minTimer, loadPromise]).then(() => {
      setIsFading(true);
      setTimeout(() => {
        setIsLoading(false);
        document.body.style.overflow = "";
      }, 500);
    });

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!isLoading) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] bg-bg flex items-center justify-center ${
        isFading ? "preloader-fade-out" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-8">
        {/* Animated SVG circles */}
        <div className="relative w-32 h-32">
          <svg
            className="absolute inset-0 w-full h-full preloader-spin"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.5"
              strokeDasharray="8 12"
              opacity="0.6"
            />
          </svg>
          <svg
            className="absolute inset-0 w-full h-full preloader-spin-reverse"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="35"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.5"
              strokeDasharray="4 8"
              opacity="0.4"
            />
          </svg>
          <svg
            className="absolute inset-0 w-full h-full preloader-spin"
            style={{ animationDuration: "30s" }}
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="25"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="0.5"
              strokeDasharray="2 6"
              opacity="0.3"
            />
          </svg>
        </div>

        {/* Name */}
        <span className="font-mono text-sm text-text-muted tracking-[0.3em] uppercase">
          Alberto Moreno
        </span>
      </div>
    </div>
  );
}
