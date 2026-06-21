# 19_Accessibility.md

# Accessibility Specification

Version: 1.0

Status: Locked

---

# Purpose

This document defines accessibility requirements for the application.

The goal is not to achieve perfect WCAG compliance at any cost.

The goal is to provide a comfortable experience for the vast majority of users while keeping MVP complexity reasonable.

Accessibility should be implemented when it is:

* useful
* inexpensive
* low-risk
* easy to maintain

---

# Accessibility Level

Target Level:

Between Level A and Level B

Practical interpretation:

```text
Implement accessibility features that provide significant value
without introducing major MVP complexity.
```

---

# Core Principles

The application should be usable by users who:

* use larger text sizes
* navigate using a keyboard
* use screen readers
* have mild color vision deficiencies
* prefer reduced motion

The application is not required to fully support every advanced accessibility scenario in MVP.

---

# Touch Targets

All interactive elements must have a minimum touch area.

Minimum Size:

44 × 44 px

Applies to:

* buttons
* icon buttons
* navigation items
* action controls
* list actions
* modal actions

---

# Examples

Good:

```text
48 × 48 px
```

Good:

```text
44 × 44 px
```

Avoid:

```text
24 × 24 px
```

when used as a touch target.

---

# Text Contrast

The application should aim for WCAG AA text contrast.

Goal:

Text should remain comfortably readable in normal use.

---

# Priority

High Priority:

* body text
* titles
* form fields
* buttons
* error messages

Lower Priority:

* decorative elements
* subtle separators
* secondary visual accents

---

# Text Scaling

The application should support larger text sizes where practical.

Goals:

* avoid clipping
* avoid overlap
* avoid broken layouts

---

# Requirements

Pages should remain usable when text size is increased moderately.

Examples:

* iOS Dynamic Type
* Android Font Scaling

---

# Allowed Adjustments

When text becomes larger:

* components may grow vertically
* cards may become taller
* spacing may increase

---

# Forbidden Behavior

Avoid:

* truncated critical information
* overlapping text
* invisible controls

---

# Screen Reader Support

The application should expose meaningful labels for interactive controls.

---

# General Rule

Screen readers should announce purpose.

Not:

```text
Button
```

Instead:

```text
Mark task as completed
```

or

```text
Mark task as failed
```

---

# StatusActionGroup

Reward Button

Accessible Label:

Russian:

Отметить задачу как выполненную

English:

Mark task as completed

---

Punishment Button

Accessible Label:

Russian:

Отметить задачу как проваленную

English:

Mark task as failed

---

# Navigation

BottomNavigation items should expose readable labels.

Examples:

Russian:

Задачи

Статистика

Аккаунт

English:

Tasks

Stats

Account

---

# Form Fields

All form inputs must have labels.

Examples:

* Username
* Email
* Password
* Repeat Password

Placeholder text is not a replacement for labels.

---

# Password Visibility

Show/Hide password buttons must expose accessible labels.

Examples:

Russian:

Показать пароль

Скрыть пароль

English:

Show password

Hide password

---

# Focus States

Every interactive element must have a visible focus state.

Applies to:

* buttons
* links
* form fields
* navigation items
* modal actions

---

# Focus State Requirements

Focus state should be:

* visible
* consistent
* unobtrusive

Examples:

* outline
* glow
* border accent

---

# Forbidden Focus Behavior

Avoid:

* invisible focus
* relying only on browser defaults if they clash with design
* removing focus styles

---

# Keyboard Navigation

Desktop users should be able to navigate basic application functionality using a keyboard.

---

# Required Keys

Tab

Shift + Tab

Enter

Escape

---

# Examples

Tab:

Move focus.

Enter:

Activate focused button.

Escape:

Close modal.

---

# Required Areas

Keyboard support should work in:

* Login Screen
* Register Screen
* Account Screen
* Modals
* Archive Screen

---

# Error Messages

Validation errors should use:

* text
* color

Not color alone.

---

# Examples

Good:

Russian:

Пароли не совпадают

English:

Passwords do not match

with supporting color.

---

Avoid:

Only a red border.

---

# Color Usage

Color should not be the sole source of meaning when avoidable.

However, MVP does not require additional icons or symbols in every place.

---

# Task History

Current design:

```text
○ ○ 🟢 ○ 🔴 ○ ○
```

is acceptable for MVP.

No additional symbols are required.

---

# Reduced Motion

Accessibility implementation must respect system-level reduced motion preferences.

Reference:

18_MotionSystem.md

---

# Behavior

When Reduce Motion is enabled:

* replace slide animations with fades
* replace scale animations with fades
* reduce animation duration

Goal:

Maintain clarity without excessive movement.

---

# Toast Accessibility

Toasts should:

* be announced politely
* not steal focus
* not interrupt current interaction

---

# Modal Accessibility

All modals should:

* move focus into the modal
* restore focus on close
* expose modal title
* trap focus where appropriate

Reference:

17_Modals.md

---

# Loading States

Skeletons should remain accessible.

Rules:

* avoid rapidly flashing shimmer
* avoid motion that could distract users

---

# Language Support

The application supports:

* Russian
* English

All accessibility labels should be localized.

---

# Accessibility Testing Checklist

Before release verify:

□ Touch targets are at least 44×44 px

□ Keyboard navigation works

□ Focus states are visible

□ Error messages contain text

□ Password fields expose labels

□ Bottom navigation labels are announced

□ Modals can be closed with Escape

□ Reduced Motion works

□ Text remains readable when enlarged

□ Toasts do not interrupt focus

---

# Out of Scope for MVP

The following are not required in MVP:

* full WCAG certification
* advanced screen reader optimization
* high-contrast mode
* custom accessibility settings page
* voice navigation
* switch control testing
* complete keyboard-only parity

---

# Post MVP Improvements

Possible future additions:

* dedicated accessibility settings
* high-contrast theme
* improved color-blind support
* advanced screen reader optimization
* larger accessibility text presets
* custom focus styling controls

---

# Design Intent

Accessibility should make the application easier to use without making the product significantly more complex.

The philosophy is:

```text
Do the high-value accessibility work first.
```

Users should be able to:

* read content comfortably
* operate controls confidently
* navigate with a keyboard when needed
* use assistive technologies for core flows

without sacrificing the simplicity of the product.
