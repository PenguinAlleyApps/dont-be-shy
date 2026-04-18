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

interface StepProps {
  number: string;
  question: string;
  helper?: string;
  children: React.ReactNode;
}

function Step({ number, question, helper, children }: StepProps) {
  return (
    <section className="relative pl-8">
      {/* Left-margin ornament: thin vertical hairline + serif numeral */}
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-full w-px"
        style={{ background: "var(--hairline)" }}
      />
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 -translate-x-[calc(100%+8px)] text-[13px]"
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-fraunces)",
        }}
      >
        {number}
      </span>

      <h2
        className="text-[22px] leading-[1.25]"
        style={{
          color: "var(--surface-ink)",
          fontFamily: "var(--font-fraunces)",
          fontWeight: 500,
        }}
      >
        {question}
      </h2>
      {helper && (
        <p
          className="mt-1 text-[14px]"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-inter-tight)",
          }}
        >
          {helper}
        </p>
      )}
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}

function StepDivider() {
  return (
    <div className="flex justify-center" aria-hidden="true">
      <span className="block h-px w-12" style={{ background: "var(--hairline)" }} />
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<RoleType | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
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
    <div className="mx-auto max-w-[640px] px-6 py-24">
      <header>
        <h1
          className="text-[32px] leading-[1.15]"
          style={{
            color: "var(--surface-ink)",
            fontFamily: "var(--font-fraunces)",
            fontStyle: "italic",
            fontWeight: 400,
          }}
        >
          Let&rsquo;s calibrate.
        </h1>
        <p
          className="mt-3 text-[15px]"
          style={{
            color: "var(--muted)",
            fontFamily: "var(--font-inter-tight)",
          }}
        >
          Three questions. Then we talk.
        </p>
      </header>

      <div className="mt-20 space-y-24">
        <Step
          number="01"
          question="What role are you interviewing for?"
          helper="Pick the closest. Then add the actual job title."
        >
          <RoleTemplates
            selected={roleType}
            onSelect={(role) => {
              setRoleType(role);
              if (role !== "custom" && ROLE_TITLES[role]) {
                setJobTitle(ROLE_TITLES[role]!);
              }
            }}
          />

          <div>
            <label htmlFor="job-title" className="sr-only">
              Job title
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Job title (e.g., Senior React Developer at Stripe)"
              className="h-11 w-full bg-transparent text-[15px] focus:outline-none"
              style={{
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "1px solid var(--hairline)",
                color: "var(--surface-ink)",
                fontFamily: "var(--font-inter-tight)",
                paddingLeft: 0,
              }}
            />
          </div>

          <details className="group">
            <summary
              className="cursor-pointer list-none text-[14px] transition-colors hover:opacity-70"
              style={{ color: "var(--muted)", fontFamily: "var(--font-inter-tight)" }}
            >
              + Paste the full job description
            </summary>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full JD here (optional)..."
              rows={6}
              className="mt-3 w-full resize-none bg-transparent py-2 text-[15px] focus:outline-none"
              style={{
                borderTop: "none",
                borderLeft: "none",
                borderRight: "none",
                borderBottom: "1px solid var(--hairline)",
                color: "var(--surface-ink)",
                fontFamily: "var(--font-inter-tight)",
                paddingLeft: 0,
              }}
            />
          </details>
        </Step>

        <StepDivider />

        <Step number="02" question="How do you want to respond?">
          <ModeSelector mode={mode} onSelect={setMode} />
        </Step>

        <StepDivider />

        <Step
          number="03"
          question="Anthropic key"
          helper="Optional. Skip for the demo (3 questions). With a key, no caps."
        >
          <ApiKeyInput apiKey={apiKey} onChange={setApiKey} />
        </Step>
      </div>

      <div className="mt-20">
        {error && (
          <p
            className="mb-6 px-4 py-3 text-[14px]"
            style={{
              borderLeft: "2px solid var(--color-oxblood)",
              color: "var(--color-oxblood)",
              fontFamily: "var(--font-inter-tight)",
            }}
          >
            {error}
          </p>
        )}
        <button
          type="button"
          onClick={handleStart}
          disabled={!canStart || loading}
          className="flex h-12 w-full items-center justify-center gap-3 text-[15px] font-medium tracking-tight transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
          style={{
            background: "var(--surface-ink)",
            color: "var(--surface)",
            borderRadius: 0,
            fontFamily: "var(--font-inter-tight)",
          }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              Generating your interview...
            </>
          ) : (
            <>
              Start the interview
              <span aria-hidden="true">→</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
