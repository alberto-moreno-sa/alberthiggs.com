/**
 * Response headers for the HTML document.
 *
 * Under Remix these lived in entry.server.tsx. TanStack Start owns its server
 * entry, so they are applied from the root loader instead via
 * setResponseHeader — same headers, same per-request nonce, different seam.
 */
export const securityHeaders = (nonce: string): Record<string, string> => ({
  // Content only changes when Contentful is edited, so let the edge answer
  // repeat visits instead of re-running the Worker for a fetch and a full SSR
  // pass. stale-while-revalidate means a CMS edit never makes a visitor wait.
  "Cache-Control":
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",

  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME-type sniffing
  "X-Content-Type-Options": "nosniff",

  // Strict referrer — send origin only on cross-origin
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Restrict browser features not used by the site
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=()",

  // HSTS — enforce HTTPS (1 year, include subdomains)
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

  "Content-Security-Policy": [
    "default-src 'self'",

    // Start emits its hydration payload as an inline <script>, which is what
    // would otherwise require 'unsafe-inline' — not GA, which loads by src.
    // That tag carries this request's nonce instead.
    //
    // Deliberately NOT 'strict-dynamic': that keyword makes the browser ignore
    // 'self', and Cloudflare injects its own same-origin script at
    // /cdn-cgi/scripts/.../email-decode.min.js to un-obfuscate the mailto links
    // it rewrites. With strict-dynamic that script was blocked in production
    // and every email link stayed pointing at /cdn-cgi/l/email-protection.
    `script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com https://www.google-analytics.com`,

    // Justified: there are ~34 style={{...}} props in JSX, and inline style
    // attributes cannot carry a nonce.
    "style-src 'self' 'unsafe-inline'",

    "font-src 'self'",

    // Contentful is never contacted from the browser: images and the resume are
    // proxied same-origin through /asset/* and /resume, and the GraphQL call
    // happens in the Worker, outside the browser's CSP entirely.
    "img-src 'self' data:",
    "connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com",

    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; "),
});
