# Don't Be Shy — Visual Signature & Brand Brief

> **Governance reference:** PA·co [EO-016](https://github.com/PenguinAlleyApps) — every PA product defines its own visual signature BEFORE UI work. Hard ban on indigo-gradient defaults.

## What this product feels like

The user lands here hours before a high-stakes interview. They are nervous. The page must feel like the **warm grown-up in the room** — not slick, not clinical, not sparkly-AI. The name "Don't Be Shy" is already doing playful work; the design is the calm hand on the shoulder.

**Five-word brand voice:** brave · warm · editorial · quietly playful · unapologetically open.

## The Visual Signature

The ONE thing recognizable in 2 seconds:

A **horizontal breathing waveform** stretched across the top of the hero, animating at box-breathing cadence (4s inhale expand, 6s exhale contract, infinite loop, CSS transform only). Color: oxblood. Appears nowhere else on the web.

## Color Palette

**Brand is intentionally always-light.** No dark mode. Anthropic does the same — the warm bone + serif body is the entire feeling we're selling. Auto-flipping to dark muddles it into "cafe oscuro" and loses the visual signature. CEO decision 2026-04-18 after v0.5 dark mode test failed brand integrity check.

| Hex | Name | Role |
|---|---|---|
| `#F5F1E8` | Bone | Page background. Editorial paper, NOT white. |
| `#FAF8F3` | Bone-50 | Subtle elevation (NOT a card outline). |
| `#ECE5D5` | Bone-200 | Warm tint for selected state, message bubbles. |
| `#1A1714` | Warm charcoal | Primary text. NOT pure black. |
| `#6B1F2E` | Oxblood | Primary accent. Waveform, display type emphasis, serious moments. |
| `#1E3A2F` | Deep green | Grounding secondary. Mono labels, hover states. |
| `#FF5E47` | Electric coral | Reserved spark. ONLY on the primary CTA. Scarcity = power. |

**Forbidden:** indigo, purple, violet, blue-to-purple gradients, CSS linear-gradients, glassmorphism, gradient text, **dark mode auto-switch**.

## Typography

- **Display:** Fraunces (variable, optical-size axis). Used for hero sentence + section headings. Weight 500, optical size 72+ for hero.
- **Body + UI:** Inter Tight (variable). Weight 400 body, 500 UI labels.
- **Mono accent:** JetBrains Mono. For the `Free · Open source · Your keys, your data.` subline + GitHub link + UI chrome (timer, transcript labels).
- **Handwritten accent:** Caveat. Used exactly once on the page (one overheard quote).

## Logo

**Mark — "The Blink":** two dots (eyes) + cocked eyebrow. Reads as a face caught mid-hesitation — the user's own state. Works at 16px favicon → 1200px social. Pure `#0E0E10` on bone, inverts to `#F4F1EC` on charcoal.

**Wordmark — "The Tilted Apostrophe":** "Don't Be Shy" set in Inter Tight 650, with the apostrophe in *Don't* rendered as a coral pill rotated 18° (the friend's nudge), and the period after *Shy* enlarged in coral (the resolution).

**Lockup:** Mark to the left, wordmark to the right. 8px gap.

## Hero Concept (landing page)

Asymmetric. Left-aligned, NOT centered. Top: full-width breathing waveform anchor. Below:

> **Practice the interview you're afraid of.**

Set in Fraunces 500, optical size maxed, oxblood on bone. Below in JetBrains Mono small caps:

> `Free · Open source · Your keys, your data.`

Single primary CTA, coral pill with bone text: **"I'm ready."** On hover, the waveform peaks coral and the button exhales (scale 1 → 1.02 → 1, 400ms ease-out). Beneath, plain text link in deep green: `Source on GitHub →`. NO second equal-weight CTA.

Bottom-right: small nervous penguin watermark (~120px). Does not dominate.

## Motion Principles

- **Animates:** breathing waveform (always, CSS only), CTA hover spark (Framer Motion <500ms), scroll-linked reveals on second fold (fade + 8px translate, viewport-triggered).
- **Stays still:** typography, illustrations, layout chrome. NO parallax, NO marquees, NO ticker, NO autoplay video above the fold.
- **Performance budget:** LCP <1.2s on Fast 3G. CLS 0. Total initial weight <600KB including font subsets + waveform SVG + portrait AVIF.
- **Reduced motion:** waveform freezes mid-arc, CTA hover becomes color-only, all reveals become instant. Full `prefers-reduced-motion` compliance.

## Hard Nos (auto-revert triggers)

- Indigo, violet, or any blue-to-purple gradient
- Centered text-only hero
- Three-column features-with-icons grid
- "Trusted by X" or "Backed by Y" rows
- Glassmorphism, neumorphism, blurred-backdrop cards
- Stock iconography (Heroicons, Lucide) used as decoration in the hero
- Snowflake, database, or generic "tech" icon in the hero
- A second CTA button of equal visual weight to "I'm ready."
- Pure `#FFFFFF` background (use bone)
- Pure `#000000` text (use warm charcoal)

## Knowledge Graph

→ Governance: PA·co EO-016 (No Default Stack Aesthetics)
→ Skill: `frontend-design` (anti-AI-slop code generation)
→ Source: Creative Debate 2026-04-17 (Pixel + Lens + Compass + Echo + Atlas) + Visual Reference Audit (Anthropic, Posthog, Linear, Cursor, Stripe)
→ Implementation: `src/components/brand/` (logo, breathing-waveform), `src/app/page.tsx`, `src/app/globals.css`, `src/app/layout.tsx`

## Status

- v0.1.0 (2026-04-17): shipped with generic indigo-template UI. CEO rejected.
- v0.2.0 (in progress): full redesign per this brief.
