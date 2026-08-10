import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  // A placeholder. src/server.ts rewrites every nonce attribute on the way out
  // and sets the CSP header to match, so the value used at render time never
  // reaches the browser — which is what lets the rendered HTML be cached.
  const nonce = crypto.randomUUID();

  return createTanStackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreload: "intent",
    // Not 0: with intent-preloading, a zero stale time means the preload
    // fetched on hover is already stale by the time the click lands, so the
    // loader runs twice. Content only changes when the CMS is edited.
    defaultPreloadStaleTime: 30_000,
    ssr: { nonce },
  });
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
