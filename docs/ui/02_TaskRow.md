# 02_TaskRow.md

# TaskRow Specification

Version: 1.0

Status: Locked

---

# Purpose

TaskRow is the primary interactive component of the application.

It represents a single user task and allows the user to quickly review recent performance and mark the task as completed or failed for the selected date.

TaskRow is the most important component in the product.

---

# Priority

Priority:
10/10

Usage Frequency:
10/10

Visual Importance:
Highest in the application.

---

# Usage

Used on:

- Tasks Screen

Archived version used on:

- Archive Screen

---

# Component Structure

TaskRow

    Title

    TaskHistory

    StatusActionGroup

---

# Layout

Reference:

┌─────────────────────────────┐
│ Read a book                 │
│ ○ ○ 🟢 ○ 🔴 ○ ○            │
│                     🍪  🪢  │
└─────────────────────────────┘

---

# Title

Purpose:

Displays task name.

Rules:

- Maximum visible height: 2 lines
- Text may wrap
- Long titles must be truncated with ellipsis
- Do not allow unlimited height growth

Examples:

Good:

Read a book

Read machine learning
chapter and make notes

Too long:

Read machine learning chapter and
make notes for future university...

---

# Subtitle

Not supported.

TaskRow contains only:

- title
- history
- status buttons

No description.

No date.

No tags.

No priorities.

No progress bars.

---

# Interaction

Tap on TaskRow:

Open TaskModal.

Long Press:

No action.

Double Tap:

No action.

Swipe Actions:

Not part of MVP.

---

# TaskHistory

Purpose:

Displays recent task results.

TaskHistory always shows the last 7 days.

It does not depend on the selected period.

Possible states:

Reward

Punishment

Null

Visuals:

Reward:
Green circle

Punishment:
Coral circle

Null:
Empty circle

Examples:

○ ○ 🟢 ○ 🔴 ○ ○

🟢 ○ 🟢 🟢 ○ 🔴 ○

---

# History Length Rules

Task age < 7 days:

Display only existing days.

Examples:

Task age = 2 days

○ 🟢

Task age = 5 days

○ 🟢 🔴 ○ ○

Task age > 7 days

Display only the latest 7 days.

---

# StatusActionGroup

Contains:

Reward Button

Punishment Button

No Null button.

---

# State Logic

Reward button:

Null -> Reward

Punishment -> Reward

Reward -> Null

Punishment button:

Null -> Punishment

Reward -> Punishment

Punishment -> Null

---

# Visual States

## Null

Card:

Default border

Buttons:

Neutral

---

## Reward

Card:

Subtle green border

Button:

Green glow and active state

History:

Updated with green circle

---

## Punishment

Card:

Subtle coral border

Button:

Coral glow and active state

History:

Updated with coral circle

---

# Animations

When selecting Reward:

- button glow transition
- micro scale animation
- subtle green flash

When selecting Punishment:

- button glow transition
- micro scale animation
- subtle coral flash

Avoid aggressive animations.

Goal:

Feel calm and premium.

---

# Sorting

Pinned Tasks:

Sorted by pin date.

Oldest pinned task first.

Other Tasks:

Sorted by creation date.

Oldest task first.

---

# Pinning

TaskRow does not contain a pin button.

Pin management is performed inside TaskModal.

---

# Archive Variant

Archive uses a modified version of TaskRow.

ArchivedTaskRow

Contains:

Title

Archive Duration

Reference:

┌─────────────────────────────┐
│ Read a book                 │
│ Archived for 12 days        │
└─────────────────────────────┘

No TaskHistory.

No StatusActionGroup.

No actions.

---

# Accessibility

Task state must not depend only on color.

Always show:

- history circles
- active button state
- task title

Touch targets must remain large enough for mobile usage.

---

# Forbidden Elements

Do not add:

- subtitles
- descriptions
- priorities
- tags
- deadlines
- progress bars
- pin button
- swipe actions

These features are intentionally excluded from MVP.

---

# Post MVP Features

Potential future additions:

## Swipe Gestures

Swipe Right:

Reward

Swipe Left:

Punishment

---

## Drag & Drop Sorting

Manual ordering mode.

Activated through edit mode.

---

## Custom Task Icons

Examples:

📚 Reading

🏃 Running

🎸 Guitar

User configurable.

---

# Design Intent

TaskRow should answer:

"How am I doing with this task recently?"

within less than one second.

The user should immediately see:

- task name
- recent history
- current state

without opening TaskModal.
