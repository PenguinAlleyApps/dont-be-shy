/**
 * Don't Be Shy brand marks.
 *
 * - <BlinkMark /> — face glyph (two dots + cocked eyebrow)
 * - <Wordmark /> — "Don't Be Shy" with tilted apostrophe + oversized period
 * - <Lockup /> — mark + wordmark side by side
 *
 * EO-016 compliant. No indigo. No stock icons. Pure SVG, both light & dark.
 */

interface SharedProps {
  className?: string;
  /** Force ink color. Default: currentColor (inherits from parent). */
  ink?: string;
  /** Spark accent (period + apostrophe in wordmark). Default: --color-coral. */
  spark?: string;
}

export function BlinkMark({ className, ink = "currentColor" }: SharedProps) {
  return (
    <svg
      viewBox="0 0 100 100"
      role="img"
      aria-label="Don&apos;t Be Shy"
      className={className}
    >
      <path
        d="M30 40 Q50 32 70 34"
        fill="none"
        stroke={ink}
        strokeWidth="7"
        strokeLinecap="round"
        transform="rotate(-6 50 37)"
      />
      <circle cx="38" cy="62" r="7" fill={ink} />
      <circle cx="62" cy="66" r="7" fill={ink} />
    </svg>
  );
}

export function Wordmark({
  className,
  ink = "currentColor",
  spark = "var(--color-coral)",
}: SharedProps) {
  return (
    <svg
      viewBox="0 0 240 60"
      role="img"
      aria-label="Don&apos;t Be Shy"
      className={className}
    >
      <g
        fontFamily="var(--font-inter-tight), Inter Tight, system-ui, sans-serif"
        fontWeight={650}
        fontSize="26"
        letterSpacing="-0.6"
      >
        <text x="6" y="38" fill={ink}>
          Don
        </text>
        <text x="58" y="38" fill={ink}>
          t Be Shy
        </text>
      </g>
      <rect
        x="52.5"
        y="14"
        width="3.4"
        height="10"
        rx="1.7"
        fill={spark}
        transform="rotate(18 54.2 19)"
      />
      <circle cx="176" cy="35.5" r="3.1" fill={spark} />
    </svg>
  );
}

interface LockupProps extends SharedProps {
  /** Height of the lockup in px. Mark is square at this size; wordmark scales. */
  size?: number;
}

export function Lockup({
  className = "",
  size = 28,
  ink = "currentColor",
  spark = "var(--color-coral)",
}: LockupProps) {
  return (
    <span
      className={`inline-flex items-center gap-2.5 ${className}`}
      style={{ height: size }}
    >
      <BlinkMark ink={ink} />
      <Wordmark ink={ink} spark={spark} />
      <style>{`
        span.inline-flex > svg:first-child { height: ${size}px; width: ${size}px; }
        span.inline-flex > svg:last-of-type { height: ${size}px; width: auto; }
      `}</style>
    </span>
  );
}
