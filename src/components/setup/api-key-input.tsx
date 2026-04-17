"use client";

import { useState } from "react";
import { Key, Eye, EyeOff, Check, X } from "lucide-react";
import { isValidKeyFormat } from "@/lib/api-key";

interface ApiKeyInputProps {
  apiKey: string;
  onChange: (key: string) => void;
}

export function ApiKeyInput({ apiKey, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"pass" | "fail" | null>(null);

  const isValid = apiKey === "" || isValidKeyFormat(apiKey);

  async function testKey() {
    if (!apiKey || !isValidKeyFormat(apiKey)) return;
    setTesting(true);
    setTestResult(null);

    try {
      const res = await fetch("/api/health");
      if (res.ok) {
        setTestResult("pass");
      } else {
        setTestResult("fail");
      }
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-2">
      <label htmlFor="anthropic-api-key" className="flex items-center gap-2 text-sm font-medium text-slate-700">
        <Key aria-hidden="true" className="h-4 w-4" />
        Anthropic API Key
        <span className="text-xs text-slate-400">(optional)</span>
      </label>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            id="anthropic-api-key"
            type={visible ? "text" : "password"}
            value={apiKey}
            onChange={(e) => {
              onChange(e.target.value);
              setTestResult(null);
            }}
            placeholder="sk-ant-..."
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!isValid}
            aria-describedby="anthropic-api-key-hint"
            className={`w-full rounded-lg border px-3 py-2 pr-10 font-mono text-sm transition-colors ${
              !isValid
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-200"
            } focus:outline-none focus:ring-2`}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide API key" : "Show API key"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={testKey}
          disabled={!apiKey || !isValid || testing}
          aria-label="Test API key connectivity"
          className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40"
        >
          {testing ? "..." : "Test"}
        </button>

        {testResult === "pass" && <Check aria-label="API key works" className="my-auto h-5 w-5 text-emerald-500" />}
        {testResult === "fail" && <X aria-label="API key check failed" className="my-auto h-5 w-5 text-red-500" />}
      </div>

      <p id="anthropic-api-key-hint" className="text-xs text-slate-500">
        {!apiKey
          ? "No key? Demo mode gives you 3 free questions per session."
          : "Stored in your browser only. Never sent to our servers."}
      </p>
    </div>
  );
}
