# 04_StatusActionGroup.md

# StatusActionGroup Specification

Version: 1.0

Status: Locked

---

# Purpose

StatusActionGroup is the primary action component used inside TaskRow.

It allows the user to mark a task for the selected date as:

- Reward
- Punishment
- Null, by pressing the currently selected action again

The component must make daily marking fast, obvious, and pleasant.

---

# Priority

Priority:
10/10

Usage Frequency:
10/10

Visual Importance:
Very high

StatusActionGroup is one of the main interaction points of the whole application.

---

# Usage

Used in:

- TaskRow

Not used in:

- ArchivedTaskRow

---

# Component Structure

StatusActionGroup

    RewardButton

    PunishmentButton

There is no separate Null button in MVP.

---

# Layout

Buttons are placed horizontally.

Reference:

[ Reward ] [ Punishment ]

Example:

[ cookie ] [ whip ]

Rules:

- horizontal layout only
- no text labels inside buttons
- icons only
- compact but easy to tap

---

# Button Size

Target size:

44-48px

Recommended:

- iPhone 15: 48 x 48px
- compact screens: minimum 44 x 44px

Do not make the touch target smaller than 44px.

---

# Icons

Icons come from the active icon pack.

Supported icon packs:

- Cookie & Whip
- Carrot & Stick

StatusActionGroup must not depend on hardcoded emoji.

---

# State Logic

## Reward button

Null -> Reward

Punishment -> Reward

Reward -> Null

## Punishment button

Null -> Punishment

Reward -> Punishment

Punishment -> Null

---

# Visual States

## Null State

Reward button:

Neutral

Punishment button:

Neutral

Parent TaskRow:

Default border

No glow

No color flash

---

## Reward Active

Reward button:

- active green state
- green glow
- icon visually emphasized

Punishment button:

- neutral

Parent TaskRow:

- subtle green border

---

## Punishment Active

Punishment button:

- active coral state
- coral glow
- icon visually emphasized

Reward button:

- neutral

Parent TaskRow:

- subtle coral border

---

# Animation

## Press Animation

On press:

- scale to approximately 0.96-0.98
- duration: 120-180ms
- smooth easing

## State Change Animation

On successful state change:

- button glow transition
- icon scale + fade
- parent TaskRow subtle color flash

Reward:

- subtle green flash

Punishment:

- subtle coral flash

Null:

- fade back to neutral

Avoid:

- aggressive bounce
- confetti
- long animations
- distracting motion

---

# Haptic Feedback

Haptic feedback is allowed as progressive enhancement.

Recommended implementation:

Use browser vibration only if available.

Example behavior:

- Reward press: short vibration
- Punishment press: short vibration
- Null clear: optional shorter vibration

Rules:

- haptic feedback must be optional
- never rely on vibration as the only feedback
- visual feedback must always work
- do not break browsers that do not support vibration
- disable or avoid strong haptics when reduced motion / reduced interaction is requested

Implementation idea:

```ts
if ("vibrate" in navigator) {
  navigator.vibrate(10);
}
```

Important:

Browser haptic/vibration support is not guaranteed, especially on iOS Safari. Treat it as a nice bonus, not core UX.

---

# API Behavior

Use optimistic update.

On click:

1. Immediately update UI.
2. Send API request.
3. If success: keep new state.
4. If failure:
   - rollback to previous state
   - show quiet toast

Do not wait for API response before showing feedback.

---

# Request Locking

After a press, block repeated clicks for the same task until:

max(300ms, API response time)

Meaning:

- the user should not accidentally send many rapid requests
- the UI should still feel instant
- other task rows may remain interactive

---

# Error Handling

If API request fails:

- rollback selected state
- show subtle toast
- do not open modal
- do not show blocking alert

Toast examples:

Russian:

Не удалось сохранить отметку

English:

Could not save mark

---

# Accessibility

Icon-only buttons should have accessible labels.

Examples:

Reward button:

- Mark as reward
- Remove reward mark, if already selected

Punishment button:

- Mark as punishment
- Remove punishment mark, if already selected

State must not rely only on color.

The active state should be represented by:

- color
- glow/border
- icon emphasis
- aria-pressed

Recommended attributes:

```tsx
<button aria-label="Mark as reward" aria-pressed={value === "reward"} />
```

---

# Forbidden Features

Do not add:

- text labels inside buttons
- third Null button
- confirmation dialogs
- menus
- dropdowns
- long press actions
- swipe behavior inside this component

Swipe gestures are a future TaskRow-level feature, not StatusActionGroup MVP behavior.

---

# Post MVP Features

Possible future additions:

## Swipe Integration

TaskRow may support:

- swipe right -> Reward
- swipe left -> Punishment

StatusActionGroup should remain the explicit visible fallback.

## Stronger Haptics

If packaged as a native/PWA-like app in future, stronger platform-native haptics may be considered.

## Custom Action Icons

If tasks support custom icon themes later, StatusActionGroup may support additional visual skins.

---

# Design Intent

StatusActionGroup should feel like the fastest possible answer to the daily question:

Did this task deserve a reward or a punishment today?

The component must be:

- fast
- tactile
- clear
- calm
- visually lightweight

It should support the 10-15 second daily usage scenario.
