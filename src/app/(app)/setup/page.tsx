"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { RoleTemplates } from "@/components/setup/role-templates";
import { ModeSelector } from "@/components/setup/mode-selector";
import { ApiKeyInput } from "@/components/setup/api-key-input";
import { getApiKey, saveApiKey } from "@/lib/api-key";
import type { RoleType } from "@/types/interview";

export default function SetupPage() {
  const router = useRouter();
  const [roleType, setRoleType] = useState<RoleType | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [mode, setMode] = useState<"voice" | "text">("text");
  const [apiKey, setApiKey] = useState(getApiKey() ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canStart = (roleType && roleType !== "custom" && jobTitle.trim()) || (roleType === "custom" && jobTitle.trim());

  async function handleStart() {
    if (!canStart) return;
    setLoading(true);
    setError("");

    if (apiKey) saveApiKey(apiKey);

    try {
      const res = await fetch("/api/interview/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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

      // Store session data in sessionStorage for the interview page
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
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Set up your interview</h1>
      <p className="mt-1 text-slate-500">Choose a role, pick your mode, and start practicing.</p>

      {/* Step 1: Role */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          1. What role are you interviewing for?
        </h2>
        <RoleTemplates selected={roleType} onSelect={(role) => {
          setRoleType(role);
          if (role !== "custom") {
            const templates = {
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
            setJobTitle(templates[role as keyof typeof templates] || role);
          }
        }} />

        <div className="mt-4">
          <input
            type="text"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="Job title (e.g., Senior React Developer at Stripe)"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        </div>

        {!showJD ? (
          <button
            onClick={() => setShowJD(true)}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-700"
          >
            + Paste a full job description for personalized questions
          </button>
        ) : (
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here (optional but recommended for personalized questions)..."
            rows={6}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
        )}
      </section>

      {/* Step 2: Mode */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          2. How do you want to respond?
        </h2>
        <ModeSelector mode={mode} onSelect={setMode} />
      </section>

      {/* Step 3: API Key */}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
          3. API Key
        </h2>
        <ApiKeyInput apiKey={apiKey} onChange={setApiKey} />
      </section>

      {/* Start */}
      <div className="mt-10">
        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          onClick={handleStart}
          disabled={!canStart || loading}
          className="w-full rounded-xl bg-indigo-600 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-200 transition-all hover:bg-indigo-700 disabled:opacity-40"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Generating your interview...
            </span>
          ) : (
            "Start Interview"
          )}
        </button>
      </div>
    </div>
  );
}
