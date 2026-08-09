import type { AppLoadContext, EntryContext } from "@remix-run/cloudflare";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToReadableStream } from "react-dom/server";

const ABORT_DELAY = 5_000;

function setSecurityHeaders(headers: Headers, nonce: string) {
  // Prevent clickjacking
  headers.set("X-Frame-Options", "DENY");

  // Prevent MIME-type sniffing
  headers.set("X-Content-Type-Options", "nosniff");

  // Strict referrer — send origin only on cross-origin
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Restrict browser features not used by the site
  headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );

  // Content Security Policy
  headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      // Remix emits its hydration payload and ScrollRestoration as inline
      // <script> tags, which is what required 'unsafe-inline' here — not GA,
      // which loads by src. Those tags now carry this request's nonce, so the
      // wildcard can go. 'strict-dynamic' lets the nonced bundle load its own
      // chunks without every hashed filename needing an entry.
      `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://www.googletagmanager.com https://www.google-analytics.com`,
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      // Contentful is never contacted from the browser: images and the resume
      // are proxied same-origin through /asset/* and /resume, and the GraphQL
      // call happens in the Worker, outside the browser's CSP entirely. The
      // ctfassets and cdn.contentful.com entries (including a subdomain
      // wildcard) were widening the allowed set for nothing.
      "img-src 'self' data:",
      "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; "),
  );

  // HSTS — enforce HTTPS (1 year, include subdomains)
  headers.set(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains; preload",
  );
}

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
  loadContext: AppLoadContext,
) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ABORT_DELAY);
  const { nonce } = loadContext;

  const body = await renderToReadableStream(
    <RemixServer
      context={remixContext}
      url={request.url}
      abortDelay={ABORT_DELAY}
      nonce={nonce}
    />,
    {
      nonce,
      signal: controller.signal,
      onError(error: unknown) {
        if (!controller.signal.aborted) {
          console.error(error);
        }
        responseStatusCode = 500;
      },
    },
  );

  // Clear timeout so it doesn't fire after the stream is already closed
  body.allReady.then(() => clearTimeout(timeoutId));

  if (isbot(request.headers.get("user-agent") || "")) {
    await body.allReady;
  }

  responseHeaders.set("Content-Type", "text/html");
  setSecurityHeaders(responseHeaders, nonce);

  return new Response(body, {
    headers: responseHeaders,
    status: responseStatusCode,
  });
}
