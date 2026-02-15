const ExperienceCardSkeleton = () => (
  <div className="relative pl-8 md:pl-12 pb-16 last:pb-0">
    <div className="absolute left-0 top-0 bottom-0 w-px bg-border" />
    <div className="absolute left-0 top-1 w-3 h-3 rounded-full -translate-x-1/2 ring-4 ring-bg bg-surface animate-pulse" />

    <div className="rounded-xl border border-border bg-card/50 p-5 md:p-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-4">
        <div>
          <div className="h-5 w-40 rounded bg-surface animate-pulse" />
          <div className="h-3.5 w-28 rounded bg-surface animate-pulse mt-1.5" />
        </div>
        <div className="h-3.5 w-32 rounded bg-surface animate-pulse shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
        <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-surface animate-pulse" />
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-6 w-16 rounded bg-surface animate-pulse"
          />
        ))}
      </div>
    </div>
  </div>
);

const ExperienceSkeleton = () => (
  <section className="relative py-24">
    <div className="relative mx-auto max-w-5xl px-6">
      <div className="mb-12">
        <div className="h-3.5 w-24 rounded bg-surface animate-pulse" />
        <div className="h-9 w-48 rounded bg-surface animate-pulse mt-2" />
      </div>

      <div>
        {[0, 1, 2].map((i) => (
          <ExperienceCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

export default ExperienceSkeleton;
