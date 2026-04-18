"use client";

import { ROLE_TEMPLATES } from "@/lib/interview/templates";
import type { RoleType } from "@/types/interview";

/**
 * Segmented control for role selection. Replaces the previous 5-card grid
 * which broke layout (3+2 asymmetry) and competed with the page rhythm.
 *
 * Treatment: hairline border around the group; selected item gets oxblood
 * underline + colored text. No cards, no boxes, no icon backgrounds.
 */

interface RoleTemplatesProps {
  selected: RoleType | null;
  onSelect: (role: RoleType) => void;
}

const SHORT_LABEL: Record<string, string> = {
  software_engineer: "Engineer",
  frontend: "Frontend",
  backend: "Backend",
  fullstack: "Fullstack",
  data_ml: "Data / ML",
  devops: "DevOps",
  product_manager: "PM",
  ux_designer: "Design",
  sales: "Sales",
  marketing: "Marketing",
  leadership: "Leadership",
  custom: "Custom",
};

export function RoleTemplates({ selected, onSelect }: RoleTemplatesProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Interview role"
      className="flex flex-wrap items-stretch"
      style={{
        border: "1px solid var(--hairline)",
        borderRadius: 0,
      }}
    >
      {ROLE_TEMPLATES.map((template, idx) => {
        const isSelected = selected === template.id;
        const label = SHORT_LABEL[template.id] ?? template.name;
        return (
          <button
            key={template.id}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onSelect(template.id)}
            className="relative px-4 py-3 text-[13px] font-medium transition-colors"
            style={{
              color: isSelected ? "var(--color-oxblood)" : "var(--surface-ink)",
              borderLeft: idx === 0 ? "none" : "1px solid var(--hairline)",
              fontFamily: "var(--font-inter-tight)",
              background: "transparent",
            }}
          >
            {label}
            {isSelected && (
              <span
                aria-hidden="true"
                className="absolute left-2 right-2 -bottom-px h-[2px]"
                style={{ background: "var(--color-oxblood)" }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
