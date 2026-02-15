import { Suspense } from "react";
import { defer, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Await } from "@remix-run/react";
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
    personal: client.getPersonal(),
    experience: client.getExperience(),
    projects: client.getProjects(),
    skills: client.getSkills(),
    testimonials: client.getTestimonials(),
  });
};

const Index = () => {
  const { personal, experience, projects, skills, testimonials } =
    useLoaderData<typeof loader>();

  return (
    <div className="relative">
      <Navbar />
      <main>
        <Suspense fallback={<HeroAboutSkeleton />}>
          <Await resolve={personal}>
            {(data) => (
              <>
                <Hero personalInfo={data} />
                <About personalInfo={data} />
              </>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<ExperienceSkeleton />}>
          <Await resolve={experience}>
            {(data) => <Experience experiences={data} />}
          </Await>
        </Suspense>

        <Suspense fallback={<ProjectsSkeleton />}>
          <Await resolve={projects}>
            {(data) => (
              <Suspense fallback={null}>
                <Await resolve={personal}>
                  {(personalData) => (
                    <Projects
                      projects={data}
                      githubUrl={personalData.githubUrl}
                    />
                  )}
                </Await>
              </Suspense>
            )}
          </Await>
        </Suspense>

        <Suspense fallback={<SkillsSkeleton />}>
          <Await resolve={skills}>
            {(data) => <Skills skillCategories={data} />}
          </Await>
        </Suspense>

        <TacoBuilder />

        <Suspense fallback={<TestimonialsSkeleton />}>
          <Await resolve={testimonials}>
            {(data) => <Testimonials testimonials={data} />}
          </Await>
        </Suspense>

        <Suspense fallback={<ContactSkeleton />}>
          <Await resolve={personal}>
            {(data) => <Contact personalInfo={data} />}
          </Await>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
