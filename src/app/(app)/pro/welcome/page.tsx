"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { saveProToken } from "@/lib/pro-client";

function Welcome() {
  const params = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"working" | "ok" | "error">("working");
  const [message, setMessage] = useState("Activating your access…");

  useEffect(() => {
    const sessionId = params.get("session_id");
    if (!sessionId) {
      setStatus("error");
      setMessage("No checkout session id in the URL. If you just paid, check your Stripe receipt for a link back to this page.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/pro/activate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Activation failed");

        saveProToken(data.token, {
          sku: data.sku,
          durationDays: data.durationDays,
          expiresAt: data.expiresAt,
        });

        if (!cancelled) {
          setStatus("ok");
          setMessage("You're in. Redirecting to setup…");
          setTimeout(() => router.push("/setup"), 1500);
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(err instanceof Error ? err.message : "Activation failed");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [params, router]);

  const accent =
    status === "ok"
      ? "var(--color-deep-green)"
      : status === "error"
        ? "var(--color-oxblood)"
        : "var(--color-deep-green)";

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-start justify-center px-6 py-16 sm:px-10">
      <p
        className="font-mono text-xs uppercase tracking-[0.22em]"
        style={{ color: "var(--color-oxblood)" }}
      >
        {status === "ok" ? "All set" : status === "error" ? "Hold on" : "One moment"}
      </p>
      <h1
        className="mt-4 text-5xl tracking-tight sm:text-6xl"
        style={{
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
          color: accent,
        }}
      >
        {status === "ok"
          ? "Thank you. Now go practice."
          : status === "error"
            ? "Something went sideways."
            : "Almost there."}
      </h1>
      <p
        className="mt-6 max-w-xl text-base leading-relaxed"
        style={{ color: "var(--color-charcoal)" }}
      >
        {message}
      </p>
      {status === "error" && (
        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 font-mono text-xs uppercase tracking-widest">
          <a
            href="/pricing"
            className="underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-oxblood)" }}
          >
            Try checkout again
          </a>
          <a
            href="mailto:hello@penguinalley.com"
            className="underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-deep-green)" }}
          >
            Email support
          </a>
        </div>
      )}
    </div>
  );
}

export default function WelcomePage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-[60vh] items-center justify-center font-mono text-xs uppercase tracking-widest"
          style={{ color: "var(--color-deep-green)" }}
        >
          Loading…
        </div>
      }
    >
      <Welcome />
    </Suspense>
  );
}
