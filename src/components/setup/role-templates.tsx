"use client";

import {
  Code2,
  LayoutDashboard,
  Handshake,
  Palette,
  Sparkles,
} from "lucide-react";
import { ROLE_TEMPLATES } from "@/lib/interview/templates";
import type { RoleType } from "@/types/interview";

const iconMap: Record<string, React.ReactNode> = {
  Code2: <Code2 className="h-5 w-5" aria-hidden="true" />,
  LayoutDashboard: <LayoutDashboard className="h-5 w-5" aria-hidden="true" />,
  Handshake: <Handshake className="h-5 w-5" aria-hidden="true" />,
  Palette: <Palette className="h-5 w-5" aria-hidden="true" />,
  Sparkles: <Sparkles className="h-5 w-5" aria-hidden="true" />,
};

interface RoleTemplatesProps {
  selected: RoleType | null;
  onSelect: (role: RoleType) => void;
}

export function RoleTemplates({ selected, onSelect }: RoleTemplatesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ROLE_TEMPLATES.map((template) => {
        const isSelected = selected === template.id;
        return (
          <button
            key={template.id}
            type="button"
            onClick={() => onSelect(template.id)}
            aria-pressed={isSelected}
            className={`group flex items-start gap-3 rounded-2xl border p-4 text-left transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2`}
            style={{
              borderColor: isSelected ? "var(--color-oxblood)" : "var(--color-charcoal-soft)",
              background: isSelected ? "var(--color-bone-200)" : "var(--color-bone-50)",
              borderWidth: isSelected ? "2px" : "1px",
              padding: isSelected ? "15px" : "16px",
            }}
          >
            <span
              className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
              style={{
                background: isSelected ? "var(--color-oxblood)" : "var(--color-bone-200)",
                color: isSelected ? "var(--color-bone)" : "var(--color-deep-green)",
              }}
            >
              {iconMap[template.icon] ?? <Sparkles className="h-5 w-5" aria-hidden="true" />}
            </span>
            <span className="flex-1">
              <span
                className="block text-base"
                style={{
                  fontFamily: "var(--font-fraunces)",
                  fontWeight: 500,
                  color: "var(--color-charcoal)",
                }}
              >
                {template.name}
              </span>
              <span
                className="mt-1 block text-sm leading-snug"
                style={{ color: "var(--color-charcoal-soft)" }}
              >
                {template.description}
              </span>
              {template.questions.length > 0 && (
                <span
                  className="mt-2 block font-mono text-[11px] uppercase tracking-widest"
                  style={{ color: isSelected ? "var(--color-oxblood)" : "var(--color-deep-green)" }}
                >
                  {template.questions.length} questions ready
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}
