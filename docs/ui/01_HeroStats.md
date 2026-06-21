# 01_HeroStats.md

# HeroStats Specification

Version: 1.0

Status: Locked

---

# Purpose

HeroStats is the primary summary component on the Tasks screen.

Its purpose is to provide an immediate overview of the user's reward and punishment results for the currently selected period.

HeroStats is informational only.

It does not provide navigation or actions.

---

# Priority

Priority:
10/10

Usage Frequency:
10/10

Visual Importance:
Second most important component in the application after TaskRow.

---

# Usage

Used on:

- Tasks Screen

Not used on:

- Stats Screen

Stats Screen uses a separate component:

StatsSummary

---

# Component Structure

HeroStats

    RewardPanel

        Icon
        Value
        Label

    Divider

    PunishmentPanel

        Icon
        Value
        Label

---

# Layout

HeroStats is rendered as one unified card.

Do not implement as two independent cards.

Reference layout:

┌─────────────────────────────┐
│                             │
│   🍪 12     │     🪢 3       │
│  Cookies    │    Whips      │
│                             │
└─────────────────────────────┘

---

# Content

Reward side:

- Reward icon
- Reward value
- Reward label

Punishment side:

- Punishment icon
- Punishment value
- Punishment label

---

# Labels

Labels must be localized.

Examples:

Russian:

- Пряники
- Кнуты

English:

- Cookies
- Whips

Do not hardcode labels.

Use i18n.

---

# Numbers

HeroStats uses compact formatting.

Examples:

10      -> 10
100     -> 100
1000    -> 1.0K
5670    -> 5.67K
11100   -> 11.1K
123456  -> 123K
1234567 -> 1.23M

Formatting must respect locale.

---

# Period Display

HeroStats does not display the selected period.

The selected period is shown only by PeriodTabs.

Avoid duplicate period information.

---

# Interactions

HeroStats is NOT clickable.

No navigation.

No actions.

No menus.

No gestures.

No tooltips required.

---

# Colors

Reward:

- Primary Green

Punishment:

- Soft Coral

The exact values come from design tokens.

---

# Icon Pack Support

HeroStats must support all icon packs.

Current packs:

- Cookie & Whip
- Carrot & Stick

HeroStats must never depend on a specific icon asset.

---

# Decorative Elements

Decorative elements are allowed.

Examples:

- leaves
- organic shapes
- soft illustrations

Requirements:

- very low visual weight
- opacity approximately 10-15%
- never reduce readability
- must remain optional

---

# Animation

When values change:

Use:

- scale animation
- fade animation

Do NOT use:

- count-up animation
- slot machine animation
- bouncing numbers

Goal:

The update should feel smooth and premium.

---

# Adaptive Behavior

Must fit:

- iPhone 15
- iPhone 13 mini

Requirements:

- numbers never wrap
- labels remain readable
- icons remain visible
- no horizontal scrolling

If space becomes limited:

1. Reduce decorative elements
2. Reduce spacing
3. Reduce icon size

Do not reduce readability of values.

---

# Accessibility

Reward and Punishment must not be differentiated only by color.

Always show:

- icon
- value
- label

Screen readers should be able to read:

Reward count: X

Punishment count: Y

---

# Forbidden Features

Do not add:

- charts
- graphs
- comparison arrows
- period comparison
- navigation
- buttons
- settings

Examples of forbidden content:

↑ +3

↓ -2

Weekly trend

Monthly trend

These belong to StatsSummary and Stats Screen.

---

# Future Extensions

Allowed in future:

- richer illustrations
- animated decorative elements
- optional period comparison

Not part of MVP.

---

# Design Intent

HeroStats should communicate:

"How am I doing during this period?"

within less than one second after opening the Tasks screen.

The user should immediately understand:

- how many rewards were earned
- how many punishments were received

without opening any additional screen.
