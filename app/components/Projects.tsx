import { useState, useMemo, useRef } from "react";
import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import { useExpandable } from "~/hooks/useExpandable";
import type { Project } from "~/lib/contentful";

const ChevronLeft = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
  </svg>
);

const ProjectSlider = ({
  children,
  gap = 24,
  label,
  showControls,
}: {
  children: React.ReactNode;
  gap?: number;
  label: string;
  showControls: boolean;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  };

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth =
      el.querySelector<HTMLElement>(":scope > *")?.offsetWidth ?? 300;
    el.scrollBy({
      left: direction === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-text-secondary font-mono">
          {label}
        </h3>
        {showControls && (
          <SliderControls
            canScrollLeft={canScrollLeft}
            canScrollRight={canScrollRight}
            onScrollLeft={() => scroll("left")}
            onScrollRight={() => scroll("right")}
          />
        )}
      </div>
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex sm:items-start overflow-x-auto pb-4 snap-x snap-mandatory slider-scroll"
        style={{ gap }}
      >
        {children}
      </div>
    </div>
  );
};

const SliderControls = ({
  canScrollLeft,
  canScrollRight,
  onScrollLeft,
  onScrollRight,
}: {
  canScrollLeft: boolean;
  canScrollRight: boolean;
  onScrollLeft: () => void;
  onScrollRight: () => void;
}) => (
  <div className="hidden sm:flex items-center gap-2">
    <button
      onClick={onScrollLeft}
      disabled={!canScrollLeft}
      aria-label="Scroll left"
      className="p-1.5 rounded-lg border border-border text-text-muted hover:text-accent hover:border-accent/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <ChevronLeft className="w-4 h-4" />
    </button>
    <button
      onClick={onScrollRight}
      disabled={!canScrollRight}
      aria-label="Scroll right"
      className="p-1.5 rounded-lg border border-border text-text-muted hover:text-accent hover:border-accent/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);

const FeaturedProject = ({
  project,
  index,
}: {
  project: Project;
  index: number;
}) => {
  const { isExpanded, contentRef, contentHeight, triggerProps } =
    useExpandable();

  return (
    <div
      className="group relative rounded-xl border border-border bg-card/50 overflow-hidden hover:border-border-light transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 h-full flex flex-col animate-fade-in-up"
      style={{ animationDelay: `${index * 150}ms` }}
    >
      {/* Image thumbnail or accent bar */}
      {project.imageUrl ? (
        <div className="aspect-video overflow-hidden">
          <img
            src={`/asset/project/${project.slug}`}
            alt={project.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      ) : (
        <div className="h-1 bg-accent/30" />
      )}

      <div className="p-6 md:p-8 flex-1 flex flex-col">
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {project.featured && (
              <span className="text-xs font-mono text-accent border border-accent/30 px-2 py-0.5 rounded">
                Featured
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
                aria-label={`View ${project.name} on GitHub`}
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-accent transition-colors"
                aria-label={`View ${project.name} live`}
              >
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
                    d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                  />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors mb-3 font-mono">
          {project.name}
        </h3>

        {/* Description */}
        <p className={`text-text-secondary text-sm leading-relaxed mb-4 ${isExpanded ? "" : "line-clamp-5"}`}>
          {project.longDescription}
        </p>

        {/* Expand trigger */}
        <div className="mt-auto" />
        <div
          {...triggerProps}
          className="flex items-center gap-2 text-accent/70 text-xs cursor-pointer select-none mb-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          <svg
            className={`expand-chevron w-4 h-4 ${isExpanded ? "expand-chevron-open" : ""}`}
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
          <span>{isExpanded ? "Hide details" : "View details"}</span>
        </div>

        {/* Expandable content */}
        <div
          className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
          style={{ maxHeight: isExpanded ? contentHeight : 0 }}
          aria-hidden={!isExpanded}
        >
          <div ref={contentRef}>
            <div className="pt-4 border-t border-border/30">
              {/* Highlights */}
              <div className="space-y-2 mb-6">
                {project.highlights.map((highlight, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                    <span className="text-xs text-text-muted">{highlight}</span>
                  </div>
                ))}
              </div>

              {/* Technologies */}
              <div>
                <h4 className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2 font-mono">
                  Technologies
                </h4>
                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-2 py-0.5 text-xs font-mono text-accent/70 bg-accent/5 border border-accent/10 rounded"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SmallProject = ({ project, index }: { project: Project; index: number }) => {
  const { isExpanded, contentRef, contentHeight, triggerProps } =
    useExpandable();

  return (
    <div
      className="group rounded-xl border border-border bg-card/30 p-5 hover:border-border-light transition-all duration-300 hover:-translate-y-0.5 animate-fade-in-up"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="h-1 w-8 rounded-full bg-accent/30" />
        <div className="flex items-center gap-2">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-accent transition-colors"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
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

      <div
        {...triggerProps}
        className="cursor-pointer select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
      >
        <h4 className="font-bold text-text-primary group-hover:text-accent transition-colors mb-2 font-mono">
          {project.name}
        </h4>
        <p className="text-text-secondary text-xs leading-relaxed mb-3">
          {project.description}
        </p>

        <div className="flex items-center gap-1 text-accent/70 text-[10px]">
          <svg
            className={`expand-chevron w-3 h-3 ${isExpanded ? "expand-chevron-open" : ""}`}
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
          <span>{isExpanded ? "Less" : "More"}</span>
        </div>
      </div>

      {/* Expandable tech stack */}
      <div
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
        style={{ maxHeight: isExpanded ? contentHeight : 0 }}
        aria-hidden={!isExpanded}
      >
        <div ref={contentRef}>
          <div className="pt-3 mt-3 border-t border-border/30">
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 text-[10px] font-mono text-text-muted bg-surface border border-border/30 rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProjectFilterTabs = ({
  categories,
  activeCategory,
  onSelect,
}: {
  categories: string[];
  activeCategory: string;
  onSelect: (cat: string) => void;
}) => (
  <div
    className="flex flex-wrap gap-2 mb-12"
    role="tablist"
    aria-label="Filter projects by category"
  >
    {categories.map((cat) => (
      <button
        key={cat}
        role="tab"
        aria-selected={activeCategory === cat}
        onClick={() => onSelect(cat)}
        className={`px-3 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm font-mono rounded-lg border transition-all duration-300 ${
          activeCategory === cat
            ? "bg-accent text-bg border-accent"
            : "border-border text-text-muted hover:border-accent/30 hover:text-accent bg-card/30"
        }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

const Projects = ({
  projects,
  githubUrl,
}: {
  projects: Project[];
  githubUrl?: string;
}) => {
  const { ref, isVisible } = useScrollAnimation();
  const [activeCategory, setActiveCategory] = useState("All");
  const [transitioning, setTransitioning] = useState(false);

  const categories = useMemo(() => {
    const cats = new Set(projects.map((p) => p.category || "Other"));
    return ["All", ...Array.from(cats).sort()];
  }, [projects]);

  const filteredProjects = useMemo(
    () =>
      activeCategory === "All"
        ? projects
        : projects.filter((p) => (p.category || "Other") === activeCategory),
    [projects, activeCategory],
  );

  const featured = filteredProjects.filter((p) => p.featured);
  const other = filteredProjects.filter((p) => !p.featured);

  const handleCategorySelect = (cat: string) => {
    if (cat === activeCategory) return;
    setTransitioning(true);
    setTimeout(() => {
      setActiveCategory(cat);
      setTransitioning(false);
    }, 200);
  };

  return (
    <section id="projects" className="relative py-16 md:py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div
          ref={ref}
          className={`mb-12 ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
        >
          <span className="section-label">// projects</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">
            Projects
          </h2>
        </div>

        {/* Category filter tabs */}
        {categories.length > 2 && (
          <ProjectFilterTabs
            categories={categories}
            activeCategory={activeCategory}
            onSelect={handleCategorySelect}
          />
        )}

        <div
          className={`transition-opacity duration-200 ${transitioning ? "opacity-0" : "opacity-100"}`}
        >
          {/* Featured projects slider */}
          {featured.length > 0 && (
            <div className="mb-10 md:mb-16">
              <ProjectSlider label="Featured" gap={24} showControls={featured.length > 2}>
                {featured.map((project, i) => (
                  <div
                    key={project.slug}
                    className="w-[min(78vw,380px)] shrink-0 snap-start"
                  >
                    <FeaturedProject project={project} index={i} />
                  </div>
                ))}
              </ProjectSlider>
            </div>
          )}

          {/* Other projects slider */}
          {other.length > 0 && (
            <ProjectSlider label="Other Projects" gap={16} showControls={other.length > 3}>
              {other.map((project, i) => (
                <div
                  key={project.slug}
                  className="w-[min(85vw,320px)] shrink-0 snap-start"
                >
                  <SmallProject project={project} index={i} />
                </div>
              ))}
            </ProjectSlider>
          )}

          {filteredProjects.length === 0 && (
            <p className="text-center text-text-muted text-sm py-12">
              No projects in this category yet.
            </p>
          )}
        </div>

        {/* GitHub CTA */}
        {githubUrl && (
          <div className="text-center mt-10 md:mt-16">
            <a
              href={githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-mono border border-accent/30 text-accent rounded-lg hover:bg-accent/10 hover:border-accent/50 transition-all duration-300"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              View More on GitHub
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
