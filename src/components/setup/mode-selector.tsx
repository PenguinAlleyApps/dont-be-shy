"use client";

import { Mic, Keyboard } from "lucide-react";

interface ModeSelectorProps {
  mode: "voice" | "text";
  onSelect: (mode: "voice" | "text") => void;
}

export function ModeSelector({ mode, onSelect }: ModeSelectorProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        onClick={() => onSelect("voice")}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
          mode === "voice"
            ? "border-indigo-600 bg-indigo-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-indigo-300"
        }`}
      >
        <Mic
          className={`h-8 w-8 ${
            mode === "voice" ? "text-indigo-600" : "text-slate-400"
          }`}
        />
        <span className="font-semibold text-slate-800">Voice</span>
        <span className="text-center text-xs text-slate-500">
          Speak your answers naturally. Requires Chrome or Edge.
        </span>
      </button>

      <button
        onClick={() => onSelect("text")}
        className={`flex flex-col items-center gap-2 rounded-xl border-2 p-5 transition-all ${
          mode === "text"
            ? "border-indigo-600 bg-indigo-50 shadow-sm"
            : "border-slate-200 bg-white hover:border-indigo-300"
        }`}
      >
        <Keyboard
          className={`h-8 w-8 ${
            mode === "text" ? "text-indigo-600" : "text-slate-400"
          }`}
        />
        <span className="font-semibold text-slate-800">Text</span>
        <span className="text-center text-xs text-slate-500">
          Type your responses. Works in all browsers.
        </span>
      </button>
    </div>
  );
}
