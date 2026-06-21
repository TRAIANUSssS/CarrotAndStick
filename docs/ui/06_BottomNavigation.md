# 06_BottomNavigation.md

# BottomNavigation Specification

Version: 1.0

Status: Locked

---

# Purpose

BottomNavigation is the primary navigation component of the application.

It provides access to the three main screens:

- Tasks
- Stats
- Account

The component must feel mobile-native, lightweight, and always available.

---

# Priority

Priority:
8/10

Usage Frequency:
10/10

Visual Importance:
High

BottomNavigation is not the main product interaction, but it defines the application's navigation model.

---

# Usage

Used on all authenticated main application screens:

- Tasks
- Stats
- Account
- Archive, if it remains inside the authenticated app shell

Not used on:

- Login
- Register
- Forgot Password

---

# Navigation Items

The navigation contains exactly three items:

1. Tasks
2. Stats
3. Account

Russian:

- Задачи
- Статистика
- Аккаунт

English:

- Tasks
- Stats
- Account

---

# Labels

BottomNavigation uses icons only in the visible UI.

Text labels are not shown visually in MVP.

Accessible labels are still required for screen readers.

---

# Icons

Use the existing icon set:

- Tasks: checkbox / task icon
- Stats: statistics / chart icon
- Account: user icon

Icon style should remain consistent:

- same visual weight
- same fill/stroke approach
- same optical size

Icons must be recolorable through CSS or SVG props.

---

# Layout Type

BottomNavigation uses a floating mobile tab bar style.

It is not attached as a hard rectangular footer.

Reference:

screen content

    floating rounded tab bar

bottom safe area

---

# Position

BottomNavigation is always visible.

It is fixed to the bottom of the mobile shell.

It does not hide on scroll.

It remains visible on empty states.

---

# Safe Area

BottomNavigation must respect mobile safe areas.

It must not overlap the iPhone home indicator.

Recommended CSS approach:

```css
bottom: max(12px, env(safe-area-inset-bottom));
padding-bottom: env(safe-area-inset-bottom);
```

The exact implementation may vary, but safe area support is mandatory.

---

# Visual Style

Background:

- warm white
- optional subtle blur
- translucent effect is allowed

Preferred initial style:

- warm white + subtle blur

Fallback:

- solid warm white

Rules:

- blur must remain subtle
- do not create heavy glassmorphism
- do not make the tab bar visually noisy
- if blur looks bad in implementation, use solid warm white

---

# Shape

The component should feel like a soft floating pill/card.

Recommended:

- rounded corners
- soft border
- subtle shadow
- horizontal padding
- height suitable for thumb usage

Approximate values:

- height: 64-76px, excluding safe area
- radius: 22-28px
- horizontal margin: 12-16px
- internal padding: 8-12px

---

# Active Item

Active item style:

- green icon
- soft green pill background
- subtle emphasis
- optional very slight scale

Inactive item style:

- warm gray / muted brown icon
- no pill background
- no strong visual emphasis

The active item should be obvious without requiring labels.

---

# Active Pill

Use a pill-shaped background behind the active icon.

Rules:

- pill must be subtle
- green tint, not solid primary green
- should not make navigation look heavy
- should not make icons feel like large buttons

If the pill makes the UI visually crowded on iPhone 13 mini, reduce its opacity or padding before removing it.

---

# Interaction

Tap navigation item:

- navigate to corresponding screen
- update active state
- trigger screen transition

Long press:

No action in MVP.

Double tap:

No action in MVP.

---

# Screen Transition

Screen transitions between tabs should use:

- slide
- fade

Recommended duration:

200-250ms

Rules:

- transition should feel calm and iOS-like
- no aggressive bounce
- no long animation
- no page flip effects

---

# Animation

## Item Press

On tap:

- subtle scale down
- quick return to normal

Recommended:

- scale: 0.96-0.98
- duration: 120-180ms

## Active Change

When active tab changes:

- active pill moves/fades smoothly
- icon color transitions smoothly

Recommended:

- duration: 180-220ms

---

# Accessibility

Even though visual labels are hidden, each item must have an accessible label.

Examples:

```tsx
<button aria-label="Tasks" aria-current={active ? "page" : undefined} />
```

Russian labels should be used when app language is Russian.

The active item should expose current page state.

---

# Empty States

BottomNavigation remains visible on empty states.

Do not hide navigation when:

- no tasks exist
- no stats exist
- archive is empty

---

# Desktop Behavior

Desktop does not use sidebar navigation in MVP.

BottomNavigation remains at the bottom of the centered mobile shell.

Do not convert it into:

- sidebar
- top navigation
- desktop menu

---

# Forbidden Features

Do not add:

- visible text labels in MVP
- more than three navigation items
- sidebar navigation
- hidden-on-scroll behavior
- floating action button inside BottomNavigation
- badges/counters
- notification dots
- complex gestures

---

# Post MVP Features

Possible future additions:

## Labels Toggle

If icon-only navigation proves unclear, visible labels may be added later.

## Badges

Small badges could be added later for notifications or reminders.

Not part of MVP.

## Native Haptics

If app becomes PWA/native-like, tab changes may use light haptic feedback.

Not required for MVP.

---

# Design Intent

BottomNavigation should feel like a native mobile tab bar adapted to the warm Carrot & Stick style.

It should be:

- always available
- visually light
- easy to tap
- calm
- consistent across all authenticated screens

The user should never wonder how to move between Tasks, Stats and Account.
