# 05_TaskGroup.md

# TaskGroup Specification

Version: 1.0

Status: Locked

---

# Purpose

TaskGroup is a container component used on the Tasks screen to group active tasks.

Its purpose is to keep the task list readable and structured without adding unnecessary complexity.

The application uses only two task groups in MVP:

- Pinned
- Other

No additional task groups are supported in MVP.

---

# Priority

Priority:
8/10

Usage Frequency:
10/10

Visual Importance:
Medium-high

TaskGroup is not the main interaction point, but it strongly affects scanability of the Tasks screen.

---

# Usage

Used on:

- Tasks Screen

Not used on:

- Archive Screen
- Stats Screen
- Account Screen

---

# Component Structure

TaskGroup

    Header

        Icon

        Title

        CountBadge

        CollapseButton

    Content

        TaskRow[]

---

# Variants

## Pinned TaskGroup

Title:

Russian:

Закрепленные

English:

Pinned

Icon:

Pin icon

Contains:

Only pinned tasks.

---

## Other TaskGroup

Title:

Russian:

Остальные

English:

Other

Icon:

Task / list / pencil icon

Contains:

Only non-pinned active tasks.

---

# Number of Groups

MVP supports exactly two groups:

1. Pinned
2. Other

Do not add:

- categories
- tags
- custom groups
- priority groups
- date groups

These would make the product feel like a complex task manager, which is not the goal.

---

# Visibility Rules

## Pinned Group

If there are no pinned tasks:

Do not render the Pinned group.

No internal empty state.

---

## Other Group

If there are no regular tasks:

Do not render the Other group.

No internal empty state.

---

## Both Groups Empty

If both groups are empty:

Render a general Tasks EmptyState instead of empty groups.

Recommended empty state:

- soft bordered rectangular card
- friendly motivational message
- instruction to press + Task / + Задача

Example:

Russian:

Если вы хотите иметь то, что никогда не имели, вам придётся делать то, что никогда не делали.

Нажми на + Задача

English:

If you want something you have never had, you will have to do something you have never done.

Tap + Task

The motivational quote may come from a small predefined pool.

The UI must display only one quote at a time.

---

# Header Layout

Reference:

[ icon ] [ title ] [ count badge ]                [ chevron ]

Rules:

- icon on the left
- title after icon
- count badge after title
- collapse button on the right
- header should feel lighter than TaskRow

---

# Count Badge

TaskGroup may show a small muted count badge.

Examples:

Закрепленные 3

Pinned 3

Остальные 8

Other 8

Rules:

- count badge must be visually secondary
- muted color
- small rounded pill
- should not compete with title

Implementation note:

The count badge should be checked visually during implementation. If it makes the header feel crowded on iPhone 13 mini, reduce its visual weight before removing it.

---

# Collapse Behavior

TaskGroup is collapsible in MVP.

Expanded:

- content is visible
- chevron points up

Collapsed:

- content is hidden
- chevron points down

The header remains visible in both states.

---

# Collapse State Persistence

Collapse state is persisted locally only.

Use:

localStorage

Do not persist collapse state in backend or database in MVP.

Suggested keys:

tasks.group.pinned.collapsed

tasks.group.other.collapsed

---

# Collapse Animation

Use a calm, short animation.

Recommended:

- height animation
- opacity animation
- duration: 180-240ms
- smooth easing
- no bounce

Chevron animation:

- rotate 180 degrees
- same duration as content animation
- synchronized with expand/collapse

Avoid:

- sudden content jumps
- aggressive spring motion
- long delays

---

# Sorting Inside Groups

## Pinned Group

Sorted by pin date.

Oldest pinned task first.

## Other Group

Sorted by creation date.

Oldest created task first.

Manual sorting is not part of MVP.

---

# Styling

TaskGroup should not look like a heavy card containing many other cards.

Avoid:

screen
  card
    card
      card

Preferred:

screen
  light section header
  task rows

Rules:

- group header may be outside a large card
- TaskRows remain individual surfaces
- spacing should separate groups naturally

---

# Accessibility

Collapse button should have accessible labels.

Examples:

Russian:

Свернуть закрепленные задачи

Развернуть закрепленные задачи

English:

Collapse pinned tasks

Expand pinned tasks

Use aria-expanded on the collapse button.

Example:

```tsx
<button aria-expanded={!collapsed} aria-label="Collapse pinned tasks" />
```

---

# Forbidden Features

Do not add:

- custom user groups
- categories
- tags
- kanban columns
- priority groups
- per-group color themes
- per-group settings
- internal empty states for each group
- backend persistence for collapse state

---

# Post MVP Features

Possible future additions:

## Manual Ordering Mode

Activated through an edit button.

Users can reorder tasks by drag and drop.

This may apply inside groups only.

---

## Swipe Shortcuts

TaskRow may later support:

- swipe right -> Reward
- swipe left -> Punishment

TaskGroup itself should not implement swipe behavior.

---

## Custom Groups

Not recommended for the product direction, but possible in the distant future if the product becomes more complex.

If added, they must not make the app feel like a full task manager.

---

# Design Intent

TaskGroup should make the task list easier to scan without making the application feel complex.

The user should understand the structure immediately:

Pinned tasks first.

Other tasks below.

Nothing more.
