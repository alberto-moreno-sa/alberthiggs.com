import type { PersonalInfo } from "~/lib/contentful";
import { trackCtaClick } from "~/lib/analytics";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import { useCountUp } from "~/hooks/useCountUp";

/**
 * A hero stat, as the CMS actually provides it.
 *
 * `value` is free text typed into Contentful, so it is parsed rather than
 * trusted: "13+" counts to 13 and keeps the "+", "2M+" counts to 2 and keeps
 * "M+". Anything without a leading number — an empty field, or the "M+" this
 * field was briefly left as — is rendered verbatim and simply does not animate,
 * which is the honest fallback for a value we cannot interpret.
 */
const parseStatValue = (value: string) => {
  const match = value.trim().match(/^(\d+)(.*)$/);
  if (!match) return { target: 0, suffix: "", literal: value.trim() };
  return { target: parseInt(match[1], 10), suffix: match[2], literal: null };
};

const AnimatedStat = ({
  stat,
  index,
  isVisible,
}: {
  stat: { value: string; label: string };
  index: number;
  isVisible: boolean;
}) => {
  const { target, suffix, literal } = parseStatValue(stat.value);
  const displayValue = useCountUp(target, isVisible, { duration: 2000 });

  return (
    <div
      className="px-3 text-center sm:px-6"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <dt className="text-2xl sm:text-3xl font-bold text-accent font-mono mb-1">
        {literal ?? `${displayValue}${suffix}`}
      </dt>
      {/* `text-balance` keeps a long label like "Years Building Software" from
          breaking into a one-word orphan line. */}
      <dd className="text-[10px] sm:text-xs text-text-muted font-mono uppercase tracking-wider text-balance">
        {stat.label}
      </dd>
    </div>
  );
};

const Hero = ({ personalInfo }: { personalInfo: PersonalInfo }) => {
  const [firstName, ...rest] = personalInfo.name.split(" ");
  const lastName = rest.join(" ");
  const { ref: statsRef, isVisible: statsVisible } =
    useScrollAnimation<HTMLDListElement>(0.3);

  // heroStats is hand-authored JSON in the CMS. The data boundary guarantees
  // it is an array, but not that every entry is usable, so drop the ones that
  // would render as a blank column and cap the row at four — past that the
  // columns get too narrow to read on a phone.
  const stats = personalInfo.heroStats
    .filter((s) => s?.value?.trim() && s?.label?.trim())
    .slice(0, 4);
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-bg dot-grid" />

      {/* Animated SVG circles — fixed so they stay visible on scroll */}
      <div
        className="fixed right-[5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.15] md:opacity-[0.2] pointer-events-none z-0"
        aria-hidden="true"
      >
        <svg className="w-full h-full preloader-spin" viewBox="0 0 500 500">
          <circle
            cx="250"
            cy="250"
            r="240"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="10 20"
          />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full preloader-spin-reverse"
          viewBox="0 0 500 500"
        >
          <circle
            cx="250"
            cy="250"
            r="190"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="6 14"
          />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full preloader-spin"
          style={{ animationDuration: "35s" }}
          viewBox="0 0 500 500"
        >
          <circle
            cx="250"
            cy="250"
            r="140"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="3 10"
          />
        </svg>
        <svg
          className="absolute inset-0 w-full h-full preloader-spin-reverse"
          style={{ animationDuration: "45s" }}
          viewBox="0 0 500 500"
        >
          <circle
            cx="250"
            cy="250"
            r="90"
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="0.5"
            strokeDasharray="2 8"
          />
        </svg>
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        {/* Section label */}
        <div>
          <span className="section-label">// home</span>
        </div>

        {/* Name — no animation to avoid LCP render delay */}
        <div>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9] font-mono mt-4">
            {firstName}
            <br />
            <span className="text-accent">{lastName}</span>
          </h1>
        </div>

        {/* Title */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.15s", animationFillMode: "both" }}
        >
          <p className="mt-6 text-accent/70 font-mono text-sm sm:text-base tracking-wide">
            {personalInfo.title}
          </p>
        </div>

        {/* Tagline */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.25s", animationFillMode: "both" }}
        >
          <p className="mt-6 text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {personalInfo.heroTagline}
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#projects"
              onClick={() => trackCtaClick("hero_view_projects")}
              className="group px-8 py-3.5 border border-accent text-accent font-mono text-sm rounded-lg hover:bg-accent hover:text-bg transition-all duration-300"
            >
              View Projects
              <span className="inline-block ml-2 transition-transform duration-300 group-hover:translate-x-1">
                &rarr;
              </span>
            </a>
            <a
              href="#contact"
              onClick={() => trackCtaClick("hero_get_in_touch")}
              className="px-8 py-3.5 border border-border text-text-secondary font-mono text-sm rounded-lg hover:border-accent hover:text-accent transition-all duration-300"
            >
              Get in Touch
            </a>
            <a
              href="/resume"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 border border-border text-text-secondary font-mono text-sm rounded-lg hover:border-accent hover:text-accent transition-all duration-300"
            >
              Download Resume
            </a>
          </div>
        </div>

        {/* Stats — omitted entirely when the CMS has none, rather than leaving
            an empty block and its top margin behind. */}
        {stats.length > 0 && (
          <div
            className="animate-fade-in-up"
            style={{ animationDelay: "0.55s", animationFillMode: "both" }}
          >
            {/*
              Equal-width columns with the divider as a left border.
              This was a flex row whose items sized to their own text, plus a
              separator pulled into place with a negative margin that cancelled
              the parent gap. It held while every label was one short word;
              renaming one to "Years Building Software" made that column far
              wider than the others and pushed the dividers off true. A grid
              gives each stat the same width whatever the label says, and the
              border sits exactly on the boundary with no margin arithmetic.
            */}
            <dl
              ref={statsRef}
              className="mt-20 mx-auto grid max-w-xl divide-x divide-border"
              style={{
                gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))`,
              }}
            >
              {stats.map((stat, index) => (
                <AnimatedStat
                  key={stat.label}
                  stat={stat}
                  index={index}
                  isVisible={statsVisible}
                />
              ))}
            </dl>
          </div>
        )}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <a href="#about" aria-label="Scroll to about section">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-10 border border-accent/30 rounded-full flex justify-center hover:border-accent/50 transition-colors">
              <div className="w-1 h-2.5 bg-accent/50 rounded-full mt-2 animate-scroll-indicator" />
            </div>
            <span className="text-[9px] font-mono text-text-muted uppercase tracking-widest">
              Scroll
            </span>
          </div>
        </a>
      </div>
    </section>
  );
};

export default Hero;
