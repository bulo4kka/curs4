---
name: taste
description: Design judgment & anti-AI slop. Enforces clean, intentional UI — no generic cards, pointless gradients, decorative noise. Typography-first hierarchy, contextual modes (Persuade/Operate/Read), modern CSS, mobile-first. Use when interfaces feel "AI-generated", bloated, or visually undisciplined.
version: 1.0.0
user-invocable: true
argument-hint: "[persuade|operate|read] [target]"
license: MIT
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Taste Skill — Design Judgment & Anti-AI Slop

## Purpose
Stop generic, bloated, "AI-looking" interfaces. Enforce deliberate, clean visual decisions with typography as the backbone.

---

## Core Principles

### 1. Zero Visual Clutter
- **No** generic icon-card grids (the "3 columns + icon + h3 + p" pattern)
- **No** decorative gradients unless they serve brand/meaning (avoid default blue→purple)
- **No** ornamental lines, dots, blobs, "noise" backgrounds
- **No** shadow stacks trying to create depth — use spacing/typography instead

### 2. Typography as Foundation
- **Hierarchy:** Clear scale — `text-sm`/`base`/`lg`/`xl`/`2xl`/`3xl`/`4xl` with purpose
- **Weights:** `font-medium` (500) for emphasis, `font-semibold` (600) for headlines — avoid `font-bold` (700) as default
- **Line height:** `leading-tight` (1.25) for headlines, `leading-relaxed` (1.625) for body
- **Color:** Never pure `#000` — use `zinc-900` / `slate-900` for text; backgrounds in warm/cool neutrals (`zinc-50`, `slate-50`, `stone-50`)
- **Measure:** Prose width `max-w-prose` (65ch) for reading surfaces

### 3. Contextual Modes
Choose **one** mode per surface — never mix.

| Mode | Use For | Density | Whitespace | Typography | Motion |
|------|---------|---------|------------|------------|--------|
| **Persuade** | Landing, marketing, pricing | Low | Generous, cinematic | Expressive, large, editorial | Meaningful, narrative |
| **Operate** | Dashboards, SaaS, tools, admin | High | Functional, tight | Compact, scannable, data-first | Functional, instant feedback |
| **Read** | Docs, blogs, articles, help | Medium | Comfortable, rhythmic | Prose-optimized, calm | Minimal, scroll-driven |

### 4. Code & Layout Quality
- Modern CSS: Grid, Flexbox, `gap`, `container queries`, `:has()`, logical properties
- Mobile-first breakpoints (`sm`/`md`/`lg`/`xl`) — no fixed pixel breakpoints
- No magic numbers — use spacing scale (`space-y-4`, `gap-6`, `p-8`)
- Fluid type with `clamp()` where appropriate
- Semantic HTML — no `<div>` soup

---

## Commands

| Command | Description |
|---------|-------------|
| `taste persuade [target]` | Apply Persuade mode to landing/marketing surface |
| `taste operate [target]` | Apply Operate mode to app/dashboard surface |
| `taste read [target]` | Apply Read mode to content surface |
| `taste audit [target]` | Score a surface against Taste principles (0–100) |
| `taste clean [target]` | Remove slop patterns (icon cards, fake gradients, noise) |

---

## Anti-Patterns (Auto-Flag)

| Pattern | Violation | Fix |
|---------|-----------|-----|
| 3-col icon cards | Generic, content-less | Replace with meaningful layout |
| `bg-gradient-to-r from-blue-500 to-purple-600` | Default AI gradient | Use brand gradient or solid |
| `shadow-xl` on everything | Fake depth | Use spacing/border/typography |
| `text-black` / `#000` | Harsh, unnatural | `text-zinc-900` |
| `font-bold` everywhere | No hierarchy | `font-medium`/`semibold` only where needed |
| `p-4`/`m-4` everywhere | No rhythm | Spacing scale + `gap` |
| `animate-pulse`/`bounce` on load | Cheap "alive" feel | Purposeful motion only |

---

## Workflow

1. **Identify mode** — Persuade / Operate / Read
2. **Run `taste audit`** — get baseline score
3. **Run `taste clean`** — strip slop patterns
4. **Apply mode reference** — follow mode-specific guidance
5. **Verify** — re-audit, target ≥90

---

## References (create as needed)
- `reference/persuade.md` — landing/marketing playbook
- `reference/operate.md` — dashboard/app playbook
- `reference/read.md` — content/docs playbook
- `reference/typography.md` — type scale, weights, measures
- `reference/color.md` — neutral palettes, semantic color
- `reference/spacing.md` — rhythm, scale, container queries
- `reference/audit.md` — scoring rubric