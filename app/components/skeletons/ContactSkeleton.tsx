const ContactSkeleton = () => (
  <section className="relative py-24">
    <div className="relative mx-auto max-w-2xl px-6 text-center">
      <div className="h-3.5 w-20 rounded bg-surface animate-pulse mx-auto" />
      <div className="h-9 w-48 rounded bg-surface animate-pulse mt-2 mx-auto mb-6" />

      <div className="space-y-2 mb-12 flex flex-col items-center">
        <div className="h-5 w-full rounded bg-surface animate-pulse" />
        <div className="h-5 w-full rounded bg-surface animate-pulse" />
        <div className="h-5 w-3/4 rounded bg-surface animate-pulse" />
      </div>

      <div className="flex justify-center mb-12">
        <div className="h-14 w-48 rounded-xl bg-surface animate-pulse" />
      </div>

      <div className="flex items-center justify-center gap-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-surface animate-pulse" />
            <div className="h-3 w-10 rounded bg-surface animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default ContactSkeleton;
