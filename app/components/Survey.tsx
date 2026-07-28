import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";

const CityViewer = lazy(() => import("~/components/city/CityViewer"));

const STATS = [
  { value: "12,414", label: "buildings" },
  { value: "99.5%", label: "heights measured" },
  { value: "3.9 MB", label: "whole city" },
  { value: "4.4 km", label: "flight line" },
];

/**
 * The viewer pulls in three.js and starts streaming tiles as soon as it mounts,
 * so it stays behind a click rather than loading for every visitor who scrolls
 * past. `mounted` also keeps it off the server, where there is no WebGL context.
 */
const Stage = () => {
  const [launched, setLaunched] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!launched || !mounted) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-gradient-to-b from-[#1b1712] via-[#101012] to-[#0a0a0a]">
        <p className="max-w-md px-6 text-center text-sm text-text-secondary">
          Paseo de la Reforma in 3D, from the Ángel to Chapultepec — every
          building extruded to a height measured from public LiDAR.
        </p>
        <button
          type="button"
          onClick={() => setLaunched(true)}
          className="rounded border border-accent/40 bg-accent/10 px-5 py-2.5 font-mono text-sm text-accent transition hover:border-accent hover:bg-accent/20"
        >
          Launch viewer
        </button>
        <span className="font-mono text-xs text-text-muted">
          streams ~50 KB tiles on demand
        </span>
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-text-muted">
          Loading viewer…
        </div>
      }
    >
      <CityViewer />
    </Suspense>
  );
};

const Survey = () => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="reforma" className="relative py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        <div
          ref={ref}
          className={`mb-12 ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
        >
          <span className="section-label">{"// lidar"}</span>
          <h2 className="mt-2 font-mono text-3xl font-bold sm:text-4xl">
            Reforma in 3D
          </h2>
          <p className="mt-4 max-w-2xl text-text-secondary">
            Building footprints are widely available; their heights are not —
            only 7% of the buildings along Reforma carry one. So I measured them:
            every footprint is rasterised against INEGI&apos;s 1.5 m LiDAR
            surface and terrain models, giving a height for 99.5% of them. The
            towers come out within a few metres of their published figures. The
            viewer streams the city as 50 KB tiles through a memory-bounded LRU
            cache while the timeline flies the corridor.
          </p>
        </div>

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <div className="relative aspect-[16/10] w-full sm:aspect-[16/9]">
            <Stage />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border px-5 py-4">
            <dl className="flex flex-wrap gap-x-8 gap-y-2">
              {STATS.map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-xs text-text-muted">
                    {s.label}
                  </dt>
                  <dd className="font-mono text-sm text-text-primary">
                    {s.value}
                  </dd>
                </div>
              ))}
            </dl>
            <Link
              to="/lab/survey"
              className="font-mono text-sm text-accent transition hover:text-accent-dim"
            >
              Open full screen →
            </Link>
          </div>
        </div>

        {/* The INEGI credit stays in Spanish because that is the wording their
            terms of use prescribe, and the product name is a proper noun. */}
        <p className="mt-4 font-mono text-[11px] leading-relaxed text-text-muted">
          Elevation data — Fuente: INEGI, Modelos Digitales de Elevación de alta
          resolución LiDAR 1.5 m, sheets E14A39 B1–B4, 2020 edition. Building
          footprints © Overture Maps Foundation / © OpenStreetMap contributors
          (ODbL).
        </p>
      </div>
    </section>
  );
};

export default Survey;
