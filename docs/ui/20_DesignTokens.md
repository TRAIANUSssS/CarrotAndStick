# 20_DesignTokens.md

# Design Tokens Specification

Version: 1.0

Status: Locked

---

# Purpose

This document defines the visual foundation of the application.

All screens, components and future features must use these tokens.

The goal is:

* visual consistency
* predictable implementation
* easier maintenance
* reliable AI-assisted development

This document is the single source of truth for:

* colors
* typography
* spacing
* radius
* shadows
* elevation
* component dimensions

---

# Design Philosophy

Visual Style:

```text
Apple
Things 3
Calm Productivity
```

The application should feel:

* warm
* clean
* premium
* lightweight
* focused

Avoid:

* Material Design appearance
* enterprise dashboards
* glassmorphism
* cyberpunk aesthetics
* dark heavy interfaces

---

# Color System

## Background

Application Background

```css
--color-background: #F8F5EF;
```

Purpose:

* main page background
* screen background
* scroll areas

---

## Surface

Primary Surface

```css
--color-surface: #FFFFFF;
```

Purpose:

* TaskCard
* HeroStats
* Bottom Sheets
* Inputs
* Popovers

---

## Accent Green

Primary Positive Color

```css
--color-accent: #5FA36A;
```

Purpose:

* Reward state
* Primary buttons
* Success indicators
* Positive statistics

Style:

Soft Green

Avoid bright neon greens.

---

## Coral

Primary Negative Color

```css
--color-coral: #E5826D;
```

Purpose:

* Punishment state
* Logout action
* Negative statistics
* Archive action

Style:

Soft Coral

Avoid aggressive red.

---

## Border

```css
--color-border: #E8E3DA;
```

Purpose:

* cards
* inputs
* separators
* grouped blocks

---

# Text Colors

## Primary

```css
--color-text-primary: #1F1F1F;
```

Used for:

* titles
* task names
* important values

---

## Secondary

```css
--color-text-secondary: #6B6B6B;
```

Used for:

* descriptions
* metadata
* helper text

---

## Tertiary

```css
--color-text-tertiary: #9A9A9A;
```

Used for:

* hints
* muted labels
* inactive content

---

## Disabled

```css
--color-text-disabled: #BDBDBD;
```

Used for:

* disabled actions
* unavailable states

---

# Status Colors

## Reward

```css
--color-reward: #5FA36A;
```

---

## Punishment

```css
--color-punishment: #E5826D;
```

---

## Neutral

```css
--color-neutral: #D9D9D9;
```

Used for:

* empty history circles
* inactive states

---

# Typography

## Primary Font

```css
font-family: Inter;
```

Fallback:

```css
Inter,
system-ui,
sans-serif
```

---

# Font Scale

## Caption

```css
12px
```

Used for:

* hints
* metadata
* archive dates

---

## Secondary Text

```css
14px
```

Used for:

* descriptions
* helper content

---

## Body

```css
16px
```

Default application text.

---

## Section Title

```css
20px
```

Used for:

* page sections
* grouped blocks

---

## Hero

```css
28px
```

Used for:

* HeroStats values
* primary statistics

---

# Font Weights

## Regular

```css
400
```

---

## Medium

```css
500
```

---

## Semibold

```css
600
```

---

## Bold

```css
700
```

---

# Spacing System

Only these spacing values should be used.

```css
4
8
12
16
24
32
48
```

---

# Recommended Usage

## XS

```css
4px
```

Icon spacing

---

## SM

```css
8px
```

Small internal spacing

---

## MD

```css
12px
```

Text groups

---

## LG

```css
16px
```

Card padding

---

## XL

```css
24px
```

Section spacing

---

## XXL

```css
32px
```

Large layout spacing

---

## XXXL

```css
48px
```

Major page separation

---

# Radius System

## Radius Small

```css
8px
```

---

## Radius Medium

```css
12px
```

---

## Radius Large

```css
16px
```

Default application radius.

Used for:

* cards
* inputs
* buttons
* grouped containers

---

## Radius XL

```css
24px
```

Used for:

* large panels
* bottom sheets

---

## Radius Pill

```css
999px
```

Used for:

* pills
* chips
* rounded controls

---

# Border System

Default Border:

```css
1px solid var(--color-border)
```

Rule:

Cards and inputs use:

```text
1px border
+
very light shadow
```

Do not use:

```text
heavy shadow only
```

---

# Shadow System

## Shadow Small

Used for:

* Toast
* Popover

```css
0 2px 6px rgba(0,0,0,0.05)
```

---

## Shadow Medium

Used for:

* Cards
* Inputs

```css
0 4px 12px rgba(0,0,0,0.06)
```

---

## Shadow Large

Used for:

* Bottom Sheets
* Floating Surfaces

```css
0 8px 24px rgba(0,0,0,0.08)
```

---

# Elevation System

## Level 0

Background

No shadow.

---

## Level 1

Cards

Uses:

* Shadow Medium

---

## Level 2

Modals

Uses:

* Shadow Large

---

## Level 3

Toast
Popover

Highest temporary surfaces.

---

# Component Tokens

## TaskCard

Radius:

```css
16px
```

Padding:

```css
16px
```

Background:

```css
#FFFFFF
```

Border:

```css
1px solid var(--color-border)
```

Elevation:

Level 1

---

## Button

Height:

```css
48px
```

Radius:

```css
16px
```

Horizontal Padding:

```css
16px
```

---

## Input

Height:

```css
48px
```

Radius:

```css
16px
```

Padding:

```css
16px
```

Border:

```css
1px solid var(--color-border)
```

---

## HeroStats

Radius:

```css
16px
```

Padding:

```css
24px
```

Elevation:

Level 1

---

## BottomNavigation

Height:

```css
80px
```

Radius:

```css
24px
```

Elevation:

Level 2

---

## Bottom Sheet

Top Radius:

```css
24px
```

Elevation:

Level 2

---

## History Circle

Size:

```css
12px
```

Gap:

```css
2px
```

States:

* reward
* punishment
* neutral

---

## StatusAction Button

Size:

```css
48px
```

Radius:

```css
16px
```

---

# Layout Width

Reference Device:

```text
iPhone 15
```

Must remain comfortable on:

```text
iPhone 13 mini
```

Desktop:

Use centered mobile shell.

Do not redesign layouts for desktop.

---

# Motion References

Motion values are defined in:

```text
18_MotionSystem.md
```

Design Tokens should not redefine animation timing.

---

# Accessibility References

Accessibility values are defined in:

```text
19_Accessibility.md
```

Design Tokens must remain compatible with:

* 44×44 touch targets
* WCAG-oriented contrast
* larger text sizes

---

# Forbidden Styles

Do not add:

* pure black backgrounds
* bright neon colors
* strong gradients
* glassmorphism
* oversized shadows
* multiple accent colors
* inconsistent radii
* inconsistent spacing

---

# Design Intent

The application should feel like:

```text
Apple-level calmness
+
Things 3 simplicity
+
light motivational game layer
```

A user should describe the interface as:

```text
Clean
Warm
Calm
Pleasant
Predictable
```

rather than:

```text
Flashy
Corporate
Gamified
Busy
```
