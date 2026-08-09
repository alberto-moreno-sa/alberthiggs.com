const Footer = () => (
  <footer className="relative border-t border-border/50 py-8">
    <div className="mx-auto max-w-6xl px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 text-text-muted text-sm">
          <span className="font-mono font-bold text-accent">AM</span>
          <span>Alberto Moreno</span>
        </div>

        <div className="text-text-muted text-xs font-mono">
          &copy; {new Date().getFullYear()} Alberto Moreno
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
