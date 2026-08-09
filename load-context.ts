import { type AppLoadContext } from "@remix-run/cloudflare";
import { type PlatformProxy } from "wrangler";

type Cloudflare = Omit<PlatformProxy<Env>, "dispose">;

declare module "@remix-run/cloudflare" {
  interface AppLoadContext {
    cloudflare: Cloudflare;
    /**
     * Per-request CSP nonce.
     *
     * Minted here rather than in entry.server because both sides need it: the
     * root loader hands it to <Scripts>/<ScrollRestoration> so their inline
     * tags carry it, and handleRequest puts the same value in the header. A
     * nonce generated at render time would be too late for the loader.
     */
    nonce: string;
  }
}

type GetLoadContext = (args: {
  request: Request;
  context: { cloudflare: Cloudflare };
}) => AppLoadContext;

export const getLoadContext: GetLoadContext = ({ context }) => {
  return { ...context, nonce: crypto.randomUUID() };
};
