import { useScrollProgress } from "~/hooks/useScrollProgress";

interface TacoLayer {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  threshold: number;
}

const TACO_LAYERS: TacoLayer[] = [
  {
    id: "tortilla",
    name: "Tortilla",
    subtitle: "La Base",
    description:
      "Every great taco starts with a solid foundation — just like every great product starts with clean architecture and reliable fundamentals.",
    threshold: 0.0,
  },
  {
    id: "carne",
    name: "Carne Asada",
    subtitle: "La Sustancia",
    description:
      "The core that brings everything together. Years of frontend engineering, building real products that serve millions of users.",
    threshold: 0.2,
  },
  {
    id: "cilantro",
    name: "Cilantro y Cebolla",
    subtitle: "El Frescor",
    description:
      "Fresh perspectives and attention to detail. Design systems, component libraries, and the small touches that elevate the experience.",
    threshold: 0.4,
  },
  {
    id: "salsa",
    name: "Salsa Roja",
    subtitle: "El Sabor",
    description:
      "The bold flavor — passion for performance, accessibility, and pushing the boundaries of what's possible on the web.",
    threshold: 0.6,
  },
  {
    id: "limon",
    name: "Limón",
    subtitle: "El Toque Final",
    description:
      "The finishing squeeze that ties it all together. Continuous improvement, mentoring, and the drive to make every release better than the last.",
    threshold: 0.8,
  },
];

const getLayerOpacity = (progress: number, threshold: number): number =>
  progress < threshold ? 0 : Math.min(1, (progress - threshold) / 0.15);

const getLayerTranslateY = (progress: number, threshold: number): number =>
  progress < threshold ? 20 : Math.max(0, 20 * (1 - (progress - threshold) / 0.15));

const TacoVisual = ({ progress }: { progress: number }) => {
  const isComplete = progress >= 0.95;

  return (
    <svg
      viewBox="0 0 300 360"
      className={`w-full max-w-[280px] md:max-w-[320px] ${isComplete ? "taco-complete" : ""}`}
      aria-hidden="true"
    >
      {/* Tortilla — curved shell */}
      <g
        style={{
          opacity: getLayerOpacity(progress, 0.0),
          transform: `translateY(${getLayerTranslateY(progress, 0.0)}px)`,
        }}
      >
        <path
          d="M40 200 Q40 310 150 320 Q260 310 260 200"
          fill="none"
          stroke="#d4a574"
          strokeWidth="28"
          strokeLinecap="round"
        />
        {/* Inner tortilla texture lines */}
        <path
          d="M65 220 Q65 290 150 298 Q235 290 235 220"
          fill="none"
          stroke="#c4956a"
          strokeWidth="2"
          strokeDasharray="4 8"
          opacity="0.4"
        />
      </g>

      {/* Carne Asada — meat chunks */}
      <g
        style={{
          opacity: getLayerOpacity(progress, 0.2),
          transform: `translateY(${getLayerTranslateY(progress, 0.2)}px)`,
        }}
      >
        <rect x="80" y="230" width="30" height="18" rx="5" fill="#8B4513" />
        <rect x="118" y="240" width="25" height="15" rx="4" fill="#7a3b10" />
        <rect x="150" y="228" width="35" height="20" rx="6" fill="#8B4513" />
        <rect x="192" y="238" width="28" height="16" rx="5" fill="#7a3b10" />
        <rect x="100" y="252" width="22" height="14" rx="4" fill="#6d3310" />
        <rect x="160" y="255" width="26" height="13" rx="4" fill="#8B4513" />
      </g>

      {/* Cilantro y Cebolla — herbs and onion */}
      <g
        style={{
          opacity: getLayerOpacity(progress, 0.4),
          transform: `translateY(${getLayerTranslateY(progress, 0.4)}px)`,
        }}
      >
        {/* Cilantro leaves */}
        <circle cx="95" cy="218" r="5" fill="#4aba6a" opacity="0.9" />
        <circle cx="130" cy="212" r="4" fill="#3da85e" opacity="0.8" />
        <circle cx="165" cy="216" r="5.5" fill="#4aba6a" opacity="0.9" />
        <circle cx="200" cy="220" r="4" fill="#3da85e" opacity="0.8" />
        <circle cx="148" cy="222" r="3.5" fill="#4aba6a" opacity="0.7" />
        {/* Onion pieces */}
        <ellipse cx="110" cy="225" rx="8" ry="3" fill="#e8e0d0" opacity="0.7" />
        <ellipse cx="175" cy="222" rx="7" ry="3" fill="#e8e0d0" opacity="0.6" />
        <ellipse
          cx="140"
          cy="230"
          rx="6"
          ry="2.5"
          fill="#e8e0d0"
          opacity="0.5"
        />
      </g>

      {/* Salsa Roja — red drizzle */}
      <g
        style={{
          opacity: getLayerOpacity(progress, 0.6),
          transform: `translateY(${getLayerTranslateY(progress, 0.6)}px)`,
        }}
      >
        <path
          d="M85 208 Q105 200 125 210 Q145 218 165 207 Q185 196 205 208"
          fill="none"
          stroke="#cc3333"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.85"
        />
        <path
          d="M95 215 Q120 208 140 216 Q160 224 185 213"
          fill="none"
          stroke="#b82828"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.6"
        />
        {/* Salsa drops */}
        <circle cx="100" cy="213" r="2.5" fill="#cc3333" opacity="0.7" />
        <circle cx="170" cy="210" r="2" fill="#cc3333" opacity="0.6" />
      </g>

      {/* Limón — lime wedge + juice */}
      <g
        style={{
          opacity: getLayerOpacity(progress, 0.8),
          transform: `translateY(${getLayerTranslateY(progress, 0.8)}px)`,
        }}
      >
        {/* Lime wedge */}
        <path
          d="M210 160 Q230 150 240 165 Q235 180 215 175 Z"
          fill="#bef264"
          opacity="0.9"
        />
        <path
          d="M218 162 L228 168"
          stroke="#a3d94e"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <path
          d="M220 167 L230 160"
          stroke="#a3d94e"
          strokeWidth="1.5"
          opacity="0.6"
        />
        {/* Juice drops */}
        <circle cx="190" cy="185" r="2" fill="#bef264" opacity="0.5" />
        <circle cx="175" cy="178" r="1.5" fill="#bef264" opacity="0.4" />
        <circle cx="200" cy="192" r="1.5" fill="#bef264" opacity="0.3" />
      </g>
    </svg>
  );
};

