import { Suspense } from "react";
import { defer, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Await } from "@remix-run/react";
import { ContentfulClient, type SiteData } from "~/lib/contentful";
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
import HeroAboutSkeleton from "~/components/skeletons/HeroAboutSkeleton";
import ExperienceSkeleton from "~/components/skeletons/ExperienceSkeleton";
import ProjectsSkeleton from "~/components/skeletons/ProjectsSkeleton";
import SkillsSkeleton from "~/components/skeletons/SkillsSkeleton";
import TestimonialsSkeleton from "~/components/skeletons/TestimonialsSkeleton";
import ContactSkeleton from "~/components/skeletons/ContactSkeleton";

export const loader = ({ context }: LoaderFunctionArgs) => {
  const env = context.cloudflare.env as Env;
  const client = new ContentfulClient(
    env.CONTENTFUL_SPACE_ID,
    env.CONTENTFUL_ACCESS_TOKEN,
  );

  return defer({
    siteData: client.getAllData(),
  });
};

const Index = () => {
  const { siteData } = useLoaderData<typeof loader>();

  return (
    <div className="relative">
      <Navbar />
      <main>
        <Suspense fallback={<HeroAboutSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => (
              <>
                <Hero personalInfo={data.personal} />
                <About personalInfo={data.personal} />
              </>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<ExperienceSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => <Experience experiences={data.experience} />}
          </Await>
        </Suspense>

        <Suspense fallback={<ProjectsSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => (
              <Projects
                projects={data.projects}
                githubUrl={data.personal.githubUrl}
              />
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<SkillsSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => <Skills skillCategories={data.skills} />}
          </Await>
        </Suspense>

        <TacoBuilder />

        <Suspense fallback={<TestimonialsSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => (
              <Testimonials testimonials={data.testimonials} />
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<ContactSkeleton />}>
          <Await resolve={siteData}>
            {(data: SiteData) => <Contact personalInfo={data.personal} />}
          </Await>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
