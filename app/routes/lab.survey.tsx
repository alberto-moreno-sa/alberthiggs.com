import { Suspense, lazy, useEffect, useState } from "react";
import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/cloudflare";

const CityViewer = lazy(() => import("~/components/city/CityViewer"));

export const meta: MetaFunction = () => [
  { title: "Reforma — Alberto Moreno" },
  {
    name: "description",
    content:
      "A streaming 3D flyover of Paseo de la Reforma, with the height of 12,414 buildings measured from INEGI's public LiDAR surface and terrain models.",
  },
];

export default function LabSurvey() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="fixed inset-0 overflow-hidden bg-[#0a0b0d]">
      {mounted ? (
        <Suspense
          fallback={
            <div className="absolute inset-0 flex items-center justify-center font-mono text-sm text-text-muted">
              Loading viewer…
            </div>
          }
        >
          <CityViewer />
        </Suspense>
      ) : null}

      <Link
        to="/#reforma"
        className="absolute left-4 top-4 z-20 rounded border border-white/10 bg-black/50 px-3 py-1.5 font-mono text-xs text-white/70 backdrop-blur transition hover:text-white"
      >
        ← back
      </Link>

      {/* Kept top-left, clear of the centred timeline at any viewport width. */}
      <p className="pointer-events-none absolute left-4 top-14 z-20 max-w-[15rem] font-mono text-[10px] leading-relaxed text-white/30">
        Fuente: INEGI, Modelos Digitales de Elevación de alta resolución LiDAR
        1.5 m (superficie y terreno), carta E14A39 B1–B4, edición 2020. Huellas
        de edificio © Overture Maps Foundation / © OpenStreetMap contributors
        (ODbL).
      </p>
    </div>
  );
}
