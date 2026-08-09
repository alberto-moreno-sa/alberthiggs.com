import { safeContactUrl, safeHttpUrl } from "./safeUrl";

// Types for each section's JSON content

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  heroTagline: string;
  heroStats: { value: string; label: string }[];
  bio: string[];
  highlights: string[];
  education?: string;
  resumeUrl?: string;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  description: string;
  website?: string;
  imageUrl?: string;
  achievements: { text: string; metric: string }[];
  technologies: string[];
}

export interface Project {
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  technologies: string[];
  highlights: string[];
  featured: boolean;
  category?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl?: string;
  linkedInUrl?: string;
}

export interface SkillCategory {
  title: string;
  iconId: string;
  skills: string[];
}

/** Default bucket for projects the CMS left uncategorised. */
export const DEFAULT_CATEGORY = "Other";

/**
 * A Project after the data boundary has filled in its optional fields.
 * Components consume this, so they never repeat the `?? "Other"` fallback.
 */
export type ResolvedProject = Project & { category: string };

export interface SiteData {
  personal: PersonalInfo;
  experience: Experience[];
  projects: ResolvedProject[];
  skills: SkillCategory[];
  testimonials: Testimonial[];
}

// GraphQL response types
interface GraphQLResponse {
  data: {
    siteSectionCollection: {
      items: { sectionId: string; content: unknown }[];
    };
  };
  errors?: { message: string }[];
}

const ALL_SECTIONS_QUERY = `{
  siteSectionCollection {
    items {
      sectionId
      content
    }
  }
}`;

/**
 * Isolate-level memo of the parsed site data.
 *
 * `/asset/:type/:slug` calls getAllData() just to look up one image URL, so a
 * cold page render can run this query once per image on top of the document
 * loader. Cloudflare already edge-caches the GraphQL response (cacheTtl below)
 * and the asset responses themselves, so this is not a per-visitor cost — but
 * within a single isolate it still means re-fetching and re-parsing the whole
 * payload N times. Keyed by space so a config change can't serve stale data.
 */
const MEMO_TTL_MS = 60_000;
let memo: { key: string; expires: number; data: SiteData } | null = null;

/** Contentful can hang; the other outbound fetches already bound themselves. */
const FETCH_TIMEOUT_MS = 8000;

// ── Runtime shape checks ──────────────────────────────────────────────────
//
// Section content is hand-authored JSON in a Contentful text field, so nothing
// upstream validates it. Without these, a renamed field or a `technologies`
// that arrives as a string instead of an array reaches the components as-is:
// `.map` over a string iterates characters and silently renders one-letter
// chips. These checks cover exactly the fields the UI dereferences unguarded.

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isStringArray = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every((x) => typeof x === "string");

const isPersonalInfo = (v: unknown): v is PersonalInfo =>
  isObject(v) &&
  typeof v.name === "string" &&
  typeof v.title === "string" &&
  // Rendered into `mailto:` unguarded, so an address that cannot form a safe
  // URL is a broken section, not a droppable field.
  typeof v.email === "string" &&
  safeContactUrl("mailto", v.email) !== undefined &&
  // Interpolated into `tel:` by Contact.tsx. Not an XSS vector (React escapes
  // the attribute and the scheme is fixed in code), but it was the one href
  // field skipping the sanitising layer.
  (v.phone === undefined ||
    (typeof v.phone === "string" &&
      safeContactUrl("tel", v.phone) !== undefined)) &&
  typeof v.heroTagline === "string" &&
  Array.isArray(v.heroStats) &&
  isStringArray(v.bio) &&
  isStringArray(v.highlights);

const isExperience = (v: unknown): v is Experience =>
  isObject(v) &&
  typeof v.company === "string" &&
  typeof v.role === "string" &&
  typeof v.period === "string" &&
  typeof v.description === "string" &&
  Array.isArray(v.achievements) &&
  isStringArray(v.technologies);

const isProject = (v: unknown): v is Project =>
  isObject(v) &&
  typeof v.name === "string" &&
  typeof v.slug === "string" &&
  typeof v.shortDescription === "string" &&
  typeof v.longDescription === "string" &&
  isStringArray(v.technologies) &&
  isStringArray(v.highlights);

const isSkillCategory = (v: unknown): v is SkillCategory =>
  isObject(v) &&
  typeof v.title === "string" &&
  typeof v.iconId === "string" &&
  isStringArray(v.skills);

const isTestimonial = (v: unknown): v is Testimonial =>
  isObject(v) &&
  typeof v.name === "string" &&
  typeof v.role === "string" &&
  typeof v.company === "string" &&
  typeof v.quote === "string";

// Client — single GraphQL query for all sections
export class ContentfulClient {
  private graphqlUrl: string;
  private accessToken: string;
  private spaceId: string;

