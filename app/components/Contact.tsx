import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import type { PersonalInfo } from "~/lib/contentful";
import { trackCtaClick, trackSocialClick } from "~/lib/analytics";
import { GitHubIcon } from "~/components/ui/icons";
import { cn } from "~/lib/cn";

const Contact = ({ personalInfo }: { personalInfo: PersonalInfo }) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="contact" className="relative py-24">
      <div
        ref={ref}
        className={cn(
          "relative mx-auto max-w-2xl px-6 text-center",
          isVisible ? "scroll-visible" : "scroll-hidden",
        )}
      >
        <span className="section-label">// contact</span>
        <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2 mb-6">
          Get in Touch
        </h2>
        <p className="text-text-secondary text-lg leading-relaxed mb-12">
          I'm always open to discussing new opportunities, interesting projects,
          and collaborations. Whether you're looking for a senior engineer to
          lead your frontend architecture or want to discuss technology, feel
          free to reach out.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <a
            href={`mailto:${personalInfo.email}`}
            onClick={() => trackCtaClick("contact_say_hello")}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-accent text-accent font-semibold rounded-xl hover:bg-accent hover:text-bg transition-all duration-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
              />
            </svg>
            <span>Say Hello</span>
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1">
              →
            </span>
          </a>
        </div>

        {/* Social links */}
        <div className="flex items-center justify-center gap-6">
          {personalInfo.githubUrl && (
            <a
              href={personalInfo.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick("github")}
              className="group flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300">
                <GitHubIcon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium">GitHub</span>
            </a>
          )}

          {personalInfo.linkedinUrl && (
            <a
              href={personalInfo.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackSocialClick("linkedin")}
              className="group flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <span className="text-xs font-medium">LinkedIn</span>
            </a>
          )}

          <a
            href={`mailto:${personalInfo.email}`}
            onClick={() => trackSocialClick("email")}
            className="group flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors duration-300"
          >
            <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300">
              <svg
                className="w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                />
              </svg>
            </div>
            <span className="text-xs font-medium">Email</span>
          </a>

          {personalInfo.phone && (
            <a
              href={`tel:${personalInfo.phone}`}
              onClick={() => trackSocialClick("phone")}
              className="group flex flex-col items-center gap-2 text-text-muted hover:text-accent transition-colors duration-300"
            >
              <div className="w-12 h-12 rounded-xl border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-all duration-300">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
                  />
                </svg>
              </div>
              <span className="text-xs font-medium">Phone</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
