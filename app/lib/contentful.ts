// Types for each section's JSON content

export interface PersonalInfo {
  name: string;
  title: string;
  email: string;
  phone?: string;
  location?: string;
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
  location?: string;
  description: string;
  website?: string;
  imageUrl?: string;
  color?: string;
  achievements: { text: string; metric: string }[];
  technologies: string[];
}

export interface Project {
  name: string;
  slug: string;
  description: string;
  longDescription: string;
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
  technologies: string[];
  highlights: string[];
  featured: boolean;
  gradient?: string;
  category?: string;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  quote: string;
  avatarUrl?: string;
}

export interface SkillCategory {
  title: string;
  iconId: string;
  skills: string[];
}

// Contentful CDN types
interface SiteSectionEntry<T> {
  sys: { id: string };
  fields: {
    sectionId: string;
    title: string;
    content: T;
  };
}

interface ContentfulResponse<T> {
  items: SiteSectionEntry<T>[];
  total: number;
}

// Client — one fetch per section
export class ContentfulClient {
  private baseUrl: string;
  private accessToken: string;

  constructor(spaceId: string, accessToken: string) {
    this.accessToken = accessToken;
    this.baseUrl = `https://cdn.contentful.com/spaces/${spaceId}/environments/master`;
  }

  private async fetchSection<T>(sectionId: string): Promise<T> {
    const url = `${this.baseUrl}/entries?content_type=siteSection&fields.sectionId=${sectionId}&limit=1`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) {
      throw new Error(`Contentful error: ${res.status}`);
    }
    const data: ContentfulResponse<T> = await res.json();
    if (!data.items.length) {
      throw new Error(`Section "${sectionId}" not found`);
    }
    return data.items[0].fields.content;
  }

  getPersonal() {
    return this.fetchSection<PersonalInfo>("personal");
  }

  getExperience() {
    return this.fetchSection<Experience[]>("experience");
  }

  getProjects() {
    return this.fetchSection<Project[]>("projects");
  }

  getSkills() {
    return this.fetchSection<SkillCategory[]>("skills");
  }

  async getTestimonials() {
    try {
      return await this.fetchSection<Testimonial[]>("testimonials");
    } catch {
      return [] as Testimonial[];
    }
  }
}
