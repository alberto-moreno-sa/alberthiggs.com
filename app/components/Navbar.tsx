import { useEffect, useRef, useState } from "react";
import { trackNavClick, trackResumeDownload } from "~/lib/analytics";
import { cn } from "~/lib/cn";

const navLinks = [
  { label: "About", href: "#about", num: "01" },
  { label: "Experience", href: "#experience", num: "02" },
  { label: "Projects", href: "#projects", num: "03" },
  { label: "Skills", href: "#skills", num: "04" },
  { label: "Reforma", href: "#reforma", num: "05" },
  { label: "Taco", href: "#taco", num: "06" },
  { label: "Testimonials", href: "#testimonials", num: "07" },
  { label: "Contact", href: "#contact", num: "08" },
];

/** Static — derived once at module load, not on every scroll event. */
const sectionIds = navLinks.map((l) => l.href.replace("#", ""));

const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
};

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("");
  const rafRef = useRef<number>(0);

  useEffect(() => {
    // Batch the layout reads into one rAF per frame — the raw scroll event can
    // fire far more often than that, and each pass calls getBoundingClientRect
    // on up to 8 sections. Same pattern as useScrollProgress.
    const update = () => {
      setScrolled(window.scrollY > 50);

      for (let i = sectionIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(sectionIds[i]);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(sectionIds[i]);
          break;
        }
      }
    };

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    update(); // initial check

    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "glass border-b border-border/50 shadow-lg shadow-black/20"
          : "bg-transparent",
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <a
          href="#hero"
          onClick={(e) => scrollTo(e, "hero")}
          className="flex items-center gap-2 group"
        >
          <span className="font-mono text-lg font-bold text-accent group-hover:opacity-80 transition-opacity">
            AM
          </span>
          <span className="font-mono text-sm text-text-muted hidden sm:inline">
            .dev
          </span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => {
                  scrollTo(e, sectionId);
                  trackNavClick(link.label.toLowerCase());
                }}
                className={cn(
                  "nav-link relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200",
                  activeSection === sectionId
                    ? "text-accent nav-link-active"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span className="font-mono text-[10px] text-accent/60 mr-1">
                  {link.num}.
                </span>
                {link.label}
              </a>
            );
          })}
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackResumeDownload()}
            className="ml-3 border border-accent/30 text-accent text-sm font-mono rounded-lg px-4 py-1.5 hover:bg-accent/10 transition-all duration-200"
          >
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex flex-col gap-1.5 p-2"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
        >
          <span
            className={cn(
              "w-5 h-0.5 bg-text-primary transition-all duration-300 origin-center",
              mobileOpen ? "rotate-45 translate-y-[4px]" : "",
            )}
          />
          <span
            className={cn(
              "w-5 h-0.5 bg-text-primary transition-all duration-300",
              mobileOpen ? "opacity-0" : "",
            )}
          />
          <span
            className={cn(
              "w-5 h-0.5 bg-text-primary transition-all duration-300 origin-center",
              mobileOpen ? "-rotate-45 -translate-y-[4px]" : "",
            )}
          />
        </button>
      </div>

      {/* Mobile menu — collapsed with max-height rather than unmounted, so the
          links inside must be taken out of the tab order explicitly. */}
      <div
        id="mobile-menu"
        aria-hidden={!mobileOpen}
        className={cn(
          "md:hidden glass border-b border-border/50 overflow-hidden transition-all duration-300",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0",
        )}
      >
        <div className="px-6 py-4 flex flex-col gap-2">
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            return (
              <a
                key={link.href}
                href={link.href}
                tabIndex={mobileOpen ? 0 : -1}
                onClick={(e) => {
                  scrollTo(e, sectionId);
                  setMobileOpen(false);
                  trackNavClick(link.label.toLowerCase());
                }}
                className={cn(
                  "nav-link relative px-4 py-3 text-sm font-medium rounded-lg transition-all",
                  activeSection === sectionId
                    ? "text-accent nav-link-active"
                    : "text-text-secondary hover:text-text-primary",
                )}
              >
                <span className="font-mono text-[10px] text-accent/60 mr-2">
                  {link.num}.
                </span>
                {link.label}
              </a>
            );
          })}
          <a
            href="/resume"
            target="_blank"
            rel="noopener noreferrer"
            tabIndex={mobileOpen ? 0 : -1}
            onClick={() => {
              setMobileOpen(false);
              trackResumeDownload();
            }}
            className="px-4 py-3 text-sm font-mono text-accent border border-accent/30 rounded-lg text-center hover:bg-accent/10 transition-all"
          >
            Download Resume
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
