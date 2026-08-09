import { useEffect } from "react";
import { createFileRoute, useRouterState } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { env } from "cloudflare:workers";
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

const getSiteData = createServerFn().handler(async () => {
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );
  return client.getAllData();
});

export const Route = createFileRoute("/")({
  loader: () => getSiteData(),
  component: Index,
});

function Index() {
  const data = Route.useLoaderData();
  const hash = useRouterState({ select: (s) => s.location.hash });

  useEffect(() => {
    if (!hash) return;
    document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
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
}
