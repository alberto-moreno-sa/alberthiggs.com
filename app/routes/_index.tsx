import { useEffect } from "react";
import {
  json,
  type HeadersFunction,
  type LoaderFunctionArgs,
} from "@remix-run/cloudflare";
import { useLoaderData, useLocation } from "@remix-run/react";
import { ContentfulClient } from "~/lib/contentful";
import Navbar from "~/components/Navbar";
import Hero from "~/components/Hero";
import About from "~/components/About";
import Experience from "~/components/Experience";
import Projects from "~/components/Projects";
import Skills from "~/components/Skills";
import Contact from "~/components/Contact";
import Testimonials from "~/components/Testimonials";
import Footer from "~/components/Footer";
import TacoBuilder from "~/components/TacoBuilder";
import Survey from "~/components/Survey";

export const loader = async ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env;
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );

  const siteData = await client.getAllData();
  return json(siteData);
};

/**
 * Serve the rendered document from Cloudflare's edge cache.
 *
 * Content only changes when Contentful is edited, so there is no reason to
 * re-invoke the Worker (fetch + SSR) on every visit. `max-age=0` keeps the
 * browser revalidating while `s-maxage` lets the edge answer directly;
 * `stale-while-revalidate` means a CMS edit never makes a visitor wait.
 */
export const headers: HeadersFunction = () => ({
  "Cache-Control":
    "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
});

const Index = () => {
  const data = useLoaderData<typeof loader>();
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  }, [hash]);

  return (
    <div className="relative">
      <Navbar />
      <main id="main-content">
        <Hero personalInfo={data.personal} />
        <About personalInfo={data.personal} />
        <Experience experiences={data.experience} />
        <Projects
          projects={data.projects}
          githubUrl={data.personal.githubUrl}
        />
        <Skills skillCategories={data.skills} />
        <Survey />
        <TacoBuilder />
        <Testimonials testimonials={data.testimonials} />
        <Contact personalInfo={data.personal} />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
