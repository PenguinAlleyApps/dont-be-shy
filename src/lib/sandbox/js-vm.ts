/**
 * JavaScript / TypeScript sandbox — runs candidate code in an inline Web Worker.
 *
 * The candidate's code must define a `solve(input)` function (or read the global
 * `INPUT` variable). The harness imports nothing, captures console.log into a
 * stdout buffer, enforces a 5s wall-clock timeout, and runs each test case in a
 * fresh worker so state doesn't leak.
 *
 * TypeScript is "executed" by stripping types — no real type-check at runtime.
 * Real type errors surface only at build time in our editor's lint diagnostics.
 */

import type { CodingLanguage, ExecutionResult, TestCase, TestResult } from "@/types/interview";

const TIMEOUT_MS = 5000;

const WORKER_BODY = `
self.onmessage = (e) => {
  const { code, input } = e.data;
  const stdout = [];
  const stderr = [];
  const origLog = console.log;
  const origErr = console.error;
  console.log = (...args) => stdout.push(args.map(String).join(" "));
  console.error = (...args) => stderr.push(args.map(String).join(" "));
  let result;
  try {
    const wrapped = code + "\\n;return (typeof solve === 'function') ? solve(INPUT) : undefined;";
    const fn = new Function("INPUT", wrapped);
    result = fn(input);
    if (result !== undefined) stdout.push(typeof result === 'object' ? JSON.stringify(result) : String(result));
  } catch (err) {
    stderr.push(err && err.stack ? err.stack : String(err));
  }
  console.log = origLog;
  console.error = origErr;
  self.postMessage({ stdout: stdout.join("\\n"), stderr: stderr.join("\\n") });
};
`;

function buildWorker(): Worker {
  const blob = new Blob([WORKER_BODY], { type: "application/javascript" });
  const url = URL.createObjectURL(blob);
  const w = new Worker(url);
  // Schedule URL revocation after worker boots
  setTimeout(() => URL.revokeObjectURL(url), 100);
  return w;
}

/** Strip TypeScript-only syntax: type annotations, interfaces, enums, generics on functions.
 *  Crude but enough for the contest-style snippets we ship. */
function stripTypes(src: string): string {
  return src
    // remove type-only imports
    .replace(/^import\s+type\s.*?;?$/gm, "")
    // remove `interface X {...}` and `type X = ...;` blocks
    .replace(/^(?:export\s+)?interface\s+\w+(?:\s+extends\s+[^{]+)?\s*\{[\s\S]*?\n\}/gm, "")
    .replace(/^(?:export\s+)?type\s+\w+\s*=[\s\S]*?;\s*$/gm, "")
    // strip `: TypeName` annotations on params/vars (greedy until comma, paren, equals, semi, brace)
    .replace(/:\s*[A-Za-z_$][\w<>\[\]\s,|&'"`.()?]*?(?=[=,)\];\n{])/g, "")
    // remove `as Type` casts
    .replace(/\s+as\s+[A-Za-z_$][\w<>\[\]\s,|&.]*/g, "")
    // remove generic angle brackets after function names like fn<T>(
    .replace(/(\bfunction\s+\w+|\bconst\s+\w+\s*=)\s*<[^>]+>/g, "$1")
    .replace(/(\b[a-zA-Z_$][\w$]*)\s*<[^<>()]+>\s*\(/g, "$1(");
}

async function runOne(code: string, input: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve) => {
    const w = buildWorker();
    const timer = setTimeout(() => {
      w.terminate();
      resolve({ stdout: "", stderr: `timeout after ${TIMEOUT_MS}ms` });
    }, TIMEOUT_MS);
    w.onmessage = (e) => {
      clearTimeout(timer);
      w.terminate();
      resolve(e.data as { stdout: string; stderr: string });
    };
    w.onerror = (err) => {
      clearTimeout(timer);
      w.terminate();
      resolve({ stdout: "", stderr: err.message });
    };
    let parsed: unknown = input;
    try {
      parsed = JSON.parse(input);
    } catch {
      // keep as string
    }
    w.postMessage({ code, input: parsed });
  });
}

export async function runJsLike(
  language: CodingLanguage,
  code: string,
  testCases: TestCase[],
): Promise<ExecutionResult> {
  const start = performance.now();
  const compiled = language === "typescript" ? stripTypes(code) : code;

  const results: TestResult[] = [];
  let combinedStdout = "";
  let combinedStderr = "";

  for (const tc of testCases) {
    const tcStart = performance.now();
    const out = await runOne(compiled, tc.input);
    const actual = out.stdout.trim();
    const expected = tc.expected.trim();
    results.push({
      name: tc.name,
      passed: !out.stderr && actual === expected,
      expected,
      actual,
      error: out.stderr || undefined,
      durationMs: Math.round(performance.now() - tcStart),
    });
    combinedStdout += `[${tc.name}]\n${out.stdout}\n`;
    if (out.stderr) combinedStderr += `[${tc.name}]\n${out.stderr}\n`;
  }

  return {
    language,
    results,
    stdout: combinedStdout,
    stderr: combinedStderr,
    durationMs: Math.round(performance.now() - start),
  };
}
