import Link from "next/link";
import { BreathingWaveform } from "@/components/brand/breathing-waveform";
import { Lockup } from "@/components/brand/logo";
import { AttributionFooter } from "@/components/layout/attribution-footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bone text-charcoal paper-grain">
      {/* Top chrome — minimal nav, lockup left, github + try links right */}
      <header className="px-6 pt-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            aria-label="Don&apos;t Be Shy home"
            className="text-charcoal transition-opacity hover:opacity-70"
          >
            <Lockup size={26} ink="var(--color-charcoal)" spark="var(--color-coral)" />
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest text-deep-green">
            <Link href="/pricing" className="transition-opacity hover:opacity-70">
              Pricing
            </Link>
            <a
              href="https://github.com/PenguinAlleyApps/dont-be-shy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              Source ↗
            </a>
            <Link
              href="/setup"
              className="transition-opacity hover:opacity-70"
            >
              Begin
            </Link>
          </nav>
        </div>
      </header>

      {/* The breathing waveform — visual signature, full-width banner */}
      <div className="mx-auto mt-16 max-w-6xl px-6 sm:px-10">
        <BreathingWaveform color="var(--color-oxblood)" />
      </div>

      {/* Hero — asymmetric, left-aligned, NOT centered */}
      <main className="mx-auto max-w-6xl px-6 pb-24 sm:px-10">
        <section className="pt-12 sm:pt-20">
          <div className="grid gap-16 md:grid-cols-12">
            <div className="md:col-span-9 lg:col-span-8">
              <p
                className="font-mono text-xs uppercase tracking-[0.22em] text-deep-green"
                style={{ color: "var(--color-deep-green)" }}
              >
                A product by Penguin Alley · Free · Open source
              </p>
              <h1
                className="mt-6 font-display text-[12vw] leading-[0.95] tracking-tight text-oxblood sm:text-[8vw] md:text-[6.4vw] lg:text-[88px]"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  color: "var(--color-oxblood)",
                  fontVariationSettings: '"opsz" 144',
                  fontWeight: 500,
                }}
              >
                Practice the interview you&rsquo;re afraid of.
              </h1>
              <p
                className="mt-8 max-w-xl font-mono text-sm uppercase tracking-[0.18em]"
                style={{ color: "var(--color-deep-green)" }}
              >
                Free · Open source · Your keys, your data.
              </p>

              <div className="mt-12 flex flex-wrap items-baseline gap-x-8 gap-y-4">
                <Link
                  href="/setup"
                  className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3"
                  style={{
                    background: "var(--color-coral)",
                    color: "var(--color-bone)",
                  }}
                >
                  I&rsquo;m ready.
                  <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
                </Link>
                <a
                  href="https://github.com/PenguinAlleyApps/dont-be-shy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-sm uppercase tracking-widest underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
                  style={{ color: "var(--color-deep-green)" }}
                >
                  Source on GitHub →
                </a>
              </div>
            </div>

            {/* Side rail — handwritten overheard quote */}
            <aside className="md:col-span-3 md:col-start-10 lg:col-span-4">
              <figure
                className="border-l-2 pl-6"
                style={{ borderColor: "var(--color-oxblood)" }}
              >
                <blockquote
                  className="text-2xl leading-snug"
                  style={{
                    fontFamily: "var(--font-caveat)",
                    color: "var(--color-charcoal)",
                  }}
                >
                  &ldquo;I passed. Thank you.&rdquo;
                </blockquote>
                <figcaption
                  className="mt-3 font-mono text-[11px] uppercase tracking-widest"
                  style={{ color: "var(--color-deep-green)" }}
                >
                  — Overheard, last Tuesday
                </figcaption>
              </figure>
            </aside>
          </div>
        </section>

        {/* Three editorial blocks (NOT a 3-column features-with-icons grid) */}
        <section className="mt-32 sm:mt-40">
          <h2
            className="font-display text-3xl tracking-tight sm:text-4xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--color-charcoal)",
              fontWeight: 500,
            }}
          >
            What it does, plainly.
          </h2>
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-10">
            <article>
              <p
                className="font-mono text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--color-oxblood)" }}
              >
                01 · Before
              </p>
              <h3
                className="mt-3 text-xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                }}
              >
                Pick the role you&rsquo;re actually applying for.
              </h3>
              <p
                className="mt-3 leading-relaxed"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                Engineer, PM, designer, leadership — or paste the
                full job description. The interviewer adapts to it,
                not the other way around.
              </p>
            </article>
            <article>
              <p
                className="font-mono text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--color-oxblood)" }}
              >
                02 · During
              </p>
              <h3
                className="mt-3 text-xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                }}
              >
                Speak. Or type. Whichever is less scary today.
              </h3>
              <p
                className="mt-3 leading-relaxed"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                Browser-native voice — no signup, no upload, no
                third-party transcription service. The conversation
                stays between you and your machine.
              </p>
            </article>
            <article>
              <p
                className="font-mono text-xs uppercase tracking-[0.22em]"
                style={{ color: "var(--color-oxblood)" }}
              >
                03 · After
              </p>
              <h3
                className="mt-3 text-xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                }}
              >
                See exactly what to fix.
              </h3>
              <p
                className="mt-3 leading-relaxed"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                Domain expertise, English fluency with CEFR level,
                structure, confidence. Filler-word count. One
                actionable next step per question. No fluff.
              </p>
            </article>
          </div>
        </section>

        {/* Quiet honesty section — the BYOK + open source thesis */}
        <section className="mt-32 grid gap-12 sm:mt-40 md:grid-cols-12">
          <div className="md:col-span-4">
            <p
              className="font-mono text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--color-oxblood)" }}
            >
              The honest part
            </p>
          </div>
          <div className="md:col-span-8">
            <p
              className="text-2xl leading-snug"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontWeight: 400,
                color: "var(--color-charcoal)",
              }}
            >
              Don&rsquo;t Be Shy is free. The source is on GitHub. You bring
              your own Anthropic key, or use the demo (3 questions, no
              signup). Your interviews stay in your browser.
            </p>
            <p
              className="mt-6 max-w-2xl leading-relaxed"
              style={{ color: "var(--color-charcoal-soft)" }}
            >
              We don&rsquo;t store your transcripts. We don&rsquo;t sell to recruiters.
              We don&rsquo;t add &ldquo;intelligent rewrites of your answers&rdquo;
              behind your back. The product is small and quiet on purpose,
              because that&rsquo;s what helps when you&rsquo;re nervous. AGPL-3.0.
              Self-host if you want to.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 font-mono text-xs uppercase tracking-widest" style={{ color: "var(--color-deep-green)" }}>
              <a
                href="https://github.com/PenguinAlleyApps/dont-be-shy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-4 hover:opacity-70"
              >
                Read the code →
              </a>
              <a
                href="https://github.com/PenguinAlleyApps/dont-be-shy/blob/main/LICENSE"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-4 hover:opacity-70"
              >
                AGPL-3.0
              </a>
              <a
                href="https://penguinalley.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline decoration-1 underline-offset-4 hover:opacity-70"
              >
                Penguin Alley
              </a>
            </div>
          </div>
        </section>

        {/* Final CTA — the dare, restated, smaller */}
        <section className="mt-32 flex flex-col items-start gap-8 border-t pt-16 sm:mt-40" style={{ borderColor: "var(--color-charcoal-soft)" }}>
          <h2
            className="text-4xl tracking-tight sm:text-5xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 500,
              color: "var(--color-oxblood)",
            }}
          >
            Still here?
          </h2>
          <Link
            href="/setup"
            className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3"
            style={{
              background: "var(--color-coral)",
              color: "var(--color-bone)",
            }}
          >
            Take the seat.
            <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
          </Link>
        </section>
      </main>

      <AttributionFooter />
    </div>
  );
}
