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
      setTestResult(res.ok ? "pass" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="space-y-3">
      <label
        htmlFor="anthropic-api-key"
        className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest"
        style={{ color: "var(--color-deep-green)" }}
      >
        <Key aria-hidden="true" className="h-3.5 w-3.5" />
        Anthropic API Key
        <span style={{ opacity: 0.6 }}>(optional)</span>
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
            className="w-full rounded-lg border px-3 py-2.5 pr-10 font-mono text-sm transition-colors focus:outline-none focus:ring-2"
            style={{
              borderColor: !isValid ? "var(--color-oxblood)" : "var(--color-charcoal-soft)",
              background: "var(--color-bone-50)",
              color: "var(--color-charcoal)",
            }}
          />
          <button
            type="button"
            onClick={() => setVisible(!visible)}
            aria-label={visible ? "Hide API key" : "Show API key"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-deep-green)" }}
          >
            {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
          </button>
        </div>

        <button
          type="button"
          onClick={testKey}
          disabled={!apiKey || !isValid || testing}
          aria-label="Test API key"
          className="rounded-lg border px-4 py-2 font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-80 disabled:opacity-40"
          style={{
            borderColor: "var(--color-charcoal-soft)",
            color: "var(--color-deep-green)",
            background: "var(--color-bone-50)",
          }}
        >
          {testing ? "..." : "Test"}
        </button>

        {testResult === "pass" && <Check aria-label="Key works" className="my-auto h-5 w-5" style={{ color: "var(--color-deep-green)" }} />}
        {testResult === "fail" && <X aria-label="Key check failed" className="my-auto h-5 w-5" style={{ color: "var(--color-oxblood)" }} />}
      </div>

      <p
        id="anthropic-api-key-hint"
        className="text-xs"
        style={{ color: "var(--color-charcoal-soft)" }}
      >
        {!apiKey
          ? "No key? Demo mode gives you 3 free questions per session."
          : "Stored in your browser only. Never sent to our servers."}
      </p>
    </div>
  );
}
