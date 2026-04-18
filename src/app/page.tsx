"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BreathingWaveform } from "@/components/brand/breathing-waveform";
import { Lockup } from "@/components/brand/logo";
import { AttributionFooter } from "@/components/layout/attribution-footer";

/**
 * Don't Be Shy — Landing v0.7
 *
 * Editorial conceit: the page is a small magazine. Issue masthead, sectioned
 * contents, Roman-numeral marginalia, a pull-quote middle break, a price list
 * set like a letterpress menu, a typographic-punchline final. Two breathing
 * waveforms bookend the page — one loud at the top, one quiet at the bottom —
 * so the entire scroll reads as one inhale + one exhale.
 *
 * EO-016 compliant: always-light, no indigo/purple/violet, no CSS gradients,
 * no glassmorphism, asymmetric hero, single primary CTA. Coral appears only
 * on the two CTAs. Caveat (handwritten) appears once. Mono is reserved for
 * eyebrows, links, and chrome.
 */
export default function LandingPage() {
  const reducedMotion = useReducedMotion();

  // Reusable scroll reveal — disabled when prefers-reduced-motion is set.
  const reveal = (delay = 0) =>
    reducedMotion
      ? {}
      : ({
          initial: { opacity: 0, y: 12 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay },
        } as const);

  return (
    <div
      className="paper-grain min-h-screen overflow-x-hidden"
      style={{ background: "var(--surface)", color: "var(--surface-ink)" }}
    >
      {/* Inline reduced-motion override for the CTA "exhale" hover */}
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          .exhale, .exhale * { transition: none !important; }
          .exhale:hover { transform: none !important; }
        }
        .exhale:hover { transform: translateY(-1px) scale(1.015); }
      `}</style>

      {/* MASTHEAD — minimal nav, lockup left, link trio right */}
      <header className="px-6 pt-8 sm:px-12 sm:pt-10">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between">
          <Link
            href="/"
            aria-label="Don't Be Shy home"
            className="transition-opacity hover:opacity-60"
            style={{ color: "var(--surface-ink)" }}
          >
            <Lockup size={26} ink="var(--color-charcoal)" spark="var(--color-coral)" />
          </Link>
          <nav
            aria-label="Primary"
            className="flex items-center gap-7 font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--color-deep-green)" }}
          >
            <Link href="/pricing" className="transition-opacity hover:opacity-60">
              Pricing
            </Link>
            <a
              href="https://github.com/PenguinAlleyApps/dont-be-shy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-60"
            >
              Source ↗
            </a>
            <Link href="/setup" className="transition-opacity hover:opacity-60">
              Begin
            </Link>
          </nav>
        </div>
      </header>

      {/* Issue line — magazine convention */}
      <div className="mt-10 px-6 sm:px-12">
        <div className="mx-auto flex max-w-[1280px] items-center gap-5">
          <div className="h-px flex-1" style={{ background: "var(--color-oxblood)", opacity: 0.28 }} />
          <p
            className="font-mono text-[10px] uppercase tracking-[0.34em] text-center"
            style={{ color: "var(--color-oxblood)" }}
          >
            From the desk of Penguin Alley · Spring 2026 · Free Edition
          </p>
          <div className="h-px flex-1" style={{ background: "var(--color-oxblood)", opacity: 0.28 }} />
        </div>
      </div>

      {/* THE SIGNATURE — top waveform, loud */}
      <div className="mx-auto mt-10 max-w-[1280px] px-6 sm:px-12">
        <BreathingWaveform color="var(--color-oxblood)" />
      </div>

      <main className="mx-auto max-w-[1280px] px-6 pb-24 sm:px-12">
        {/* HERO — asymmetric, broken-line italic editorial headline */}
        <section className="grid gap-x-12 gap-y-16 pt-20 sm:pt-28 md:grid-cols-12">
          <div className="md:col-span-9 lg:col-span-8">
            <motion.p
              {...reveal(0)}
              className="font-mono text-[11px] uppercase tracking-[0.28em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              A product by Penguin Alley
            </motion.p>

            <motion.h1
              {...reveal(0.05)}
              className="mt-9 font-display"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontVariationSettings: '"opsz" 144',
                fontWeight: 400,
                lineHeight: 0.92,
                letterSpacing: "-0.025em",
              }}
            >
              <span
                className="block text-[14vw] sm:text-[10vw] md:text-[7.6vw] lg:text-[112px]"
                style={{ color: "var(--color-oxblood)" }}
              >
                Practice the
              </span>
              <span
                className="block text-[14vw] italic sm:text-[10vw] md:text-[7.6vw] lg:text-[112px]"
                style={{ color: "var(--color-oxblood)" }}
              >
                interview
              </span>
              <span
                className="block text-[14vw] sm:text-[10vw] md:text-[7.6vw] lg:text-[112px]"
                style={{ color: "var(--color-charcoal)" }}
              >
                you&rsquo;re afraid of.
              </span>
            </motion.h1>

            <motion.p
              {...reveal(0.1)}
              className="mt-12 max-w-md font-mono text-[12px] uppercase tracking-[0.22em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              Free · Open source · Your keys, your data.
            </motion.p>

            <motion.div
              {...reveal(0.15)}
              className="mt-12 flex flex-wrap items-baseline gap-x-10 gap-y-5"
            >
              <Link
                href="/setup"
                className="exhale group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-medium transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3"
                style={{ background: "var(--color-coral)", color: "var(--color-bone)" }}
              >
                I&rsquo;m ready.
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <a
                href="https://github.com/PenguinAlleyApps/dont-be-shy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[12px] uppercase tracking-[0.22em] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60"
                style={{ color: "var(--color-deep-green)" }}
              >
                Source on GitHub →
              </a>
            </motion.div>
          </div>

          {/* Side rail — overheard quote, hung from a thin oxblood rule */}
          <motion.aside
            {...reveal(0.25)}
            className="md:col-span-3 md:col-start-10 lg:col-span-4 lg:col-start-9"
          >
            <figure
              className="border-l-2 pl-8 pt-8"
              style={{ borderColor: "var(--color-oxblood)" }}
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "var(--color-deep-green)" }}
              >
                Overheard
              </p>
              <blockquote
                className="mt-5 leading-[1.05]"
                style={{
                  fontFamily: "var(--font-caveat)",
                  fontSize: "clamp(40px, 5vw, 52px)",
                  color: "var(--color-charcoal)",
                }}
              >
                I passed.
                <br />
                Thank&nbsp;you.
              </blockquote>
              <figcaption
                className="mt-5 font-mono text-[10px] uppercase tracking-[0.24em]"
                style={{ color: "var(--color-deep-green)", opacity: 0.7 }}
              >
                — Last Tuesday
              </figcaption>
            </figure>
          </motion.aside>
        </section>

        {/* CONTENTS DIVIDER */}
        <div className="mt-36 flex items-center gap-6">
          <div
            className="h-px flex-1"
            style={{ background: "var(--color-oxblood)", opacity: 0.28 }}
          />
          <p
            className="font-mono text-[10px] uppercase tracking-[0.34em]"
            style={{ color: "var(--color-oxblood)" }}
          >
            Contents
          </p>
          <div
            className="h-px flex-1"
            style={{ background: "var(--color-oxblood)", opacity: 0.28 }}
          />
        </div>

        {/* THREE EDITORIAL BLOCKS — Roman numerals in margin, prose in body */}
        <section className="mt-24">
          <motion.h2
            {...reveal()}
            className="text-[40px] tracking-tight sm:text-[56px]"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--color-charcoal)",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
            }}
          >
            What it does, plainly.
          </motion.h2>

          <div className="mt-20 space-y-24">
            {[
              {
                roman: "I.",
                eyebrow: "Before",
                head: "Pick the role you're actually applying for.",
                body: "Software engineer, product manager, designer, sales, leadership — or paste the actual job description in. The interviewer adapts to the brief, not the other way around. No taxonomies to memorize. No persona to invent.",
              },
              {
                roman: "II.",
                eyebrow: "During",
                head: "Speak. Or type. Whichever is less scary today.",
                body: "Browser-native voice. No signup, no upload, no third-party transcription service in the loop. The conversation stays between you and your machine. If your mic is muted, the typing path is identical and just as scored.",
              },
              {
                roman: "III.",
                eyebrow: "After",
                head: "See exactly what to fix.",
                body: "Domain expertise, English fluency with a CEFR estimate, structure, and confidence — each scored out of five. Filler words counted per hundred. One actionable line per question. No fluff, no graphs that flatter you, no badges.",
              },
            ].map((b, i) => (
              <motion.article
                key={i}
                {...reveal(0.05)}
                className="grid gap-x-10 gap-y-6 md:grid-cols-12"
              >
                <div className="md:col-span-2">
                  <p
                    className="text-[68px] leading-none"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontStyle: "italic",
                      color: "var(--color-deep-green)",
                      opacity: 0.55,
                      fontWeight: 400,
                    }}
                  >
                    {b.roman}
                  </p>
                </div>
                <div className="md:col-span-9 lg:col-span-8">
                  <p
                    className="font-mono text-[10px] uppercase tracking-[0.34em]"
                    style={{ color: "var(--color-oxblood)" }}
                  >
                    {b.eyebrow}
                  </p>
                  <h3
                    className="mt-3 text-[26px] leading-[1.2] tracking-tight"
                    style={{
                      fontFamily: "var(--font-fraunces)",
                      fontWeight: 500,
                      color: "var(--color-charcoal)",
                    }}
                  >
                    {b.head}
                  </h3>
                  <p
                    className="mt-5 max-w-[58ch] text-[16px] leading-[1.7]"
                    style={{
                      color: "var(--color-charcoal)",
                      opacity: 0.85,
                      fontFamily: "var(--font-inter-tight)",
                    }}
                  >
                    {b.body}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* PULL QUOTE — middle break, magazine convention */}
        <motion.section
          {...reveal()}
          className="my-44 grid grid-cols-12 gap-x-10"
        >
          <div className="col-span-1 md:col-span-2">
            <div
              className="mt-5 h-px w-full"
              style={{ background: "var(--color-oxblood)" }}
            />
          </div>
          <blockquote className="col-span-11 md:col-span-9 lg:col-span-8">
            <p
              className="text-[34px] leading-[1.18] tracking-tight sm:text-[44px]"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                color: "var(--color-oxblood)",
                fontWeight: 400,
                letterSpacing: "-0.015em",
              }}
            >
              The opposite of bravery isn&rsquo;t cowardice. It&rsquo;s the absence
              of practice.
            </p>
            <footer
              className="mt-7 font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "var(--color-deep-green)" }}
            >
              — Working note, by way of explanation
            </footer>
          </blockquote>
        </motion.section>

        {/* HONEST SECTION — confessional, two-column */}
        <section className="mt-32">
          <div className="grid grid-cols-12 gap-x-10 gap-y-12">
            <div className="col-span-12 md:col-span-3">
              <motion.p
                {...reveal()}
                className="font-mono text-[10px] uppercase tracking-[0.34em]"
                style={{ color: "var(--color-oxblood)" }}
              >
                The honest part
              </motion.p>
              <motion.p
                {...reveal(0.05)}
                className="mt-3 max-w-[20ch] text-[15px] leading-[1.5]"
                style={{
                  color: "var(--color-deep-green)",
                  opacity: 0.7,
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                A footnote about money, code, and trust.
              </motion.p>
            </div>

            <div className="col-span-12 space-y-9 md:col-span-9 lg:col-span-8">
              <motion.p
                {...reveal()}
                className="text-[22px] leading-[1.45] tracking-tight"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  color: "var(--color-charcoal)",
                  fontWeight: 400,
                }}
              >
                The source is on GitHub under AGPL-3.0. The hosted version pays
                for the AI for you and lives at this URL. The self-hosted version
                runs on your own machine with your own Anthropic key — same code,
                same UX, $0 forever, no signup, no trust required.
              </motion.p>

              <motion.p
                {...reveal(0.05)}
                className="text-[18px] leading-[1.65]"
                style={{
                  color: "var(--color-charcoal)",
                  opacity: 0.85,
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                We deliberately don&rsquo;t accept your Anthropic key on this site.
                Pasting{" "}
                <code
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.86em",
                    padding: "2px 7px",
                    background: "var(--color-bone-200)",
                    borderRadius: "3px",
                  }}
                >
                  sk-ant-…
                </code>{" "}
                into a stranger&rsquo;s web app is a bad habit even when the site
                promises not to log it. If you want unlimited free, clone the repo
                and run it yourself — it&rsquo;s a five-line setup.
              </motion.p>

              <motion.p
                {...reveal(0.1)}
                className="text-[18px] leading-[1.65]"
                style={{
                  color: "var(--color-charcoal)",
                  opacity: 0.85,
                  fontFamily: "var(--font-inter-tight)",
                }}
              >
                No subscription. No auto-renew. We charge once, the access expires,
                you decide if you want to come back.
              </motion.p>

              <motion.div
                {...reveal(0.15)}
                className="flex flex-wrap items-center gap-x-10 gap-y-3 pt-4 font-mono text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--color-deep-green)" }}
              >
                <a
                  href="https://github.com/PenguinAlleyApps/dont-be-shy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-1 underline-offset-4 hover:opacity-60"
                >
                  Read the code →
                </a>
                <a
                  href="https://github.com/PenguinAlleyApps/dont-be-shy/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-1 underline-offset-4 hover:opacity-60"
                >
                  AGPL-3.0
                </a>
                <a
                  href="https://penguinalley.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline decoration-1 underline-offset-4 hover:opacity-60"
                >
                  Penguin Alley
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* PRICING — set as a price list, not cards */}
        <section className="mt-44">
          <motion.h2
            {...reveal()}
            className="text-[40px] tracking-tight sm:text-[56px]"
            style={{
              fontFamily: "var(--font-fraunces)",
              color: "var(--color-charcoal)",
              fontWeight: 500,
              fontStyle: "italic",
              letterSpacing: "-0.02em",
            }}
          >
            Three ways to use it.
          </motion.h2>

          <div
            className="mt-14 border-t"
            style={{ borderColor: "var(--color-charcoal)", borderTopWidth: "1px" }}
          >
            {[
              { label: "Free demo", desc: "3 questions · no signup · in your browser", price: "$0" },
              {
                label: "Hosted Pro",
                desc: "$19 / 7 days · $49 / 30 days · one-time, no auto-renew",
                price: "$19",
              },
              {
                label: "Self-host",
                desc: "Your machine, your key · clone the repo, npm run dev",
                price: "Free",
              },
            ].map((row, i) => (
              <motion.div
                key={i}
                {...reveal(i * 0.05)}
                className="grid grid-cols-12 items-baseline gap-4 border-b py-7"
                style={{ borderColor: "var(--hairline)" }}
              >
                <p
                  className="col-span-12 text-[22px] sm:col-span-3"
                  style={{
                    fontFamily: "var(--font-fraunces)",
                    fontWeight: 500,
                    color: "var(--color-charcoal)",
                  }}
                >
                  {row.label}
                </p>
                <p
                  className="col-span-12 text-[15px] leading-[1.5] sm:col-span-7"
                  style={{
                    color: "var(--color-charcoal)",
                    opacity: 0.7,
                    fontFamily: "var(--font-inter-tight)",
                  }}
                >
                  {row.desc}
                </p>
                <p
                  className="col-span-12 text-right font-mono text-[20px] sm:col-span-2"
                  style={{ color: "var(--color-oxblood)" }}
                >
                  {row.price}
                </p>
              </motion.div>
            ))}
          </div>

          <motion.div {...reveal()} className="mt-10">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] underline decoration-1 underline-offset-4 transition-opacity hover:opacity-60"
              style={{ color: "var(--color-oxblood)" }}
            >
              See full pricing →
            </Link>
          </motion.div>
        </section>

        {/* FINAL CTA — typographic punchline */}
        <section className="mt-44 grid grid-cols-12 gap-x-10">
          <div className="col-span-12 md:col-span-10 md:col-start-2">
            <motion.h2
              {...reveal()}
              className="text-[88px] leading-[0.9] tracking-tight sm:text-[128px] md:text-[152px]"
              style={{
                fontFamily: "var(--font-fraunces)",
                fontStyle: "italic",
                color: "var(--color-oxblood)",
                fontWeight: 400,
                letterSpacing: "-0.035em",
              }}
            >
              Still here?
            </motion.h2>

            <motion.div {...reveal(0.1)} className="mt-14">
              <Link
                href="/setup"
                className="exhale group inline-flex items-center gap-3 rounded-full px-7 py-4 text-[15px] font-medium transition-transform duration-300 ease-out focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3"
                style={{ background: "var(--color-coral)", color: "var(--color-bone)" }}
              >
                Take the seat.
                <span
                  aria-hidden="true"
                  className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </motion.div>

            <motion.p
              {...reveal(0.15)}
              className="mt-10 font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: "var(--color-deep-green)", opacity: 0.7 }}
            >
              Free demo. No signup. No credit card. No anxiety required.
            </motion.p>
          </div>
        </section>

        {/* THE EXHALE — bottom waveform, quieter */}
        <div
          aria-hidden="true"
          className="mt-32"
          style={{ opacity: 0.45 }}
        >
          <BreathingWaveform color="var(--color-oxblood)" />
        </div>

        {/* COLOPHON — the page signs off */}
        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-y-3 border-t pt-7 font-mono text-[10px] uppercase tracking-[0.26em]"
          style={{ borderColor: "var(--hairline)", color: "var(--color-deep-green)", opacity: 0.75 }}
        >
          <span>Don&rsquo;t Be Shy · Spring 2026</span>
          <span>Set in Fraunces &amp; Inter Tight</span>
          <span>End of issue</span>
        </div>
      </main>

      <AttributionFooter />
    </div>
  );
}
