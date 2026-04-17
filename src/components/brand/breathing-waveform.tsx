"use client";

/**
 * Breathing waveform — Don't Be Shy's visual signature.
 *
 * A horizontal series of vertical bars whose heights mimic a calm waveform.
 * The whole group breathes (scaleY) at box-breathing cadence: 4s expand, 6s contract.
 * Pure CSS animation, GPU-composited. Respects prefers-reduced-motion.
 *
 * EO-016 compliant. No CSS linear-gradient.
 */

interface Props {
  className?: string;
  /** Bar fill color. Default: oxblood. */
  color?: string;
  /** Number of bars. More = smoother, slightly heavier. Default 80. */
  bars?: number;
}

export function BreathingWaveform({
  className = "",
  color = "var(--color-oxblood)",
  bars = 80,
}: Props) {
  // Heights pre-computed once — calm sinusoid with two soft asymmetric peaks
  // so it reads as a real voiceprint, not a perfect sine wave.
  const heights = Array.from({ length: bars }, (_, i) => {
    const t = i / (bars - 1);
    const wave = Math.sin(t * Math.PI * 2.4 + 0.3) * 0.45;
    const envelope = Math.sin(t * Math.PI) * 0.7 + 0.3;
    const noise = (Math.sin(i * 12.9898) * 43758.5453) % 1;
    return Math.max(0.18, Math.abs(wave) * envelope + Math.abs(noise) * 0.08);
  });

  const barWidth = 100 / bars;
  const gap = barWidth * 0.4;

  return (
    <svg
      viewBox="0 0 100 24"
      preserveAspectRatio="none"
      role="img"
      aria-label="Calm voice waveform"
      className={`breathe ${className}`}
      style={{ width: "100%", height: "auto", display: "block" }}
    >
      <g fill={color}>
        {heights.map((h, i) => {
          const x = i * barWidth + gap / 2;
          const w = barWidth - gap;
          const y = (24 - h * 24) / 2;
          const height = h * 24;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={w}
              height={height}
              rx={Math.min(w / 2, 0.4)}
            />
          );
        })}
      </g>
    </svg>
  );
}