  constructor(spaceId: string, accessToken: string) {
    // Fail here, naming the binding, rather than building a broken URL and
    // surfacing an opaque fetch error three frames later. A freshly deployed
    // Worker with no secrets set hits exactly this.
    if (!spaceId || !accessToken) {
      throw new Error(
        `Contentful is not configured: ${!spaceId ? "CONTENTFUL_SPACE_ID" : ""}${!spaceId && !accessToken ? " and " : ""}${!accessToken ? "CONTENTFUL_ACCESS_TOKEN" : ""} missing from the Worker environment`,
      );
    }
    this.spaceId = spaceId;
    this.accessToken = accessToken;
    this.graphqlUrl = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master`;
  }

  async getAllData(): Promise<SiteData> {
    const now = Date.now();
    if (memo && memo.key === this.spaceId && memo.expires > now) {
      return memo.data;
    }

    const data = await this.fetchAllData();
    memo = { key: this.spaceId, expires: now + MEMO_TTL_MS, data };
    return data;
  }

  private async fetchAllData(): Promise<SiteData> {
    console.log("[Contentful] Fetching via GraphQL");
    const res = await fetch(this.graphqlUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: JSON.stringify({ query: ALL_SECTIONS_QUERY }),
      // NOTE: this is a POST, and the Workers fetch cache does not cache POST
      // requests — `cf-cache-status` comes back DYNAMIC, not HIT/MISS. The
      // directive is kept because it costs nothing and would apply if this ever
      // moves to GET, but it buys nothing today. The real protection against a
      // round trip per request is the isolate memo above plus the edge cache on
      // the HTML document, which needs a text/html Cache Rule on the zone.
      // `cf` is a Cloudflare extension to RequestInit, hence the widening cast.
      cf: { cacheTtl: 3600, cacheEverything: true },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    } as RequestInit);

    console.log(
      "[Contentful] cf-cache-status:",
      res.headers.get("cf-cache-status"),
    );

    if (!res.ok) {
      throw new Error(`Contentful GraphQL error: ${res.status}`);
    }

    const json: GraphQLResponse = await res.json();
    if (json.errors?.length) {
      throw new Error(`Contentful GraphQL: ${json.errors[0].message}`);
    }

    const sections = new Map(
      json.data.siteSectionCollection.items.map((item) => [
        item.sectionId,
        item.content,
      ]),
    );

    /**
     * Read a list section, dropping entries that fail their shape check.
     *
     * A malformed or missing list degrades that one section (the components
     * already return null on an empty array) instead of failing the whole
     * page. Anything dropped is logged with its section id, so the Worker log
     * names the culprit rather than surfacing `undefined.map` from a component.
     */
    const getList = <T>(id: string, isValid: (v: unknown) => v is T): T[] => {
      const content = sections.get(id);
      if (content == null) {
        console.warn(`[Contentful] Section "${id}" missing — rendering empty`);
        return [];
      }
      if (!Array.isArray(content)) {
        console.warn(`[Contentful] Section "${id}" is not an array — skipping`);
        return [];
      }

      const valid = content.filter(isValid);
      if (valid.length !== content.length) {
        console.warn(
          `[Contentful] Section "${id}": dropped ${content.length - valid.length}/${content.length} malformed entries`,
        );
      }
      return valid;
    };

    // The page is meaningless without `personal`, so this one still throws —
    // but with a message that says which section and what was wrong.
    const personal = sections.get("personal");
    if (!isPersonalInfo(personal)) {
      throw new Error(
        `Contentful section "personal" is missing or malformed (expected name, title, email, heroTagline, heroStats[], bio[], highlights[]); got: ${JSON.stringify(personal)?.slice(0, 200)}`,
      );
    }

    /**
     * Strip any link the browser must not follow.
     *
     * These fields are free text in the CMS and get rendered straight into
     * `href`. React does not sanitise an anchor's scheme, so a `javascript:`
     * value would execute on click. Dropping it here means the component's
     * existing `{url && <a …>}` guard simply omits the link — no call site
     * needs to know. The image fields also feed `resolveImageUrl`, which
     * validates the host separately before fetching.
     */
    const sanitizeLinks = <T extends object>(
      entry: T,
      fields: ReadonlyArray<keyof T>,
    ): T => {
      const out = { ...entry };
      for (const field of fields) {
        const raw = out[field];
        if (typeof raw !== "string") continue;
        const safe = safeHttpUrl(raw);
        if (safe === undefined) {
          console.warn(
            `[Contentful] Dropped unsafe URL in "${String(field)}": ${raw.slice(0, 60)}`,
          );
        }
        out[field] = safe as T[keyof T];
      }
      return out;
    };

    return {
      personal: sanitizeLinks(personal, [
        "githubUrl",
        "linkedinUrl",
        "resumeUrl",
      ]),
      experience: getList("experience", isExperience).map((e) =>
        sanitizeLinks(e, ["website", "imageUrl"]),
      ),
      // Resolve the category fallback once, at the boundary, so the UI can
      // treat `category` as always present.
      projects: getList("projects", isProject).map((p) => ({
        ...sanitizeLinks(p, ["githubUrl", "liveUrl", "imageUrl"]),
        category: p.category ?? DEFAULT_CATEGORY,
      })),
      skills: getList("skills", isSkillCategory),
      testimonials: getList("testimonials", isTestimonial).map((t) =>
        sanitizeLinks(t, ["avatarUrl", "linkedInUrl"]),
      ),
    };
  }
}
