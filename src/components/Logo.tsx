import { Link } from "react-router-dom";

/**
 * Logo creativo "Academia Creativa"
 * Marca: monograma A+C formado por un trazo de pincel circular (creatividad)
 * que envuelve a un punto-pixel (precisión) y deja una pincelada como subrayado.
 * Variantes via prop `variant`:
 *  - "default": para fondos claros
 *  - "ink": para fondos oscuros (admin sidebar)
 *  - "warm": acentos mostaza (panel admin)
 */
type Props = {
  variant?: "default" | "ink" | "warm";
  to?: string;
  size?: "sm" | "md" | "lg";
  showWord?: boolean;
};

const Logo = ({ variant = "default", to = "/", size = "md", showWord = true }: Props) => {
  const sizes = {
    sm: { mark: 32, text: "text-base" },
    md: { mark: 40, text: "text-xl" },
    lg: { mark: 56, text: "text-2xl" },
  };
  const s = sizes[size];

  // Color tokens per variant
  const palette = {
    default: { ring: "hsl(var(--ink))", fill: "hsl(var(--primary))", dot: "hsl(var(--secondary))", brush: "hsl(var(--primary))", word: "text-foreground", accent: "text-primary" },
    ink: { ring: "hsl(var(--ink-foreground))", fill: "hsl(var(--primary))", dot: "hsl(var(--secondary))", brush: "hsl(var(--secondary))", word: "text-ink-foreground", accent: "text-primary" },
    warm: { ring: "hsl(var(--ink))", fill: "hsl(var(--secondary))", dot: "hsl(var(--primary))", brush: "hsl(var(--primary))", word: "text-foreground", accent: "text-primary" },
  }[variant];

  return (
    <Link to={to} className="flex items-center gap-2.5 group" aria-label="Academia Creativa">
      <span
        className="relative inline-block transition-transform duration-300 group-hover:rotate-[-8deg]"
        style={{ width: s.mark, height: s.mark }}
      >
        <svg viewBox="0 0 64 64" width={s.mark} height={s.mark} fill="none" aria-hidden="true">
          {/* Outer brushstroke ring (open) — represents creativity */}
          <path
            d="M52 18 C58 28, 56 46, 42 54 C28 62, 12 56, 8 42 C4 28, 14 12, 30 10 C40 8.8, 48 12, 52 18 Z"
            stroke={palette.ring}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Inner filled blob — the creative spark */}
          <path
            d="M32 20 C42 20, 48 28, 46 38 C44 47, 34 50, 26 46 C18 42, 16 32, 22 25 C25 21, 28 20, 32 20 Z"
            fill={palette.fill}
          />
          {/* Negative-space "A" stroke crossing the blob */}
          <path
            d="M22 44 L32 24 L42 44 M26 38 L38 38"
            stroke="hsl(var(--card))"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Pixel dot — precision */}
          <rect x="48" y="46" width="8" height="8" rx="1.5" fill={palette.dot} />
          {/* Brush underline tail */}
          <path
            d="M10 58 Q24 54, 40 58"
            stroke={palette.brush}
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
            opacity="0.9"
          />
        </svg>
      </span>

      {showWord && (
        <span className={`font-display ${s.text} font-black tracking-tight leading-none ${palette.word}`}>
          academia<span className={palette.accent}>·</span>creativa
        </span>
      )}
    </Link>
  );
};

export default Logo;
