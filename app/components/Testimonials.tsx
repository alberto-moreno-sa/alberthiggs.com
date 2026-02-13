import { useScrollAnimation } from "~/hooks/useScrollAnimation";
import type { Testimonial } from "~/lib/contentful";

function TestimonialCard({
  testimonial,
  index,
}: {
  testimonial: Testimonial;
  index: number;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div
      ref={ref}
      className={`group rounded-2xl border border-border bg-card/50 p-6 md:p-8 hover:border-border-light transition-all duration-500 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: `${index * 120}ms` }}
    >
      {/* Quote icon */}
      <div className="text-accent/30 mb-4">
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
        </svg>
      </div>

      {/* Quote text */}
      <blockquote className="text-text-secondary text-sm leading-relaxed mb-6 italic">
        &ldquo;{testimonial.quote}&rdquo;
      </blockquote>

      {/* Reviewer info */}
      <div className="flex items-center gap-3 pt-4 border-t border-border/30">
        {testimonial.avatarUrl ? (
          <img
            src={testimonial.avatarUrl}
            alt={testimonial.name}
            className="w-10 h-10 rounded-full border border-accent/20 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center">
            <span className="text-xs font-bold text-accent font-mono">
              {initials}
            </span>
          </div>
        )}
        <div>
          <div className="text-sm font-semibold text-text-primary">
            {testimonial.name}
          </div>
          <div className="text-xs text-text-muted">
            {testimonial.role} @ {testimonial.company}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Testimonials({
  testimonials,
}: {
  testimonials: Testimonial[];
}) {
  const { ref, isVisible } = useScrollAnimation();

  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="relative py-24">
      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section header */}
        <div
          ref={ref}
          className={`mb-12 ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
        >
          <span className="section-label">// testimonials</span>
          <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">
            Testimonials
          </h2>
        </div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <TestimonialCard
              key={testimonial.name}
              testimonial={testimonial}
              index={i}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
