export default function Footer() {
  return (
    <footer className="relative border-t border-border/50 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-text-muted text-sm">
            <span className="font-mono font-bold text-accent">AM</span>
            <span>Alberto Moreno</span>
          </div>

          <div className="flex items-center gap-2 text-text-muted text-xs">
            <span>Crafted with</span>
            <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 font-mono text-accent">Remix</span>
            <span>&</span>
            <span className="px-2 py-0.5 rounded bg-accent/10 border border-accent/20 font-mono text-accent">Tailwind CSS</span>
          </div>

          <div className="text-text-muted text-xs font-mono">
            &copy; {new Date().getFullYear()} Alberto Moreno
          </div>
        </div>
      </div>
    </footer>
  );
}
