# 21_CodexRules.md

# Codex Rules Specification

Version: 1.0

Status: Locked

---

# Purpose

This document defines how AI coding assistants (Codex, Claude Code, Cursor, Windsurf, etc.) must work with the project.

This document does not describe the UI.

It describes how design decisions must be made.

The purpose is to preserve consistency while the application evolves.

---

# Core Principle

When in doubt,

prefer consistency over creativity.

---

# Design Authority

The UI Bible is the source of truth.

The AI assistant must treat the UI Bible as authoritative.

If a conflict exists between:

* UI Bible
* Design Tokens
* Motion System
* Accessibility Rules
* AI-generated ideas

the UI Bible always wins.

---

# Forbidden Behavior

The AI assistant must not:

* redesign screens
* invent visual systems
* change navigation
* introduce new design languages
* introduce new interaction paradigms
* modify component hierarchy

without explicit user approval.

---

# Allowed Behavior

The AI assistant may:

* implement existing specifications
* fix bugs
* improve code quality
* refactor internals
* improve performance
* improve accessibility
* improve maintainability

as long as the visible behavior remains unchanged.

---

# Design Changes Require Approval

If the AI believes a design decision is weak or could be improved:

Allowed:

* leave a comment
* propose an alternative
* explain tradeoffs

Forbidden:

* silently changing the design
* replacing existing UI patterns
* introducing personal preferences

---

# Component Reuse First

Before creating a new component:

Check whether an existing component can be reused.

Preferred order:

1. Reuse existing component
2. Extend existing component
3. Compose existing components
4. Create new component

Creating a new component is the last option.

---

# Existing Component Priority

Always evaluate:

* TaskCard
* TaskGroup
* HeroStats
* StatsSummary
* BottomNavigation
* BottomSheet
* Toast

before introducing anything new.

---

# New Entity Rule

When a new entity appears:

Examples:

* Achievements
* Challenges
* Projects
* Streaks
* Badges

The AI must first search for an existing analogy.

Example:

Achievements

↓

TaskCard

Challenges

↓

TaskGroup

Projects

↓

TaskCard

---

# Missing Specification Rule

If a specification does not exist:

Do not invent.

Instead:

1. Search for the closest existing pattern.
2. Reuse that pattern.
3. If ambiguity remains, stop and request clarification.

---

# No Independent Product Decisions

The AI is not a product owner.

The AI must not independently decide:

* feature priorities
* screen structure
* navigation changes
* onboarding flow changes
* gamification systems
* monetization features

These decisions belong to the user.

---

# Design Tokens Are Mandatory

All UI must use:

20_DesignTokens.md

Do not introduce:

* new spacing scales
* new radius values
* new shadows
* new typography systems
* new elevation systems

---

# No Magic Numbers

Forbidden:

padding: 13px

border-radius: 19px

gap: 27px

margin-top: 11px

unless explicitly defined in Design Tokens.

---

# Color Restrictions

Only approved color families may be used.

Approved:

* Accent Green
* Coral
* Neutral
* Background
* Surface
* Text Colors

Forbidden:

* new accent colors
* random brand colors
* gradients used as accents
* neon colors

without approval.

---

# Motion Restrictions

All motion must derive from:

18_MotionSystem.md

Do not introduce:

* bounce
* confetti
* parallax
* spin effects
* floating animations
* attention-seeking loops

without approval.

---

# Accessibility Rules Are Mandatory

All new UI must comply with:

19_Accessibility.md

Requirements include:

* visible focus states
* keyboard navigation
* accessible labels
* minimum touch targets
* readable contrast

---

# Navigation Rules

BottomNavigation is a core application pattern.

The AI must not:

* remove it
* relocate it
* replace it

without approval.

---

# Mobile-First Rule

The project is mobile-first.

Reference devices:

* iPhone 15
* iPhone 13 mini

Desktop uses the mobile shell.

The AI must not redesign screens specifically for desktop.

---

# MVP Protection Rule

The AI must protect MVP simplicity.

When multiple solutions exist:

Choose the simpler solution.

Do not add:

* advanced configuration
* optional complexity
* hidden power-user systems

unless explicitly requested.

---

# Comment Instead of Changing

If a better solution exists:

Do this:

```text
Suggestion:
This could be improved by ...
```

Do not implement the change automatically.

---

# Consistency Hierarchy

When choosing between:

Option A:
More creative

Option B:
More consistent

Choose:

Option B

---

# Engineering Principle

Simple first.

Consistent second.

Beautiful third.

---

# Design Principle

The application should feel:

* calm
* warm
* focused
* predictable

not:

* flashy
* experimental
* highly gamified
* visually noisy

---

# Final Rule

If uncertainty exists:

Stop.

Reuse the closest existing pattern.

Ask for clarification.

Do not invent new design behavior.
