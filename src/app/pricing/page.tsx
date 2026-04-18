"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lockup } from "@/components/brand/logo";
import { AttributionFooter } from "@/components/layout/attribution-footer";

const TIERS = [
  {
    sku: "pro_7day" as const,
    eyebrow: "For the interview this week",
    name: "7-Day Pass",
    price: "$19",
    blurb: "One payment. Seven days of unlimited practice without supplying your own key.",
    features: [
      "Unlimited mock interviews",
      "All roles + custom JD",
      "Voice and text mode",
      "Full per-turn judge feedback",
      "No subscription, nothing recurs",
    ],
    cta: "Get the 7-day pass",
    highlight: true,
  },
  {
    sku: "pro_30day" as const,
    eyebrow: "For the active job search",
    name: "30-Day Pass",
    price: "$49",
    blurb: "A full month of practice while you're cycling through interviews.",
    features: [
      "Everything in 7-Day Pass",
      "Useful across multiple onsites",
      "Still one-time, no auto-renew",
    ],
    cta: "Get the 30-day pass",
    highlight: false,
  },
];

function PricingPageInner() {
  const router = useRouter();
  const params = useSearchParams();
  const canceled = params.get("canceled");
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handleCheckout(sku: "pro_7day" | "pro_30day") {
    setLoading(sku);
    setError("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sku }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        throw new Error(data.error || "Checkout failed");
      }
      window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen paper-grain" style={{ background: "var(--surface)" }}>
      <header className="px-6 pt-6 sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link
            href="/"
            aria-label="Don&apos;t Be Shy home"
            className="transition-opacity hover:opacity-70"
            style={{ color: "var(--surface-ink)" }}
          >
            <Lockup size={26} ink="var(--surface-ink)" spark="var(--color-coral)" />
          </Link>
          <nav
            aria-label="Primary"
            className="flex items-center gap-6 font-mono text-xs uppercase tracking-widest"
            style={{ color: "var(--color-deep-green)" }}
          >
            <Link href="/setup" className="transition-opacity hover:opacity-70">
              Free demo
            </Link>
            <a
              href="https://github.com/PenguinAlleyApps/dont-be-shy"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-opacity hover:opacity-70"
            >
              Source ↗
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 pb-24 pt-20 sm:px-10">
        <div className="max-w-2xl">
          <p
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--color-deep-green)" }}
          >
            Pricing
          </p>
          <h1
            className="mt-4 text-5xl tracking-tight sm:text-6xl"
            style={{
              fontFamily: "var(--font-fraunces)",
              fontWeight: 500,
              color: "var(--color-oxblood)",
            }}
          >
            Pay if it helps. Don&rsquo;t if it doesn&rsquo;t.
          </h1>
          <p className="mt-6 text-lg leading-relaxed" style={{ color: "var(--surface-ink)" }}>
            Don&rsquo;t Be Shy is free with your own Anthropic key. Pro is for when
            you&rsquo;d rather not deal with that — we run the keys, you just practice.
          </p>
        </div>

        {canceled && (
          <p
            className="mt-8 max-w-xl rounded-lg px-4 py-3 text-sm"
            style={{
              background: "var(--surface-accent)",
              color: "var(--color-deep-green)",
              borderLeft: "3px solid var(--color-deep-green)",
            }}
          >
            Checkout canceled. No charge made. Come back when you&rsquo;re ready.
          </p>
        )}

        {error && (
          <p
            className="mt-8 max-w-xl rounded-lg px-4 py-3 text-sm"
            style={{
              background: "var(--surface-accent)",
              color: "var(--color-oxblood)",
              borderLeft: "3px solid var(--color-oxblood)",
            }}
          >
            {error}
          </p>
        )}

        <section className="mt-16 grid gap-6 md:grid-cols-2">
          {TIERS.map((tier) => (
            <article
              key={tier.sku}
              className="flex flex-col rounded-2xl border p-8"
              style={{
                borderColor: tier.highlight ? "var(--color-oxblood)" : "var(--hairline)",
                borderWidth: tier.highlight ? "2px" : "1px",
                background: "var(--surface-soft)",
                padding: tier.highlight ? "31px" : "32px",
              }}
            >
              <p
                className="font-mono text-[11px] uppercase tracking-[0.22em]"
                style={{ color: "var(--color-oxblood)" }}
              >
                {tier.eyebrow}
              </p>
              <h2
                className="mt-3 text-2xl"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--surface-ink)",
                }}
              >
                {tier.name}
              </h2>
              <p
                className="mt-2 text-5xl tracking-tight"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--color-oxblood)",
                }}
              >
                {tier.price}
              </p>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                {tier.blurb}
              </p>
              <ul className="mt-6 space-y-2">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-3 text-sm leading-snug"
                    style={{ color: "var(--surface-ink)" }}
                  >
                    <span aria-hidden="true" style={{ color: "var(--color-oxblood)" }}>
                      ·
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => handleCheckout(tier.sku)}
                disabled={loading !== null}
                className="group mt-8 inline-flex items-center justify-center gap-3 rounded-full px-6 py-3.5 text-base font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: tier.highlight ? "var(--color-coral)" : "var(--surface-ink)",
                  color: tier.highlight ? "var(--color-bone)" : "var(--surface)",
                }}
              >
                {loading === tier.sku ? (
                  "Opening checkout..."
                ) : (
                  <>
                    {tier.cta}
                    <span
                      aria-hidden="true"
                      className="inline-block transition-transform duration-300 group-hover:translate-x-0.5"
                    >
                      →
                    </span>
                  </>
                )}
              </button>
            </article>
          ))}
        </section>

        <section className="mt-16 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
            <p
              className="font-mono text-xs uppercase tracking-[0.22em]"
              style={{ color: "var(--color-oxblood)" }}
            >
              The honest part
            </p>
          </div>
          <div className="md:col-span-8 space-y-4 text-base leading-relaxed" style={{ color: "var(--surface-ink)" }}>
            <p>
              The source is on GitHub under AGPL-3.0. You can self-host it, with
              your own Anthropic key, free forever. The only thing the paid tier
              gets you is convenience — we pay for the AI calls so you don&rsquo;t
              have to set up an account at Anthropic.
            </p>
            <p>
              No subscription. No auto-renew. We charge once, the access expires,
              you decide if you want to come back.
            </p>
            <p style={{ color: "var(--muted)" }}>
              For commercial licenses (bootcamps, career platforms wanting to
              embed or rebrand), email{" "}
              <a
                href="mailto:hello@penguinalley.com"
                className="underline decoration-1 underline-offset-4"
                style={{ color: "var(--color-deep-green)" }}
              >
                hello@penguinalley.com
              </a>
              .
            </p>
          </div>
        </section>

        <section className="mt-20 flex flex-col items-start gap-4 border-t pt-12" style={{ borderColor: "var(--hairline)" }}>
          <p
            className="font-mono text-xs uppercase tracking-[0.22em]"
            style={{ color: "var(--color-deep-green)" }}
          >
            Or stay free
          </p>
          <p className="text-2xl leading-snug" style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 400,
            color: "var(--surface-ink)",
          }}>
            Drop your Anthropic key in the setup screen and the demo cap goes away.
            Costs you whatever Anthropic costs (about 20 cents a session).
          </p>
          <button
            type="button"
            onClick={() => router.push("/setup")}
            className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-oxblood)" }}
          >
            Use your own key →
          </button>
        </section>
      </main>

      <AttributionFooter />
    </div>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center font-mono text-xs uppercase tracking-widest"
          style={{ background: "var(--surface)", color: "var(--color-deep-green)" }}
        >
          Loading…
        </div>
      }
    >
      <PricingPageInner />
    </Suspense>
  );
}
