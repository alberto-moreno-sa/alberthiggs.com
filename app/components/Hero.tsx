import type { PersonalInfo } from "~/lib/contentful";
import { trackCtaClick } from "~/lib/analytics";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import { useCountUp } from "~/hooks/useCountUp";

const AnimatedStat = ({
  stat,
  index,
  isVisible,
}: {
  stat: { value: string; label: string };
  index: number;
  isVisible: boolean;
}) => {
  const match = stat.value.match(/^(\d+)(.*)$/);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : stat.value;
  const displayValue = useCountUp(target, isVisible, { duration: 2000 });

  return (
    <div className="text-center" style={{ animationDelay: `${index * 0.1}s` }}>
      <div className="text-2xl sm:text-3xl font-bold text-accent font-mono mb-1">
        {target > 0
          ? `${displayValue}${isVisible && displayValue >= target ? suffix : ""}`
          : stat.value}
      </div>
      <div className="text-[10px] sm:text-xs text-text-muted font-mono uppercase tracking-wider">
        {stat.label}
      </div>
    </div>
  );
};

const Hero = ({ personalInfo }: { personalInfo: PersonalInfo }) => {
  const [firstName, ...rest] = personalInfo.name.split(" ");
  const lastName = rest.join(" ");
  const { ref: statsRef, isVisible: statsVisible } = useScrollAnimation(0.3);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Dot grid background */}
      <div className="absolute inset-0 bg-bg dot-grid" />

      {/* Animated SVG circles */}
      <div
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[0.15] md:opacity-[0.2] pointer-events-none"
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
        <div className="animate-fade-in-up">
          <span className="section-label">// home</span>
        </div>

        {/* Name */}
        <div className="animate-fade-in-up" style={{ animationDelay: "0.15s" }}>
          <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight leading-[0.9] font-mono mt-4">
            {firstName}
            <br />
            <span className="text-accent">{lastName}</span>
          </h1>
        </div>

        {/* Title */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.3s", animationFillMode: "both" }}
        >
          <p className="mt-6 text-accent/70 font-mono text-sm sm:text-base tracking-wide">
            {personalInfo.title}
          </p>
        </div>

        {/* Tagline */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.4s", animationFillMode: "both" }}
        >
          <p className="mt-6 text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {personalInfo.heroTagline}
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.55s", animationFillMode: "both" }}
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

        {/* Stats */}
        <div
          className="animate-fade-in-up"
          style={{ animationDelay: "0.7s", animationFillMode: "both" }}
        >
          <div
            ref={statsRef}
            className="mt-20 flex items-center justify-center gap-8 sm:gap-16"
          >
            {personalInfo.heroStats.map((stat, index) => (
              <div
                key={stat.label}
                className="flex items-center gap-8 sm:gap-16"
              >
                {index > 0 && (
                  <div className="w-px h-10 bg-border -ml-8 sm:-ml-16" />
                )}
                <AnimatedStat
                  stat={stat}
                  index={index}
                  isVisible={statsVisible}
                />
              </div>
            ))}
          </div>
        </div>
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
