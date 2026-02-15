import { Link } from "@remix-run/react";
import type { MetaFunction } from "@remix-run/cloudflare";

export const meta: MetaFunction = () => [
  { title: "404 — Page Not Found | Alberto Moreno" },
];

const NotFound = () => (
  <div className="min-h-screen bg-bg flex items-center justify-center px-6">
    <div className="text-center max-w-md">
      <div className="font-mono text-accent text-8xl font-bold mb-4">404</div>
      <p className="text-text-secondary text-lg mb-2">Page not found</p>
      <p className="text-text-muted text-sm mb-8">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors font-mono text-sm"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
          />
        </svg>
        Back to home
      </Link>
    </div>
  </div>
);

export default NotFound;
