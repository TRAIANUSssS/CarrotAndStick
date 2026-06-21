# 18_MotionSystem.md

# Motion System Specification

Version: 1.0

Status: Locked

---

# Purpose

This document defines all animation, transition, motion and haptic behavior used throughout the application.

The goal of the Motion System is to make the product feel:

* calm
* responsive
* premium
* alive
* encouraging

without becoming distracting.

Motion should support understanding and feedback.

Motion should never exist purely for decoration.

---

# Motion Philosophy

The application follows:

```text
60% Productivity
40% Game
```

Visual inspiration:

* Apple
* Things 3
* Apple Music
* Apple Settings

Not inspired by:

* flashy gaming interfaces
* social media animations
* gamified reward explosions

---

# Emotional Goal

The interface should feel:

```text
Calm
Helpful
Slightly Motivating
```

The user should feel:

```text
"I am making progress."
```

not:

```text
"I am playing a game."
```

---

# Motion Level

Application Motion Level:

B+

Meaning:

* noticeably animated
* responsive
* polished

but

* never overwhelming
* never noisy

---

# Core Principles

Every animation must satisfy at least one of these goals:

1. Explain hierarchy
2. Confirm action
3. Show state change
4. Guide attention
5. Reduce perceived waiting

If an animation does not serve one of these goals:

Do not add it.

---

# Timing System

## Micro Motion

Duration:

100–150ms

Used for:

* button press
* icon state change
* checkbox change
* toggle change

Goal:

Instant feedback.

---

## Standard Motion

Duration:

180–250ms

Used for:

* modal open
* modal close
* navigation transition
* toast appearance
* list updates

Goal:

Primary interaction feedback.

---

## Large Motion

Duration:

250–350ms

Used for:

* screen changes
* accordion transitions
* larger layout updates

Goal:

Preserve spatial understanding.

---

# Easing System

## Micro Interactions

Use:

ease-out

Examples:

* button press
* icon activation
* status change

---

## Screen Transitions

Use:

ease-in-out

Examples:

* Tasks → Stats
* Stats → Account

---

## Bottom Sheets

Use:

ease-out

Examples:

* LanguageModal
* IconsModal
* PasswordModal

---

## Forbidden Easing

Avoid:

* linear
* bounce
* elastic
* spring-heavy motion

---

# Navigation Motion

Used by:

BottomNavigation

---

## Transition

Animation:

Slide + Fade

Duration:

180–250ms

Behavior:

Current screen fades/slides away.

New screen fades/slides in.

Goal:

Maintain orientation without feeling slow.

---

# Bottom Sheet Motion

Used by:

* LanguageModal
* IconsModal
* PasswordModal
* ConfirmLogoutModal
* TaskModal

---

## Open

Animation:

Slide Up

*

Backdrop Fade In

Duration:

200–280ms

---

## Close

Animation:

Slide Down

*

Backdrop Fade Out

Duration:

180–240ms

---

# HeroStats Motion

Used by:

HeroStats

StatsSummary

---

## Trigger

Period change.

Examples:

Day

↓

Week

↓

Month

---

## Animation

Scale

*

Fade

Duration:

180–250ms

Goal:

Highlight updated values.

Avoid dramatic number rolling animations.

---

# Period Selector Motion

Used by:

PeriodTabs

---

## Manual Change

Animation:

Slide + Fade

Duration:

180–220ms

---

## Automatic Rotation

Every 15 seconds.

Animation:

Slide + Fade

Same duration as manual change.

After manual interaction:

Pause automatic rotation for 30 seconds.

---

# TaskGroup Motion

Used by:

Pinned Tasks

Other Tasks

---

## Expand

Accordion animation.

Chevron rotates.

---

## Collapse

Accordion animation.

Chevron rotates back.

---

## Chevron

Rotation:

180°

Duration:

180–250ms

Goal:

Communicate open/closed state.

---

# Task Status Motion

Used by:

Reward

Punishment

Buttons

---

## Reward Selection

Animation:

Small scale

*

Green highlight

Duration:

100–150ms

---

## Punishment Selection

Animation:

Small scale

*

Coral highlight

Duration:

100–150ms

---

## Status Removal

Animation:

Highlight fades out

Duration:

100–150ms

---

# TaskRow Feedback

When status changes successfully:

Animation:

Subtle card flash

Duration:

100–150ms

Reward:

soft green flash

Punishment:

soft coral flash

Purpose:

Confirm saved action.

---

# Heatmap Motion

Used by:

StatsHeatmap

---

## Day Popover

Animation:

Fade

*

Scale

0.98 → 1.0

Duration:

180–220ms

---

## Heatmap

No animated cell waves.

No staggered appearance.

Heatmap should remain stable.

---

# Empty State Motion

Used by:

* Tasks EmptyState
* Archive EmptyState
* Stats EmptyState

---

## Appearance

Fade In

Duration:

200–250ms

Goal:

Gentle appearance.

Avoid:

* bounce
* slide from screen edge
* attention-seeking motion

---

# Toast Motion

Used globally.

---

## Appearance

Fade In

Duration:

150–200ms

---

## Dismiss

Fade Out

Duration:

150–200ms

---

## Position

Above BottomNavigation.

Centered horizontally.

---

# Loading Motion

Used by:

Skeleton states.

---

## Skeleton Style

Light shimmer.

Very subtle.

Very slow.

Goal:

Reduce perceived loading time.

---

## Forbidden

Do not use:

* spinner-only screens
* aggressive shimmer
* moving gradients across entire page

---

# Success Feedback

Rule:

Successful actions should combine:

Toast

*

Local Motion

Examples:

Restore Task

↓

Row fades out

↓

Toast appears

---

Save Password

↓

Button confirms save

↓

Toast appears

---

Create Task

↓

Task appears

↓

Toast optional

---

# Haptic Feedback

## Allowed

Reward selection

Punishment selection

---

## Purpose

Create tactile confirmation for the most important interaction in the application.

---

## Forbidden

Do not use haptics for:

* navigation
* modal open
* modal close
* scrolling
* archive restore
* settings changes

Haptics should remain meaningful.

---

# Reduced Motion Support

If operating system requests reduced motion:

Examples:

* iOS Reduce Motion
* Android Remove Animations

Then:

Replace complex motion with:

Fade

Duration:

~100ms

---

## Examples

Slide + Fade

↓

Fade only

---

Scale + Fade

↓

Fade only

---

Accordion

↓

Quick Fade

---

# Accessibility Motion Rules

Animations must never:

* block interaction
* delay task completion
* hide important information

Motion should assist understanding.

Motion should never be required to understand state.

---

# Forbidden Animations

Do not add:

* bounce
* rubber-band
* shake
* confetti
* spin
* parallax
* floating decorations
* idle animations
* attention-grabbing loops

---

# Future Motion Ideas (Post MVP)

Possible additions:

* richer haptics
* task reorder animation
* swipe gestures
* achievement animations
* onboarding transitions

All future motion must remain consistent with the philosophy:

```text
Calm Productivity
with a small motivational layer
```

---

# Design Intent

Motion should make the application feel alive without becoming noisy.

The user should notice motion subconsciously.

The interface should feel:

* smooth
* intentional
* responsive
* trustworthy

Every animation should help the user understand what just happened.
