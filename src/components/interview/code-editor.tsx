"use client";

/**
 * CodeMirror 6 editor wrapper.
 *
 * Brand-themed, lazy-loaded, debounced onChange that pushes snapshots up
 * to the parent. Bundle: ~200KB tree-shaken (vs Monaco's 2.4MB).
 */

import { useEffect, useRef, useState } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import type { CodingLanguage } from "@/types/interview";

interface CodeEditorProps {
  language: CodingLanguage;
  initial: string;
  onChange: (code: string) => void;
  /** ms of inactivity before parent gets a "code idle" callback. Default 2000. */
  debounceMs?: number;
  readOnly?: boolean;
}

const brandTheme = EditorView.theme(
  {
    "&": {
      backgroundColor: "var(--surface)",
      color: "var(--surface-ink)",
      fontFamily: "var(--font-mono, ui-monospace, SFMono-Regular)",
      fontSize: "14px",
    },
    ".cm-content": { caretColor: "var(--color-oxblood)" },
    ".cm-gutters": {
      backgroundColor: "var(--surface-soft)",
      color: "var(--muted)",
      border: "none",
      borderRight: "1px solid var(--hairline)",
    },
    ".cm-activeLine": { backgroundColor: "rgba(107, 31, 46, 0.04)" },
    ".cm-activeLineGutter": {
      backgroundColor: "rgba(107, 31, 46, 0.06)",
      color: "var(--color-oxblood)",
    },
    ".cm-selectionBackground, .cm-content ::selection": {
      backgroundColor: "rgba(107, 31, 46, 0.15) !important",
    },
    "&.cm-focused": { outline: "none" },
  },
  { dark: false },
);

function langExt(lang: CodingLanguage) {
  if (lang === "python") return [python()];
  if (lang === "javascript") return [javascript()];
  if (lang === "typescript") return [javascript({ typescript: true })];
  // C#: no first-party CodeMirror lang. Plain editor with monospace + lint.
  return [];
}

export function CodeEditor({
  language,
  initial,
  onChange,
  debounceMs = 2000,
  readOnly = false,
}: CodeEditorProps) {
  const [value, setValue] = useState(initial);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setValue(initial);
  }, [initial]);

  function handleChange(next: string) {
    setValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(next), debounceMs);
  }

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: "var(--hairline)", background: "var(--surface)" }}
    >
      <div
        className="flex items-center justify-between px-3 py-1.5"
        style={{
          borderBottom: "1px solid var(--hairline)",
          background: "var(--surface-soft)",
        }}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: "var(--color-deep-green)" }}
        >
          {language}
        </span>
        <span
          className="font-mono text-[10px]"
          style={{ color: "var(--muted)" }}
        >
          {value.split("\n").length} lines
        </span>
      </div>
      <CodeMirror
        value={value}
        onChange={handleChange}
        extensions={[brandTheme, ...langExt(language)]}
        readOnly={readOnly}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          autocompletion: true,
          bracketMatching: true,
          closeBrackets: true,
        }}
        height="380px"
      />
    </div>
  );
}
