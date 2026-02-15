const SkillCardSkeleton = () => (
  <div className="rounded-xl border border-border bg-card/30 p-6">
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 rounded bg-surface animate-pulse" />
        <div className="h-4 w-28 rounded bg-surface animate-pulse" />
      </div>
      <div className="h-3 w-4 rounded bg-surface animate-pulse" />
    </div>
    <div className="flex flex-wrap gap-2">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="h-8 w-20 rounded-lg bg-surface animate-pulse"
        />
      ))}
    </div>
  </div>
);

const SkillsSkeleton = () => (
  <section className="relative py-24">
    <div className="relative mx-auto max-w-6xl px-6">
      <div className="mb-12">
        <div className="h-3.5 w-16 rounded bg-surface animate-pulse" />
        <div className="h-9 w-32 rounded bg-surface animate-pulse mt-2" />
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <SkillCardSkeleton key={i} />
        ))}
      </div>
    </div>
  </section>
);

export default SkillsSkeleton;
