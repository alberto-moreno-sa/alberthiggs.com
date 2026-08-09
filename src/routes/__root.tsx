import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
import { GoogleAnalytics } from "~/components/GoogleAnalytics";
import { rootLinks, rootMeta } from "~/lib/seo";
import appCss from "~/styles.css?url";

/**
 * The shell's server data.
 *
 * Takes no input: this is reachable as a public RPC endpoint, and it used to
 * accept the CSP nonce as an argument that flowed unvalidated into the
 * `script-src 'nonce-...'` directive. Security headers are set by request
 * middleware now (src/start.ts), so nothing crosses this boundary.
 */
const getShellData = createServerFn().handler(async () => ({
  gaTrackingId: env.GA_MEASUREMENT_ID ?? "",
}));

export const Route = createRootRoute({
  loader: () => getShellData(),
  head: () => ({
    meta: rootMeta,
    links: [...rootLinks, { rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  // TanStack calls this with { error, info, reset } — never with `status`.
  // Destructuring `status` here meant every failure rendered as a generic 500
  // and the actual error was never read, so a Contentful outage left no trace
  // in the Worker logs.
  errorComponent: ({ error, reset }) => {
    console.error("[root] render error:", error);
    return <ErrorPage status={500} onRetry={reset} />;
  },
  notFoundComponent: () => <ErrorPage status={404} />,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { gaTrackingId } = Route.useLoaderData();

  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        {/* WCAG 2.4.1 — without this, reaching the content by keyboard means
            tabbing past 8 nav links and the menu button on every page. */}
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <GoogleAnalytics gaTrackingId={gaTrackingId} />
        <Scripts />
      </body>
    </html>
  );
}

function ErrorPage({
  status = 500,
  onRetry,
}: {
  status?: number;
  onRetry?: () => void;
}) {
  const isNotFound = status === 404;

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-mono text-accent text-8xl font-bold mb-4">
          {status}
        </div>
        <p className="text-text-secondary text-lg mb-2">
          {isNotFound ? "Page not found" : "Something went wrong"}
        </p>
        <p className="text-text-muted text-sm mb-8">
          {isNotFound
            ? "The page you're looking for doesn't exist or has been moved."
            : "An unexpected error occurred. Please try again later."}
        </p>
        <div className="flex items-center justify-center gap-3">
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-accent/30 text-accent hover:bg-accent/10 transition-colors font-mono text-sm"
            >
              Try again
            </button>
          )}
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
              aria-hidden="true"
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
    </div>
  );
}

export default Outlet;
