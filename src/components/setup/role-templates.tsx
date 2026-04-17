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
  Code2: <Code2 className="h-6 w-6" />,
  LayoutDashboard: <LayoutDashboard className="h-6 w-6" />,
  Handshake: <Handshake className="h-6 w-6" />,
  Palette: <Palette className="h-6 w-6" />,
  Sparkles: <Sparkles className="h-6 w-6" />,
};

interface RoleTemplatesProps {
  selected: RoleType | null;
  onSelect: (role: RoleType) => void;
}

export function RoleTemplates({ selected, onSelect }: RoleTemplatesProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {ROLE_TEMPLATES.map((template) => (
        <button
          key={template.id}
          onClick={() => onSelect(template.id)}
          className={`flex items-start gap-3 rounded-xl border-2 p-4 text-left transition-all ${
            selected === template.id
              ? "border-indigo-600 bg-indigo-50 shadow-sm"
              : "border-slate-200 bg-white hover:border-indigo-300 hover:shadow-sm"
          }`}
        >
          <div
            className={`mt-0.5 rounded-lg p-2 ${
              selected === template.id
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {iconMap[template.icon] ?? <Sparkles className="h-6 w-6" />}
          </div>
          <div>
            <div className="font-semibold text-slate-800">{template.name}</div>
            <div className="mt-0.5 text-sm text-slate-500">
              {template.description}
            </div>
            {template.questions.length > 0 && (
              <div className="mt-1 text-xs text-indigo-600">
                {template.questions.length} questions ready
              </div>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
