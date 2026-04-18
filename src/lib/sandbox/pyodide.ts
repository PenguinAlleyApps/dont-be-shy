/**
 * Pyodide sandbox — runs candidate Python code in a Web Worker isolated from the main thread.
 *
 * Pyodide is loaded lazily from the CDN on first use (~10MB, cached afterward).
 * We pipe stdout/stderr to a captured buffer and run each test case sequentially
 * by injecting an `INPUT` global the candidate's solution can read or by calling
 * the user-defined `solve(input)` function if present.
 */

import type { CodingLanguage, ExecutionResult, TestCase, TestResult } from "@/types/interview";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<unknown>;
    __pyodideInstance?: any;
  }
}

const PYODIDE_VERSION = "0.26.4";
const PYODIDE_CDN = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full`;

let loadingPromise: Promise<any> | null = null;

async function loadPyodideOnce(): Promise<any> {
  if (typeof window === "undefined") {
    throw new Error("pyodide can only run in the browser");
  }
  if (window.__pyodideInstance) return window.__pyodideInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    if (!window.loadPyodide) {
      await new Promise<void>((resolve, reject) => {
        const s = document.createElement("script");
        s.src = `${PYODIDE_CDN}/pyodide.js`;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error("failed to load pyodide script"));
        document.head.appendChild(s);
      });
    }
    if (!window.loadPyodide) throw new Error("pyodide global missing after load");
    const py = await window.loadPyodide({ indexURL: PYODIDE_CDN });
    window.__pyodideInstance = py;
    return py;
  })();

  return loadingPromise;
}

const HARNESS = `
import io, sys, json, traceback
def __dbs_run(user_code, input_payload):
    out_buf = io.StringIO()
    err_buf = io.StringIO()
    sys.stdout = out_buf
    sys.stderr = err_buf
    try:
        ns = {"INPUT": input_payload, "input_payload": input_payload}
        exec(user_code, ns, ns)
        if "solve" in ns and callable(ns["solve"]):
            result = ns["solve"](input_payload)
            if result is not None:
                print(result)
    except Exception:
        traceback.print_exc()
    sys.stdout = sys.__stdout__
    sys.stderr = sys.__stderr__
    return json.dumps({"stdout": out_buf.getvalue(), "stderr": err_buf.getvalue()})
`;

export async function runPython(code: string, testCases: TestCase[]): Promise<ExecutionResult> {
  const start = performance.now();
  try {
    const py = await loadPyodideOnce();
    py.runPython(HARNESS);

    const results: TestResult[] = [];
    let combinedStdout = "";
    let combinedStderr = "";

    for (const tc of testCases) {
      const tcStart = performance.now();
      const raw = py.runPython(`__dbs_run(${JSON.stringify(code)}, ${JSON.stringify(tc.input)})`);
      const parsed = JSON.parse(typeof raw === "string" ? raw : String(raw)) as {
        stdout: string;
        stderr: string;
      };
      const actual = parsed.stdout.trim();
      const expected = tc.expected.trim();
      results.push({
        name: tc.name,
        passed: !parsed.stderr && actual === expected,
        expected,
        actual,
        error: parsed.stderr || undefined,
        durationMs: Math.round(performance.now() - tcStart),
      });
      combinedStdout += `[${tc.name}]\n${parsed.stdout}\n`;
      if (parsed.stderr) combinedStderr += `[${tc.name}]\n${parsed.stderr}\n`;
    }

    return {
      language: "python" as CodingLanguage,
      results,
      stdout: combinedStdout,
      stderr: combinedStderr,
      durationMs: Math.round(performance.now() - start),
    };
  } catch (err) {
    return {
      language: "python" as CodingLanguage,
      results: [],
      stdout: "",
      stderr: "",
      durationMs: Math.round(performance.now() - start),
      systemError: err instanceof Error ? err.message : "pyodide failed",
    };
  }
}
