"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { isValidKeyFormat } from "@/lib/api-key";

interface ApiKeyInputProps {
  apiKey: string;
  onChange: (key: string) => void;
}

/**
 * Hairline API-key input. No card, no Test button (the next API call is the
 * test). Mono font appears here only — the key is code-shaped data.
 */
export function ApiKeyInput({ apiKey, onChange }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false);
  const isValid = apiKey === "" || isValidKeyFormat(apiKey);

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          id="anthropic-api-key"
          type={visible ? "text" : "password"}
          value={apiKey}
          onChange={(e) => onChange(e.target.value)}
          placeholder="sk-ant-..."
          autoComplete="off"
          spellCheck={false}
          aria-invalid={!isValid}
          aria-describedby="anthropic-api-key-hint"
          className="h-11 w-full bg-transparent pr-10 text-[15px] focus:outline-none"
          style={{
            borderTop: "none",
            borderLeft: "none",
            borderRight: "none",
            borderBottom: !isValid
              ? "1px solid var(--color-oxblood)"
              : "1px solid var(--hairline)",
            color: "var(--surface-ink)",
            fontFamily: "var(--font-mono)",
            paddingLeft: 0,
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? "Hide API key" : "Show API key"}
          aria-pressed={visible}
          className="absolute right-0 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
          style={{ color: "var(--muted)" }}
        >
          {visible ? <EyeOff aria-hidden="true" className="h-4 w-4" /> : <Eye aria-hidden="true" className="h-4 w-4" />}
        </button>
      </div>

      <p
        id="anthropic-api-key-hint"
        className="text-[13px]"
        style={{
          color: "var(--muted)",
          fontFamily: "var(--font-inter-tight)",
        }}
      >
        {!apiKey
          ? "Stored locally. Never sent anywhere but Anthropic. Skip it for the demo (3 questions free)."
          : "Stored locally. Never sent anywhere but Anthropic."}
      </p>
    </div>
  );
}
