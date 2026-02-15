import {
  Links,
  Link,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useRouteLoaderData,
  isRouteErrorResponse,
  useRouteError,
} from "@remix-run/react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/cloudflare";
import { json } from "@remix-run/cloudflare";
import { GoogleAnalytics } from "~/components/GoogleAnalytics";
import { rootMeta, rootLinks } from "~/lib/seo";
import "./app.css";

export const links: LinksFunction = () => rootLinks;

export const meta: MetaFunction = () => rootMeta;

export function loader({ context }: LoaderFunctionArgs) {
  const env = context.cloudflare.env as Env;
  return json({ gaTrackingId: env.GA_MEASUREMENT_ID ?? "" });
}

export function Layout({ children }: { children: React.ReactNode }) {
  const data = useRouteLoaderData<typeof loader>("root");

  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <GoogleAnalytics gaTrackingId={data?.gaTrackingId} />
      </head>
      <body className="bg-bg text-text-primary antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary() {
  const error = useRouteError();

  let status = 500;
  let message = "Something went wrong";

  if (isRouteErrorResponse(error)) {
    status = error.status;
    message =
      error.status === 404
        ? "Page not found"
        : error.statusText || "Something went wrong";
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <div className="font-mono text-accent text-8xl font-bold mb-4">
          {status}
        </div>
        <p className="text-text-secondary text-lg mb-2">{message}</p>
        <p className="text-text-muted text-sm mb-8">
          {status === 404
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
