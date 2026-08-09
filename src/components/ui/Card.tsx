import { cardClass, type CardTone } from "./cardClass";

/** Card shell as an element. For <a> cards, use `cardClass` directly. */
export const Card = ({
  tone,
  interactive,
  className,
  children,
  ...rest
}: {
  tone?: CardTone;
  interactive?: boolean;
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cardClass({ tone, interactive, className })} {...rest}>
    {children}
  </div>
);
