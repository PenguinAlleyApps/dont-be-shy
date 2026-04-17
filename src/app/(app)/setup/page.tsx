"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RoleTemplates } from "@/components/setup/role-templates";
import { ModeSelector } from "@/components/setup/mode-selector";
import { ApiKeyInput } from "@/components/setup/api-key-input";
import { getApiKey, saveApiKey } from "@/lib/api-key";
import { authHeader } from "@/lib/pro-client";
import type { RoleType } from "@/types/interview";

const ROLE_TITLES: Partial<Record<RoleType, string>> = {
  software_engineer: "Software Engineer",
  frontend: "Frontend Developer",
  backend: "Backend Developer",
  fullstack: "Full-Stack Developer",
  data_ml: "Data / ML Engineer",
  devops: "DevOps / SRE",
  product_manager: "Product Manager",
  ux_designer: "UX Designer",
  sales: "Sales / Business Development",
  marketing: "Marketing",
  leadership: "Engineering Manager / Director",
};

function StepLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return (
    <h2
      className="font-mono text-xs uppercase tracking-[0.22em]"
      style={{ color: "var(--color-oxblood)" }}
    >
      <span style={{ color: "var(--color-deep-green)" }}>{number}</span> · {children}
    </h2>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<RoleType | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [mode, setMode] = useState<"voice" | "text">("voice");
  const [apiKey, setApiKey] = useState(getApiKey() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canStart = !!roleType && jobTitle.trim().length > 0;

  async function handleStart() {
    if (!canStart) return;
    setLoading(true);
    setError("");
    if (apiKey) saveApiKey(apiKey);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader() },
        body: JSON.stringify({
          jobTitle: jobTitle.trim(),
          jobDescription: jobDescription.trim() || undefined,
          roleType,
          questionCount: 5,
          apiKey: apiKey || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start interview");
      }

      const data = await res.json();
      sessionStorage.setItem(
        `dont-be-shy-session-${data.sessionId}`,
        JSON.stringify({
          ...data,
          mode,
          jobTitle: jobTitle.trim(),
          roleType,
          apiKey: apiKey || undefined,
        }),
      );

      router.push(`/interview/${data.sessionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12 sm:px-8 sm:py-16">
      <header>
        <p
          className="font-mono text-xs uppercase tracking-[0.22em]"
          style={{ color: "var(--color-deep-green)" }}
        >
          Setup
        </p>
        <h1
          className="mt-3 text-4xl tracking-tight sm:text-5xl"
          style={{
            fontFamily: "var(--font-fraunces)",
            fontWeight: 500,
            color: "var(--color-charcoal)",
          }}
        >
          Tell me what you&rsquo;re walking into.
        </h1>
        <p className="mt-3 text-base" style={{ color: "var(--color-charcoal-soft)" }}>
          Three steps. The interview adapts to what you say here.
        </p>
      </header>

      <section className="mt-12 space-y-4">
        <StepLabel number="01">What role are you interviewing for?</StepLabel>
        <RoleTemplates
          selected={roleType}
          onSelect={(role) => {
            setRoleType(role);
            if (role !== "custom" && ROLE_TITLES[role]) {
              setJobTitle(ROLE_TITLES[role]!);
            }
          }}
        />

        <div className="pt-2">
          <label htmlFor="job-title" className="sr-only">
            Job title
          </label>
          <input
            id="job-title"
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job title (e.g., Senior React Developer at Stripe)"
            className="w-full rounded-lg border px-4 py-3 text-base transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-charcoal-soft)",
              background: "var(--color-bone-50)",
              color: "var(--color-charcoal)",
              fontFamily: "var(--font-inter-tight)",
            }}
          />
        </div>

        {!showJD ? (
          <button
            type="button"
            onClick={() => setShowJD(true)}
            className="font-mono text-xs uppercase tracking-widest underline decoration-1 underline-offset-4 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-oxblood)" }}
          >
            + Paste a full job description for personalized questions
          </button>
        ) : (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here (optional but recommended)..."
            rows={6}
            className="w-full rounded-lg border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: "var(--color-charcoal-soft)",
              background: "var(--color-bone-50)",
              color: "var(--color-charcoal)",
              fontFamily: "var(--font-inter-tight)",
            }}
          />
        )}
      </section>

      <section className="mt-12 space-y-4">
        <StepLabel number="02">How do you want to respond?</StepLabel>
        <ModeSelector mode={mode} onSelect={setMode} />
      </section>

      <section className="mt-12">
        <StepLabel number="03">Anthropic key</StepLabel>
        <div className="mt-4">
          <ApiKeyInput apiKey={apiKey} onChange={setApiKey} />
        </div>
      </section>

      <div className="mt-14">
        {error && (
          <p
            className="mb-4 rounded-lg px-4 py-3 text-sm"
            style={{
              background: "var(--color-bone-200)",
              color: "var(--color-oxblood)",
              borderLeft: "3px solid var(--color-oxblood)",
            }}
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart || loading}
          className="group inline-flex items-center gap-3 rounded-full px-7 py-4 text-base font-medium transition-transform duration-300 ease-out hover:-translate-y-0.5 hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-3 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:scale-100"
          style={{
            background: "var(--color-coral)",
            color: "var(--color-bone)",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
              Generating your interview...
            </>
          ) : (
            <>
              Take the seat.
              <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-0.5">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
