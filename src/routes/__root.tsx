import {
  HeadContent,
  Link,
  Outlet,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { env } from "cloudflare:workers";
import { GoogleAnalytics } from "~/components/GoogleAnalytics";
import { rootLinks, rootMeta } from "~/lib/seo";
import { securityHeaders } from "~/lib/securityHeaders";
import appCss from "~/styles.css?url";

/**
 * Applies the document's response headers and hands back the shell's data.
 *
 * The nonce comes from the router (see src/router.tsx) so the value in the CSP
 * header is the same one stamped on Start's inline hydration script.
 */
const getShellData = createServerFn()
  .inputValidator((nonce: string) => nonce)
  .handler(async ({ data: nonce }) => {
    for (const [name, value] of Object.entries(securityHeaders(nonce))) {
      setResponseHeader(name, value);
    }

    return { gaTrackingId: env.GA_MEASUREMENT_ID ?? "" };
  });

export const Route = createRootRouteWithContext<{ nonce: string }>()({
  loader: ({ context }) => getShellData({ data: context.nonce }),
  head: () => ({
    meta: rootMeta,
    links: [...rootLinks, { rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootDocument,
  errorComponent: ErrorPage,
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

function ErrorPage({ status = 500 }: { status?: number }) {
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
  );
}

export default Outlet;
