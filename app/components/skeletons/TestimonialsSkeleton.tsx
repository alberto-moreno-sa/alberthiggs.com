const TestimonialCardSkeleton = () => (
  <div className="rounded-2xl border border-border bg-card/50 p-6 md:p-8">
    <div className="w-8 h-8 rounded bg-surface animate-pulse mb-4" />

    <div className="space-y-2 mb-6">
      <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
      <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
      <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
      <div className="h-3.5 w-2/3 rounded bg-surface animate-pulse" />
    </div>

    <div className="flex items-center gap-3 pt-4 border-t border-border/30">
      <div className="w-10 h-10 rounded-full bg-surface animate-pulse shrink-0" />
      <div>
        <div className="h-3.5 w-28 rounded bg-surface animate-pulse" />
        <div className="h-3 w-36 rounded bg-surface animate-pulse mt-1" />
      </div>
    </div>
  </div>
);

const TestimonialsSkeleton = () => (
  <section className="relative py-24">
    <div className="relative mx-auto max-w-6xl px-6">
      <div className="mb-12">
        <div className="h-3.5 w-24 rounded bg-surface animate-pulse" />
        <div className="h-9 w-48 rounded bg-surface animate-pulse mt-2" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3].map((i) => (
          <TestimonialCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSkeleton;
