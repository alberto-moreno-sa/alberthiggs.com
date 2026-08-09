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

export interface SiteData {
  personal: PersonalInfo;
  experience: Experience[];
  projects: Project[];
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

    const get = <T>(id: string): T => {
      const content = sections.get(id);
      if (content === undefined) throw new Error(`Section "${id}" not found`);
      return content as T;
    };

    return {
      personal: get<PersonalInfo>("personal"),
      experience: get<Experience[]>("experience"),
      projects: get<Project[]>("projects"),
      skills: get<SkillCategory[]>("skills"),
      testimonials: sections.has("testimonials")
        ? (sections.get("testimonials") as Testimonial[])
        : [],
    };
  }
}
