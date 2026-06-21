# 07_TasksScreen.md

# Tasks Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Tasks Screen is the main screen of the application.

It is the primary daily-use surface where the user:

- sees reward and punishment totals for the selected period
- selects the active period for HeroStats
- selects the date for marking tasks
- creates new tasks
- reviews task history
- marks tasks as Reward or Punishment
- opens TaskModal
- navigates to Archive

The screen must support the core product scenario:

Open the app, understand the current situation, mark several tasks, leave.

Target completion time:

10-15 seconds.

---

# Priority

Priority:
10/10

Usage Frequency:
10/10

Visual Importance:
Highest

Tasks Screen is the main product experience.

---

# High-Level Structure

TasksScreen

    TopHeader

    HeroStats

    PeriodTabs

    DateAndActionRow

        DatePicker

        AddTaskButton

    TaskGroups

        PinnedTaskGroup

        OtherTaskGroup

    EmptyState

    Hint

    BottomNavigation

---

# Layout Order

The vertical order is fixed:

1. TopHeader
2. HeroStats
3. PeriodTabs
4. DateAndActionRow
5. TaskGroups
6. Hint, if there is at least one task
7. BottomNavigation

Do not reorder these blocks in MVP.

---

# TopHeader

Purpose:

Displays the application title and provides quick access to Archive.

Layout:

[ spacer ]   [ title ]   [ archive icon ]

Rules:

- title is centered
- right side contains archive box icon
- left side uses empty spacer with same width as archive button so title remains visually centered

Title:

Russian:

Кнут и Пряник

English:

Carrot & Stick

Archive button:

- icon-only
- uses archive/box icon
- opens Archive Screen
- route: /app/tasks/archived

Do not place Account or Settings actions in this header.

---

# HeroStats

Uses:

01_HeroStats.md

Position:

Immediately below TopHeader.

Rules:

- shows reward and punishment totals for selected period
- informational only
- not clickable
- does not show period label internally

---

# PeriodTabs

Purpose:

Controls the period used by HeroStats.

Order:

All time -> Week -> Day -> Month -> Year

Russian:

Все время -> Неделя -> День -> Месяц -> Год

Behavior:

- auto-switch every 15 seconds
- after manual selection, pause auto-switch for 30 seconds
- auto-switch continues only while respecting the pause timer

Important session behavior:

If the user manually selects a period, then leaves the Tasks screen and returns later, the remaining pause time should be respected.

Example:

- User selects Week.
- After 5 seconds, user goes to Account.
- User spends 20 seconds there.
- User returns to Tasks.
- Auto-switch happens after 5 more seconds.

This means the pause timer is based on elapsed time, not on active screen time only.

Persistence:

- selected period may live in app state/session state
- backend persistence is not required
- localStorage is not required unless implementation needs it

---

# DateAndActionRow

Purpose:

Contains date selection and task creation action.

Layout:

[ DatePicker ] [ + Task ]

Rules:

- always one row
- must remain one row on iPhone 13 mini
- reduce gap/padding before wrapping
- do not allow AddTaskButton text to wrap

Recommended ratio:

- DatePicker: approximately 58-62%
- AddTaskButton: approximately 38-42%

Gap:

8-12px

---

# DatePicker

Purpose:

Selects the date for task marking.

Rules:

- affects visible task statuses
- selected date is stored in current session state
- if user navigates to another tab and returns, selected date remains
- future dates should not be selectable in MVP unless product rules change

---

# AddTaskButton

Purpose:

Opens task creation modal.

Text:

Russian:

+ Задача

English:

+ Task

Rules:

- primary green button
- visible and easy to tap
- does not navigate away
- opens TaskModal in creation mode

---

# TaskGroups

Uses:

05_TaskGroup.md

Groups:

- PinnedTaskGroup
- OtherTaskGroup

Visibility:

