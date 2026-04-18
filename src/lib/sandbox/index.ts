/**
 * Sandbox router — picks the right execution path per language and per environment.
 *
 * Routing matrix:
 *   python      browser → Pyodide. Server fallback: Judge0 lang 71 (only if user disables Pyodide).
 *   javascript  browser → Web Worker. Server fallback: Judge0 lang 63.
 *   typescript  browser → Web Worker (after type-strip). Server fallback: Judge0 lang 74.
 *   csharp      server → Judge0 lang 51 only. No browser path exists.
 */

import type { CodingLanguage, ExecutionResult, TestCase } from "@/types/interview";

export interface ExecutionRequest {
  language: CodingLanguage;
  code: string;
  testCases: TestCase[];
}

/** Execute in the BROWSER. Never call from server code. */
export async function executeInBrowser(req: ExecutionRequest): Promise<ExecutionResult> {
  if (typeof window === "undefined") {
    throw new Error("executeInBrowser called from server");
  }
  if (req.language === "csharp") {
    // Only path is the server proxy → Judge0
    return executeViaServer(req);
  }
  if (req.language === "python") {
    const { runPython } = await import("./pyodide");
    return runPython(req.code, req.testCases);
  }
  // js + ts
  const { runJsLike } = await import("./js-vm");
  return runJsLike(req.language, req.code, req.testCases);
}

/** Execute via the /api/interview/code-execute server route. Used for C# always,
 *  and for any language where the browser path is disabled. */
export async function executeViaServer(req: ExecutionRequest): Promise<ExecutionResult> {
  const res = await fetch("/api/interview/code-execute", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req),
  });
  if (!res.ok) {
    const body = await res.text();
    return {
      language: req.language,
      results: [],
      stdout: "",
      stderr: body.slice(0, 400),
      durationMs: 0,
      systemError: `server ${res.status}`,
    };
  }
  return (await res.json()) as ExecutionResult;
}
