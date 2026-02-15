const FeaturedCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/50 overflow-hidden">
    <div className="aspect-video bg-surface animate-pulse" />
    <div className="p-6 md:p-8">
      <div className="flex items-start justify-between mb-4">
        <div className="h-5 w-16 rounded bg-surface animate-pulse" />
        <div className="flex gap-3">
          <div className="w-5 h-5 rounded bg-surface animate-pulse" />
          <div className="w-5 h-5 rounded bg-surface animate-pulse" />
        </div>
      </div>
      <div className="h-5 w-36 rounded bg-surface animate-pulse mb-3" />
      <div className="space-y-2">
        <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
        <div className="h-3.5 w-full rounded bg-surface animate-pulse" />
        <div className="h-3.5 w-2/3 rounded bg-surface animate-pulse" />
      </div>
    </div>
  </div>
);

const SmallCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/30 p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="h-1 w-8 rounded-full bg-surface animate-pulse" />
      <div className="w-4 h-4 rounded bg-surface animate-pulse" />
    </div>
    <div className="h-4 w-28 rounded bg-surface animate-pulse mb-2" />
    <div className="space-y-1.5">
      <div className="h-3 w-full rounded bg-surface animate-pulse" />
      <div className="h-3 w-3/4 rounded bg-surface animate-pulse" />
    </div>
  </div>
);

const ProjectsSkeleton = () => (
  <section className="relative py-24">
    <div className="relative mx-auto max-w-6xl px-6">
      <div className="mb-12">
        <div className="h-3.5 w-20 rounded bg-surface animate-pulse" />
        <div className="h-9 w-40 rounded bg-surface animate-pulse mt-2" />
      </div>

      <div className="flex flex-wrap gap-2 mb-12">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-9 w-20 rounded-lg bg-surface animate-pulse"
          />
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
        {[0, 1, 2].map((i) => (
          <FeaturedCardSkeleton key={i} />
        ))}
      </div>

      <div className="h-5 w-36 rounded bg-surface animate-pulse mb-8" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <SmallCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

export default ProjectsSkeleton;