- show only non-empty groups
- if Pinned group is empty, hide it
- if Other group is empty, hide it
- if both groups are empty, show Tasks EmptyState

Pinned sorting:

Oldest pinned first.

Other sorting:

Oldest created first.

---

# TaskRow

Uses:

02_TaskRow.md

Rules:

- tap opens TaskModal
- Reward/Punishment buttons update selected date status
- no subtitle
- history remains visible
- no swipe actions in MVP

---

# EmptyState

Shown when both groups are empty.

Purpose:

Encourage the user to create the first task.

Style:

- soft rectangular card
- warm surface
- subtle border
- calm friendly tone

Content:

- one motivational quote
- instruction to press + Task / + Задача

Russian example:

Если вы хотите иметь то, что никогда не имели, вам придётся делать то, что никогда не делали.

Нажми на + Задача

English example:

If you want something you have never had, you will have to do something you have never done.

Tap + Task

Quote behavior:

- may use a small predefined quote pool
- display one quote at a time
- random or deterministic selection is acceptable
- do not fetch quotes from the network

---

# Hint

Displayed only if there is at least one task.

Position:

Below task groups, before BottomNavigation padding area.

Text:

Russian:

Пусто — день не учтён в статистике

English:

Empty — the day is not included in statistics

Style:

- small
- muted
- centered
- visually secondary

Do not show Hint on a completely empty Tasks screen if EmptyState already explains the concept.

---

# Loading State

Use skeleton task cards.

Loading state should preserve the approximate layout of the page:

- TopHeader visible
- HeroStats skeleton or loaded state
- PeriodTabs visible
- DateAndActionRow visible
- TaskRow skeletons below

Do not use a large blocking spinner as the main loading UI.

Skeletons should feel soft and warm, not gray/cold.

---

# Error State

If task loading fails:

Show a quiet error card with retry button.

Content example:

Russian:

Не удалось загрузить задачи

Повторить

English:

Could not load tasks

Retry

Rules:

- do not show blocking browser alert
- do not replace the entire app shell
- BottomNavigation remains visible
- retry button triggers reload

---

# Scroll Behavior

Main content scrolls vertically.

BottomNavigation is fixed.

Tasks Screen must include enough bottom padding so the last task or hint is not hidden behind BottomNavigation.

Rules:

- no horizontal scroll
- no hidden content under bottom nav
- no fixed large header in MVP

---

# Decorative Elements

No additional decorative elements outside HeroStats in MVP.

Reason:

The screen must stay calm and focused.

Do not add:

- background illustrations
- floating decorations
- extra leaves outside HeroStats
- decorative gradients

---

# Pull To Refresh

Not part of MVP.

Post MVP only.

---

# Accessibility

Requirements:

- Archive icon must have accessible label
- AddTaskButton must have accessible label
- PeriodTabs must expose selected period
- DatePicker must expose selected date
- TaskRows must be keyboard/focus accessible on desktop
- BottomNavigation remains accessible as defined in 06_BottomNavigation.md

---

# Forbidden Features

Do not add:

- extra task groups
- categories
- tags
- priorities
- deadlines
- desktop sidebar
- hidden bottom navigation
- decorative background outside HeroStats
- pull-to-refresh in MVP
- swipe actions in MVP
- extra CTA buttons competing with + Task

---

# Post MVP Features

Possible future additions:

## Pull To Refresh

Native-like refresh gesture for mobile browsers/PWA.

## Manual Sort Mode

Edit mode where tasks can be reordered by drag and drop.

## Swipe Actions

TaskRow-level gestures:

- swipe right -> Reward
- swipe left -> Punishment

## More EmptyState Quotes

A larger curated quote pool.

Must remain calm and not overly motivational.

---

# Design Intent

Tasks Screen should feel like a calm daily ritual.

The user should immediately see:

- current reward/punishment totals
- selected period
- selected date
- active tasks
- recent history
- direct marking buttons

The screen should never feel like a complex todo manager.
