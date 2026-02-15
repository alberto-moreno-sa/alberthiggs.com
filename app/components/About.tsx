import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import type { PersonalInfo } from "~/lib/contentful";

const About = ({ personalInfo }: { personalInfo: PersonalInfo }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="about" className="relative py-24 overflow-hidden">
      <div
        ref={ref}
        className={`relative mx-auto max-w-4xl px-6 ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
      >
        {/* Section header */}
        <div className="mb-12">
          <span className="section-label">// about</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">
            About Me
          </h2>
        </div>

        <div className="space-y-6">
          {personalInfo.bio.map((paragraph, i) => (
            <p key={i} className="text-text-secondary text-lg leading-relaxed">
              {paragraph}
            </p>
          ))}

          {/* Key highlights */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {personalInfo.highlights.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                <span className="text-text-secondary text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Education */}
        {personalInfo.education && (
          <div className="mt-16 pt-8 border-t border-border/50">
            <div className="flex items-center gap-3 text-text-secondary">
              <svg
                className="w-4 h-4 text-accent shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342"
                />
              </svg>
              <span className="text-sm">{personalInfo.education}</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default About;
