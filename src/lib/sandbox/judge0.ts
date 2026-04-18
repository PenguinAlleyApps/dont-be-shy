/**
 * Judge0 wrapper — server-side proxy for executing C# (and any language we don't
 * run client-side). Set JUDGE0_URL + JUDGE0_AUTH_TOKEN in env. Free tier on
 * RapidAPI is 50 reqs/day, enough for one developer drilling.
 *
 * Language IDs (Judge0 CE):
 *   71 = python 3.11.2 (we never use — Pyodide handles)
 *   63 = JavaScript (Node.js 12.14)
 *   74 = TypeScript (3.7.4)
 *   51 = C# (Mono 6.6.0.161)
 *   83 = Swift (5.2.3)
 */

import { JUDGE0_URL, JUDGE0_AUTH_TOKEN } from "@/lib/config";
import type { CodingLanguage, ExecutionResult, TestCase, TestResult } from "@/types/interview";

const LANG_ID: Record<CodingLanguage, number> = {
  csharp: 51,
  python: 71,
  javascript: 63,
  typescript: 74,
};

interface Judge0Submission {
  source_code: string;
  language_id: number;
  stdin?: string;
  expected_output?: string;
  cpu_time_limit?: number;
  memory_limit?: number;
}

interface Judge0Response {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  status: { id: number; description: string };
  time: string | null;
  memory: number | null;
}

function isRapidApi(url: string): boolean {
  return url.includes("rapidapi.com") || url.includes("judge0-ce.p.rapidapi.com");
}

function buildHeaders(): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (!JUDGE0_AUTH_TOKEN) return headers;
  if (isRapidApi(JUDGE0_URL)) {
    headers["X-RapidAPI-Key"] = JUDGE0_AUTH_TOKEN;
    // host is encoded in the URL but RapidAPI requires the explicit header too
    try {
      headers["X-RapidAPI-Host"] = new URL(JUDGE0_URL).host;
    } catch {
      headers["X-RapidAPI-Host"] = "judge0-ce.p.rapidapi.com";
    }
  } else {
    headers["X-Auth-Token"] = JUDGE0_AUTH_TOKEN;
  }
  return headers;
}

async function submit(payload: Judge0Submission): Promise<Judge0Response> {
  const url = `${JUDGE0_URL.replace(/\/$/, "")}/submissions?base64_encoded=false&wait=true`;
  const res = await fetch(url, {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`judge0 ${res.status}: ${txt.slice(0, 200)}`);
  }
  return (await res.json()) as Judge0Response;
}

export async function isJudge0Configured(): Promise<boolean> {
  return !!JUDGE0_URL;
}

export async function runJudge0(
  language: CodingLanguage,
  code: string,
  testCases: TestCase[],
): Promise<ExecutionResult> {
  const start = Date.now();
  if (!JUDGE0_URL) {
    return {
      language,
      results: [],
      stdout: "",
      stderr: "",
      durationMs: 0,
      systemError: "judge0_not_configured",
    };
  }

  const langId = LANG_ID[language];
  if (!langId) {
    return {
      language,
      results: [],
      stdout: "",
      stderr: "",
      durationMs: 0,
      systemError: `judge0 has no language id for ${language}`,
    };
  }

  const results: TestResult[] = [];
  let combinedStdout = "";
  let combinedStderr = "";

  for (const tc of testCases) {
    const tcStart = Date.now();
    try {
      const r = await submit({
        source_code: code,
        language_id: langId,
        stdin: tc.input,
        cpu_time_limit: 5,
        memory_limit: 128000,
      });
      const stdout = (r.stdout ?? "").trim();
      const stderr = (r.stderr ?? r.compile_output ?? r.message ?? "").trim();
      const passed = !stderr && stdout === tc.expected.trim();
      results.push({
        name: tc.name,
        passed,
        expected: tc.expected.trim(),
        actual: stdout,
        error: stderr || undefined,
        durationMs: Date.now() - tcStart,
      });
      combinedStdout += `[${tc.name}]\n${r.stdout ?? ""}\n`;
      if (stderr) combinedStderr += `[${tc.name}]\n${stderr}\n`;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "judge0 request failed";
      results.push({
        name: tc.name,
        passed: false,
        expected: tc.expected.trim(),
        actual: "",
        error: msg,
        durationMs: Date.now() - tcStart,
      });
      combinedStderr += `[${tc.name}] ${msg}\n`;
    }
  }

  return {
    language,
    results,
    stdout: combinedStdout,
    stderr: combinedStderr,
    durationMs: Date.now() - start,
  };
}
