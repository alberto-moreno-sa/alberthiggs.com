import { useScrollAnimation } from "~/hooks/useScrollAnimation";

/**
 * The `// label` eyebrow plus section title, with its scroll-in wrapper.
 *
 * This exact block was copy-pasted across eight sections, so changing the
 * heading scale or the reveal meant editing eight files.
 */
export const SectionHeader = ({
  label,
  title,
  animate = true,
  className = "mb-12",
  children,
}: {
  /** Eyebrow text, without the leading `// ` */
  label: string;
  title: string;
  /** Sections that reveal their header some other way opt out. */
  animate?: boolean;
  className?: string;
  /** Supporting copy that reveals together with the heading. */
  children?: React.ReactNode;
}) => {
  const { ref, isVisible } = useScrollAnimation();

  const content = (
    <>
      <span className="section-label">{`// ${label}`}</span>
      <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">{title}</h2>
      {children}
    </>
  );

  if (!animate) return <div className={className}>{content}</div>;

  return (
    <div
      ref={ref}
      className={`${className} ${isVisible ? "scroll-visible" : "scroll-hidden"}`}
    >
      {content}
    </div>
  );
};
