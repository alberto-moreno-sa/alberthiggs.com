/**
 * Scheme validation for URLs that come from the CMS.
 *
 * `asset.$type.$slug.ts` and `resume.ts` already validate Contentful URLs
 * before fetching them, but the same values are also rendered straight into
 * `href` attributes. React does not sanitise the scheme on a normal anchor, so
 * a `javascript:` or `data:text/html,` value written into a CMS text field
 * would execute on click — stored XSS gated only on the CMS staying honest.
 *
 * Returns undefined for anything that is not a safe scheme, so callers can drop
 * the link entirely rather than render a dead or dangerous one.
 */

const SAFE_LINK_PROTOCOLS = new Set(["https:", "http:"]);
const SAFE_CONTACT_PROTOCOLS = new Set(["mailto:", "tel:"]);

const protocolOf = (value: string): string | undefined => {
  try {
    return new URL(value).protocol;
  } catch {
    return undefined;
  }
};

/** An absolute http(s) URL, or undefined. */
export const safeHttpUrl = (value?: string): string | undefined => {
  if (!value) return undefined;
  const protocol = protocolOf(value.trim());
  return protocol && SAFE_LINK_PROTOCOLS.has(protocol)
    ? value.trim()
    : undefined;
};

/**
 * A `mailto:`/`tel:` URL built from a CMS value, or undefined.
 *
 * Phone numbers legitimately contain spaces, dashes and parentheses, so those
 * are stripped for `tel:` rather than rejected. An address containing
 * whitespace is not a valid mailbox, so it is rejected outright — that is also
 * what would let a newline smuggle extra headers into a mailto: target.
 */
export const safeContactUrl = (
  scheme: "mailto" | "tel",
  value?: string,
): string | undefined => {
  if (!value) return undefined;

  const cleaned =
    scheme === "tel" ? value.replace(/[\s()-]/g, "") : value.trim();
  if (!cleaned || /\s/.test(cleaned)) return undefined;

  // `?` opens mailto header fields and `%` can carry an encoded CRLF, either of
  // which turns an address into an injected Bcc/Subject. Real addresses and
  // phone numbers need neither.
  if (/[?%]/.test(cleaned)) return undefined;

  const protocol = protocolOf(`${scheme}:${cleaned}`);
  return protocol && SAFE_CONTACT_PROTOCOLS.has(protocol)
    ? `${scheme}:${cleaned}`
    : undefined;
};
