import { useState } from "react";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import { useExpandable } from "~/hooks/useExpandable";
import type { Experience as ExperienceType } from "~/lib/contentful";
import { slugify } from "~/lib/slugify";

const ExperienceCard = ({
  experience,
  index,
}: {
  experience: ExperienceType;
  index: number;
}) => {
  const { ref, isVisible } = useScrollAnimation(0.15);
  const { isExpanded, contentRef, contentHeight, triggerProps } =
    useExpandable(true);
  const [imgError, setImgError] = useState(false);

  return (
    <div
      ref={ref}
      className={`relative pl-8 md:pl-12 pb-16 last:pb-0 transition-all duration-700 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Timeline line */}
      <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
      {/* Timeline dot */}
      <div className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1/2 ring-4 ring-bg bg-accent" />

      {/* Row: card left, preview right */}
      <div
        className={`flex flex-col ${
          experience.imageUrl || experience.website
            ? "md:flex-row md:gap-6 md:items-start"
            : ""
        }`}
      >
        {/* Card */}
        <div className="group flex-1 min-w-0 rounded-xl border border-border bg-card/50 hover:border-border-light transition-all duration-300">
          {/* Clickable header */}
          <div
            {...triggerProps}
            className="p-5 md:p-6 cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-t-xl"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
              <div>
                <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors font-mono">
                  {experience.company}
                </h3>
                <p className="text-accent/70 font-medium text-sm mt-0.5">
                  {experience.role}
                </p>
              </div>
              <span className="font-mono text-sm text-text-muted shrink-0">
                {experience.period}
              </span>
            </div>

            <p className="text-text-secondary text-sm leading-relaxed">
              {experience.description}
            </p>

            {/* Technologies — visible only when collapsed */}
            {!isExpanded && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {experience.technologies.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 text-xs font-mono rounded bg-surface text-text-secondary border border-border/50"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Expand indicator */}
            <div
              className={`${isExpanded ? "mt-4" : "mt-3"} flex items-center gap-2 text-accent/70 text-xs`}
            >
              <svg
                className={`expand-chevron w-4 h-4 ${
                  isExpanded ? "expand-chevron-open" : ""
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m19.5 8.25-7.5 7.5-7.5-7.5"
                />
              </svg>
              <span>{isExpanded ? "Hide details" : "Show details"}</span>
            </div>
          </div>

          {/* Expandable content */}
          <div
            className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
            style={{ maxHeight: isExpanded ? contentHeight : 0 }}
            aria-hidden={!isExpanded}
          >
            <div ref={contentRef}>
              <div className="px-5 md:px-6 pb-5 md:pb-6 pt-2 border-t border-border/30">
                {/* Key Achievements */}
                <div>
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-mono">
                    Key Achievements
                  </h4>
                  <div className="space-y-2.5">
                    {experience.achievements.map((achievement, i) => (
                      <div key={i} className="flex items-baseline gap-2.5">
                        <span className="w-1 h-1 rounded-full bg-accent shrink-0 translate-y-[-1px]" />
                        <p className="text-sm text-text-secondary leading-relaxed">
                          {achievement.text}
                          <span className="ml-1.5 text-xs font-mono font-medium text-accent">
                            {achievement.metric}
                          </span>
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technologies */}
                <div className="mt-6">
                  <h4 className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-3 font-mono">
                    Technologies
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {experience.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2.5 py-1 text-xs font-mono rounded-md bg-surface text-text-secondary border border-border/50 hover:border-accent/30 hover:text-accent transition-colors"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Company link */}
                {experience.website && (
                  <a
                    href={experience.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-5 text-xs text-text-muted hover:text-accent transition-colors font-mono"
                  >
                    {experience.website.replace("https://", "")}
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Website preview — outside the card */}
        {(experience.imageUrl || experience.website) && (
          <a
            href={experience.website || "#"}
            target={experience.website ? "_blank" : undefined}
            rel={experience.website ? "noopener noreferrer" : undefined}
            className="group/preview block shrink-0 mt-4 md:mt-0 md:w-64 lg:w-72 rounded-lg overflow-hidden border border-border/50 hover:border-accent/30 transition-colors duration-300"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-surface border-b border-border/50">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-border" />
                <span className="w-2 h-2 rounded-full bg-border" />
                <span className="w-2 h-2 rounded-full bg-border" />
              </div>
              {experience.website && (
                <div className="flex-1 ml-1.5 px-2 py-0.5 rounded bg-bg/60 text-[9px] font-mono text-text-muted truncate">
                  {experience.website.replace("https://", "")}
                </div>
              )}
            </div>
            {/* Screenshot or placeholder */}
            <div className="overflow-hidden">
              {!experience.imageUrl || imgError ? (
                <div className="w-full h-36 lg:h-40 bg-card flex items-center justify-center">
                  <span className="text-2xl font-bold font-mono text-text-muted">
                    {experience.company}
                  </span>
                </div>
              ) : (
                <img
                  src={`/asset/experience/${slugify(experience.company)}`}
                  alt={`${experience.company} website`}
                  className="w-full h-36 lg:h-40 object-cover object-top transition-transform duration-500 group-hover/preview:scale-105"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </a>
        )}
      </div>
    </div>
  );
};

const Experience = ({
  experiences,
}: {
  experiences: ExperienceType[];
}) => {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="experience" className="relative py-24">
      <div className="relative mx-auto max-w-5xl px-6">
        {/* Section header */}
        <div
          ref={ref}
          className={`mb-12 ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
        >
          <span className="section-label">// experience</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">
            Experience
          </h2>
        </div>

        {/* Timeline */}
        <div>
          {experiences.map((exp, i) => (
            <ExperienceCard key={exp.company} experience={exp} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
