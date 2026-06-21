# Frontend Design Guide

Status: Draft

This document explains how to work with the UI Bible in `docs/ui`.

It is not a component specification. Component and screen details live in the UI Bible files.

## Purpose

The UI Bible is the source of truth for the frontend interface.

Use this file as the entry point before changing any UI code. It defines:

- how to read the UI Bible;
- which files are authoritative;
- what is allowed during implementation;
- what has already been decided for the UI migration;
- the planned order of work.

## Source Of Truth

The authoritative UI files are in `docs/ui`.

Read them in this order:

1. `21_CodexRules.md` - rules for AI and human implementation decisions.
2. `20_DesignTokens.md` - visual foundation: colors, typography, spacing, radius, shadows, dimensions.
3. `18_MotionSystem.md` - allowed motion and animation behavior.
4. `19_Accessibility.md` - accessibility requirements.
5. Screen and component specs:
   - `01_HeroStats.md`
   - `02_TaskRow.md`
   - `03_TaskHistory.md`
   - `04_StatusActionGroup.md`
   - `05_TaskGroup.md`
   - `06_BottomNavigation.md`
   - `07_TasksScreen.md`
   - `08_StatsSummary.md`
   - `09_StatsHeatmap.md`
   - `10_TopTasks.md`
   - `11_StatsScreen.md`
   - `12_TaskModal.md`
   - `13_AccountScreen.md`
   - `14_ArchiveScreen.md`
   - `15_LoginScreen.md`
   - `16_RegisterScreen.md`
   - `17_Modals.md`

If documents conflict, follow `21_CodexRules.md`. If a visual value conflicts with `20_DesignTokens.md`, follow `20_DesignTokens.md`.

## Migration Scope

All screens must follow the new UI Bible:

- Tasks
- Stats
- Account
- Archive
- Task modal
- Login
- Register
- Modals and bottom sheets
- Navigation
- Settings flows: language, icons, password, logout

The current icon packs remain part of the product:

- `cookie_whip`
- `carrot_stick`

Do not replace these icons unless a future task explicitly requests it.

## Component Structure Rule

The main goal of the current UI migration is visual and behavioral compliance with the UI Bible.

Component extraction is allowed when it helps implement the UI Bible without changing user-facing behavior.

Prefer extracting components that:

- are explicitly defined in the UI Bible;
- are used more than once;
- are expected to be reused soon;
- reduce duplication without changing screen behavior.

Priority components:

- `HeroStats`
- `TaskRow` / `TaskCard`
- `TaskGroup`
- `StatusActionGroup`
- `TaskHistory`
- `BottomNavigation`
- `StatsSummary`
- shared modal / bottom sheet primitives

Do not perform large refactors only to make the structure look perfect. Refactor when it directly supports the current migration.

## Hierarchy Rule

Technical refactoring is allowed if it does not change:

- visible behavior;
- block order;
- intended screen hierarchy from the UI Bible;
- critical DOM semantics;
- user experience.

The phrase "do not modify component hierarchy" means:

- do not change the product or visual hierarchy defined by the UI Bible;
- do not move major blocks such as `HeroStats`, period controls, task groups, modals, or `BottomNavigation` unless the UI Bible requires it;
- do not replace existing patterns with new visual or interaction patterns without approval.

It is acceptable to move local JSX into separate files if the resulting UI and UX stay the same.

## Implementation Rules

Before implementing UI changes:

1. Read the relevant UI Bible files.
2. Check whether an existing component already matches the needed pattern.
3. Reuse first, extend second, compose third, create new components last.
4. Use only tokens from `20_DesignTokens.md`.
5. Use motion only from `18_MotionSystem.md`.
6. Validate accessibility against `19_Accessibility.md`.
7. Preserve MVP simplicity.

Do not introduce:

- new colors;
- new spacing values;
- new radius values;
- new shadows;
- new typography systems;
- new navigation patterns;
- new product behavior;
- decorative gradients or visual effects outside the UI Bible.

## Current Assessment

The current frontend is not a full rewrite candidate.

The React structure already contains many required concepts:

- mobile app shell;
- bottom navigation;
- task cards;
- pinned and regular task groups;
- stats screen;
- account screen;
- archive screen;
- auth screens;
- modals.

The main mismatch is visual system drift:

- old beige/brown palette;
- gradients used as accents;
- font family outside tokens;
- inconsistent spacing;
- inconsistent radii;
- oversized shadows;
- page-local UI components that should become reusable when practical.

Expected difficulty: medium.

Most work should be CSS/token alignment and targeted component extraction, not backend or product logic changes.

## Planned Work

### Phase 1: Documentation Alignment

- Replace the old `docs/fronent_design.md` content with this UI Bible guide.
- Keep implementation decisions explicit.
- Use this file as the entry point for future UI work.

### Phase 2: UI Bible Audit

- Read all files in `docs/ui`.
- Map each UI Bible component to current frontend code.
- Identify missing, partial, and conflicting implementations.
- Produce a short migration checklist before code changes.

Output:

- `docs/ui_migration_audit.md`

### Phase 3: Token Foundation

- Replace current CSS variables with UI Bible tokens.
- Remove old visual system values.
- Align app background, surfaces, text colors, borders, radius, shadows, buttons, inputs, and navigation.
- Keep behavior unchanged.

### Phase 4: Core Components

- Align or extract the highest-priority reusable components:
  - `BottomNavigation`
  - `HeroStats`
  - `TaskCard` / `TaskRow`
  - `TaskHistory`
  - `StatusActionGroup`
  - `TaskGroup`

Extraction should happen only where it reduces duplication or makes UI Bible compliance easier.

### Phase 5: Main Screens

- Bring Tasks screen into UI Bible compliance.
- Bring Stats screen into UI Bible compliance.
- Bring Account screen into UI Bible compliance.
- Bring Archive screen into UI Bible compliance.

Preserve screen purpose, navigation, and product behavior.

### Phase 6: Auth And Modal Surfaces

- Bring Login and Register screens into UI Bible compliance.
- Align Task modal and shared modal behavior.
- Align bottom sheet/modal surfaces with tokens and accessibility rules.

### Phase 7: Verification

- Run frontend checks.
- Manually verify mobile-first layouts.
- Check iPhone 15 and iPhone 13 mini sized viewports.
- Check desktop mobile shell behavior.
- Check keyboard navigation, focus states, labels, and touch target sizes.

## Open Questions

No blocking questions are currently open.

Previously clarified decisions:

- All screens must follow the new UI.
- Component structure should move toward UI Bible components, but without unnecessary refactoring.
- Existing icon packs stay.
- Technical component extraction is allowed if it does not change visible behavior or the UI Bible hierarchy.
