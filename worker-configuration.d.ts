/**
 * Cloudflare Worker bindings.
 *
 * `wrangler types` can regenerate this (npm run cf-typegen), but these three
 * are plain secrets set in the dashboard, so they are declared by hand to keep
 * the file readable and reviewable.
 */
declare module "cloudflare:workers" {
  interface Env {
    CONTENTFUL_SPACE_ID: string;
    CONTENTFUL_ACCESS_TOKEN: string;
    GA_MEASUREMENT_ID?: string;
  }
  export const env: Env;
}
