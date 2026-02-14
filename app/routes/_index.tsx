import { Suspense } from "react";
import { defer, type LoaderFunctionArgs } from "@remix-run/cloudflare";
import { useLoaderData, Await } from "@remix-run/react";
import { ContentfulClient } from "~/lib/contentful";
import Preloader from "~/components/Preloader";
import CustomCursor from "~/components/CustomCursor";
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

export function loader({ context }: LoaderFunctionArgs) {
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
}

function SectionSkeleton() {
  return (
    <div className="py-32 flex justify-center">
      <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
    </div>
  );
}

export default function Index() {
  const { personal, experience, projects, skills, testimonials } =
    useLoaderData<typeof loader>();

  return (
    <>
      <Preloader />
      <CustomCursor />
      <div className="relative">
        <Navbar />
        <main>
          <Suspense fallback={<SectionSkeleton />}>
            <Await resolve={personal}>
              {(data) => (
                <>
                  <Hero personalInfo={data} />
                  <About personalInfo={data} />
                </>
              )}
            </Await>
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <Await resolve={experience}>
              {(data) => <Experience experiences={data} />}
            </Await>
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
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

          <Suspense fallback={<SectionSkeleton />}>
            <Await resolve={skills}>
              {(data) => <Skills skillCategories={data} />}
            </Await>
          </Suspense>

          <TacoBuilder />

          <Suspense fallback={<SectionSkeleton />}>
            <Await resolve={testimonials}>
              {(data) => <Testimonials testimonials={data} />}
            </Await>
          </Suspense>

          <Suspense fallback={<SectionSkeleton />}>
            <Await resolve={personal}>
              {(data) => <Contact personalInfo={data} />}
            </Await>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  );
}
