import { createMiddleware, createStart } from "@tanstack/react-start";
import { setResponseHeader } from "@tanstack/react-start/server";
import { securityHeaders } from "~/lib/securityHeaders";

/**
 * Per-request nonce, shared between the CSP header and the rendered markup.
 *
 * The router needs the nonce at construction time to stamp Start's inline
 * hydration script, and the header needs the identical value. Request
 * middleware runs before the router is built, so it is the one place that can
 * mint it once and hand it to both.
 */
let currentNonce: string | undefined;

export const takeNonce = (): string => {
  // getRouter() also runs in the browser during hydration, where there is no
  // middleware and no header to match. Any value works there because the
  // client never re-emits the nonced script.
  if (!currentNonce) return crypto.randomUUID();
  return currentNonce;
};

/**
 * Security headers for every response.
 *
 * These used to be applied from the root route's loader. That only covers
 * responses where a route component wins the match: a 404 rendered by
 * notFoundComponent, or a 500 from errorComponent, went out with no CSP, no
 * HSTS and no X-Frame-Options at all — verified with curl against the deployed
 * Worker. Request middleware runs on every request, so nothing slips past.
 */
const securityMiddleware = createMiddleware({ type: "request" }).server(
  ({ next }) => {
    const nonce = crypto.randomUUID();
    currentNonce = nonce;

    for (const [name, value] of Object.entries(securityHeaders(nonce))) {
      setResponseHeader(name, value);
    }

    return next();
  },
);

export const startInstance = createStart(() => ({
  requestMiddleware: [securityMiddleware],
}));
