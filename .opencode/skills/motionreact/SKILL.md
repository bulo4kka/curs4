---
name: motionreact
description: Motion for React (Framer Motion) standards — performant, purposeful animations. Micro-interactions, entrance/exit, layout animations, scroll-driven. Use when adding motion to React components.
version: 1.0.0
user-invocable: true
argument-hint: "[enter|exit|layout|scroll|gesture|orchestrate] [target]"
license: MIT
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Motion React Skill — Framer Motion / Motion for React Standards

## Purpose
Consistent, performant, meaningful motion in React apps. No gratuitous animation — every transition serves UX.

---

## Imports (v11+ / motion/react)

```tsx
import {
  motion,
  AnimatePresence,
  useAnimation,
  useMotionValue,
  useTransform,
  useScroll,
  useSpring,
  useInView,
  stagger,
  // Layout animations
  LayoutGroup,
  MotionConfig,
  // Primitives
  html,
  svg,
} from "motion/react";

// Dom components: motion.div, motion.button, motion.section, etc.
```

> **Never** import from `framer-motion` — use `motion/react` (the current package since v11).

---

## Core Principles

### 1. Purpose Over Polish
- **Entrance** — orient user, show causality (stagger lists, reveal on scroll)
- **Exit** — confirm removal, preserve layout (`AnimatePresence` + `exit`)
- **Layout** — `layout` prop for FLIP animations (reorder, resize, drag)
- **Gesture** — press, hover, drag — immediate feedback (<100ms)
- **Scroll** — progress reveal, parallax, sticky — `useScroll` + `useTransform`

### 2. Performance First
- **Transform-only** — animate `x`, `y`, `scale`, `rotate`, `opacity` (GPU)
- **Avoid** layout triggers: `width`, `height`, `top`, `left`, `margin`, `padding`
- **`will-change`** via `style={{ willChange: "transform, opacity" }}` on heavy elements
- **Reduce motion** — respect `prefers-reduced-motion`:
  ```tsx
  <MotionConfig reducedMotion="user">  // or { initial: false, animate: false }
  ```

### 3. Timing & Easing Standards
| Purpose | Duration | Easing |
|---------|----------|--------|
| Micro (hover, press) | 80–120ms | `easeOut` / `[0.2, 0.8, 0.2, 1]` |
| Entrance (fade/slide) | 200–350ms | `[0.16, 1, 0.3, 1]` (material) / `easeOut` |
| Layout FLIP | 250–400ms | `[0.33, 1, 0.68, 1]` (expo-out) |
| Complex orchestration | 400–600ms | custom cubic-bezier |
| **Never** | >600ms | — |

### 4. Stagger & Orchestration
```tsx
// Container
<motion.ul variants={{ open: { transition: { staggerChildren: 0.06 } }}}
// Children
<motion.li variants={{ open: { opacity: 1, y: 0 }, closed: { opacity: 0, y: 16 } }} />
```

---

## Patterns

### Entrance (Reveal)
```tsx
<motion.section
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, margin: "-100px" }}
  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
/>
```

### Exit (AnimatePresence)
```tsx
<AnimatePresence mode="wait">
  {items.map(item => (
    <motion.div
      key={item.id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.15 } }}
    />
  ))}
</AnimatePresence>
```

### Layout Animation (FLIP)
```tsx
<LayoutGroup>
  <motion.div layout>  // reorders, resizes animate automatically
</LayoutGroup>

// Shared layout (route transitions, modals)
<motion.div layoutId="shared-element" />
```

### Gesture Feedback
```tsx
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
  // or for drag
  drag
  dragConstraints={{ left: 0, right: 300 }}
  dragElastic={0.2}
/>
```

### Scroll-Driven
```tsx
const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
const y = useTransform(scrollYProgress, [0, 1], ["100%", "-100%"]);
const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

<motion.div style={{ y, opacity }} />
```

### Spring (Natural Feel)
```tsx
const x = useMotionValue(0);
const springy = useSpring(x, { stiffness: 300, damping: 30, mass: 0.8 });
<motion.div style={{ x: springy }} />
```

---

## Commands

| Command | Description |
|---------|-------------|
| `motionreact enter [target]` | Add entrance animations (stagger, scroll reveal) |
| `motionreact exit [target]` | Add exit animations with `AnimatePresence` |
| `motionreact layout [target]` | Add `layout` / `layoutId` FLIP animations |
| `motionreact scroll [target]` | Add scroll-driven animations (`useScroll` + `useTransform`) |
| `motionreact gesture [target]` | Add hover/tap/drag micro-interactions |
| `motionreact orchestrate [target]` | Complex multi-element sequences with `variants` + `stagger` |
| `motionreact audit [target]` | Check for layout thrashing, missing reduced-motion, over-animation |

---

## Anti-Patterns (Auto-Flag)

| Pattern | Problem | Fix |
|---------|---------|-----|
| `animate={{ width: "100%" }}` | Layout thrash | Animate `scaleX` or use `layout` |
| `transition={{ duration: 2 }}` | Too slow | ≤600ms, prefer spring |
| No `AnimatePresence` on conditional | Jarring removal | Wrap in `AnimatePresence mode="wait"` |
| `whileHover={{ boxShadow: "..." }}` | Paint thrash | Use `filter: drop-shadow()` or scale |
| No `prefers-reduced-motion` | Accessibility fail | `<MotionConfig reducedMotion="user">` |
| Stagger on 50+ items | Jank | Limit, virtualize, or `stagger(0.03, { max: 0.5 })` |
| `animate` on every render | Infinite loop | Use `useAnimation` controls or `whileInView` |

---

## References (create as needed)
- `reference/enter.md` — entrance patterns, `whileInView`, stagger
- `reference/exit.md` — `AnimatePresence`, exit modes, layout preservation
- `reference/layout.md` — `layout`, `layoutId`, `LayoutGroup`, shared transitions
- `reference/scroll.md` — `useScroll`, `useTransform`, scroll timeline
- `reference/gesture.md` — `whileHover`, `whileTap`, `drag`, `useDragControls`
- `reference/spring.md` — `useSpring`, `useMotionValue`, natural motion
- `reference/performance.md` — GPU-only props, `will-change`, profiling
- `reference/accessibility.md` — reduced motion, `MotionConfig`, focus order
- `reference/orchestration.md` — `variants`, `stagger`, sequence control