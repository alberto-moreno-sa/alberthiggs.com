const HeroAboutSkeleton = () => (
  <>
    {/* Hero skeleton */}
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-bg dot-grid" />
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="h-3.5 w-16 rounded bg-surface animate-pulse mx-auto" />

        <div className="mt-4 space-y-3 flex flex-col items-center">
          <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-64 sm:w-80 md:w-96 rounded bg-surface animate-pulse" />
          <div className="h-12 sm:h-16 md:h-20 lg:h-24 w-48 sm:w-64 md:w-80 rounded bg-surface animate-pulse" />
        </div>

        <div className="mt-6 h-4 w-56 rounded bg-surface animate-pulse mx-auto" />

        <div className="mt-6 space-y-2 flex flex-col items-center">
          <div className="h-5 w-full max-w-2xl rounded bg-surface animate-pulse" />
          <div className="h-5 w-3/4 max-w-lg rounded bg-surface animate-pulse" />
        </div>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <div className="h-12 w-40 rounded-lg bg-surface animate-pulse" />
          <div className="h-12 w-36 rounded-lg bg-surface animate-pulse" />
          <div className="h-12 w-44 rounded-lg bg-surface animate-pulse" />
        </div>

        <div className="mt-20 flex items-center justify-center gap-8 sm:gap-16">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-8 sm:gap-16">
              {i > 0 && (
                <div className="w-px h-10 bg-border -ml-8 sm:-ml-16" />
              )}
              <div className="text-center">
                <div className="h-8 w-12 rounded bg-surface animate-pulse mx-auto mb-1" />
                <div className="h-2.5 w-16 rounded bg-surface animate-pulse mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="w-6 h-10 border border-border/30 rounded-full" />
      </div>
    </section>

    {/* About skeleton */}
    <section className="relative py-24 overflow-hidden">
      <div className="relative mx-auto max-w-4xl px-6">
        <div className="mb-12">
          <div className="h-3.5 w-16 rounded bg-surface animate-pulse" />
          <div className="h-9 w-40 rounded bg-surface animate-pulse mt-2" />
        </div>

        <div className="space-y-6">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 w-full rounded bg-surface animate-pulse" />
              <div className="h-4 w-full rounded bg-surface animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-surface animate-pulse" />
            </div>
          ))}

          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-surface animate-pulse shrink-0" />
                <div className="h-3.5 w-40 rounded bg-surface animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded bg-surface animate-pulse shrink-0" />
            <div className="h-3.5 w-64 rounded bg-surface animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  </>
);

export default HeroAboutSkeleton;
