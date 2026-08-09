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
  typeof v.email === "string" &&
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
      cf: { cacheTtl: 3600, cacheEverything: true },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

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

    return {
      personal,
      experience: getList("experience", isExperience),
      // Resolve the category fallback once, at the boundary, so the UI can
      // treat `category` as always present.
      projects: getList("projects", isProject).map((p) => ({
        ...p,
        category: p.category ?? DEFAULT_CATEGORY,
      })),
      skills: getList("skills", isSkillCategory),
      testimonials: getList("testimonials", isTestimonial),
    };
  }
}