const IngredientText = ({ progress }: { progress: number }) => {
  const activeIndex = TACO_LAYERS.reduce(
    (acc, layer, i) => (progress >= layer.threshold ? i : acc),
    0,
  );

  return (
    <div className="relative min-h-[200px]">
      {TACO_LAYERS.map((layer, i) => (
        <div
          key={layer.id}
          className={`transition-opacity duration-500 ${
            i === activeIndex
              ? "opacity-100"
              : "opacity-0 pointer-events-none absolute inset-0"
          }`}
        >
          <span className="font-mono text-xs text-accent/70 tracking-wider uppercase">
            {String(i + 1).padStart(2, "0")}. {layer.subtitle}
          </span>
          <h3 className="text-2xl md:text-3xl font-bold font-mono mt-2 text-text-primary">
            {layer.name}
          </h3>
          <p className="mt-4 text-text-secondary text-base leading-relaxed">
            {layer.description}
          </p>
        </div>
      ))}
    </div>
  );
};

const ProgressDots = ({ progress }: { progress: number }) => (
  <div className="flex items-center gap-3">
    {TACO_LAYERS.map((layer) => (
      <div
        key={layer.id}
        className={`w-2 h-2 rounded-full transition-all duration-300 ${
          progress >= layer.threshold ? "bg-accent scale-125" : "bg-border"
        }`}
      />
    ))}
  </div>
);

const TacoBuilder = () => {
  const { ref, progress } = useScrollProgress();

  return (
    <section id="taco">
      <div ref={ref} className="relative h-[400vh]">
        <div className="sticky top-0 h-screen flex items-center overflow-hidden">
          <div className="mx-auto max-w-5xl px-6 w-full">
            {/* Section header */}
            <div className="absolute top-24 left-6 md:left-1/2 md:-translate-x-1/2 md:left-auto md:text-center">
              <span className="section-label">// funFact</span>
              <h2 className="text-3xl sm:text-4xl font-bold font-mono mt-2">
                Build Your Taco
              </h2>
            </div>

            {/* Content: taco + text */}
            <div className="flex flex-col md:flex-row items-center gap-10 md:gap-16">
              {/* Taco SVG */}
              <div className="flex-1 flex justify-center">
                <TacoVisual progress={progress} />
              </div>

              {/* Ingredient text */}
              <div className="flex-1">
                <IngredientText progress={progress} />
              </div>
            </div>

            {/* Progress dots */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
              <ProgressDots progress={progress} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TacoBuilder;
