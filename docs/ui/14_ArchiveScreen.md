# 14_ArchiveScreen.md

# Archive Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Archive Screen stores tasks that are no longer active but should remain part of the user's history.

Archived tasks:

* are hidden from Tasks Screen
* remain part of historical statistics
* may appear in TopTasks
* may be restored at any time

Archive is intended to be a lightweight storage area rather than a second task manager.

---

# Priority

Priority:
4/10

Usage Frequency:
2/10

Visual Importance:
Low

---

# High Level Structure

ArchiveScreen

```
Header

ArchiveList

EmptyState
```

---

# Layout Order

The order is fixed:

1. Header
2. ArchiveList or EmptyState

---

# Header

Purpose:

Display screen title and provide navigation back.

Layout:

[ ← ]    Архив

---

# Title

Russian:

Архив

English:

Archive

---

# Navigation

Back button returns user to the previous screen.

Possible entry points:

* Tasks Screen
* Account Screen

Archive Screen should not care where it was opened from.

---

# Archive List

Purpose:

Display archived tasks.

Rules:

* simple vertical list
* one task per row
* no grouping
* no search in MVP
* no filters in MVP

---

# Sorting

Tasks are sorted by:

archive_date DESC

Newest archived task first.

Examples:

Today

↓

Yesterday

↓

Last week

↓

Older tasks

---

# Archive Task Row

Structure:

ArchiveTaskRow

```
TaskTitle

RestoreButton

ArchiveDate

ArchivedDuration
```

---

# Layout

Compact horizontal layout.

Example:

Read a book               [ Restore ]

Archived: Jun 13, 2026

In archive: 12 days

---

# Task Title

Display task title.

Rules:

* maximum 2 lines
* use same truncation rules as TaskRow
* preserve readability

---

# Restore Button

Russian:

Восстановить

English:

Restore

Style:

* secondary button
* green accent
* visually lighter than primary actions

---

# Restore Behavior

Tap:

Восстановить

↓

Task is immediately restored.

Rules:

* no confirmation dialog
* optimistic update allowed
* row disappears from Archive Screen
* task returns to active task list

---

# Restore State Preservation

Restored task should preserve its previous state.

Examples:

Pinned before archive

↓

Pinned after restore

---

Regular before archive

↓

Regular after restore

---

# Archive Date

Display exact archive date.

Example:

Архивирована 13 июня 2026

English:

Archived June 13, 2026

---

# Archived Duration

Display relative archive duration.

Examples:

В архиве 12 дней

В архиве 3 месяца

В архиве 1 год 4 месяца

Purpose:

Provide context without requiring date calculations.

---

# Re-Archive Logic

Archive date is preserved if archive action was clearly accidental.

Example:

Archive

↓

Restore

↓

Immediately archive again

↓

Keep original archive date

---

Archive date is refreshed if meaningful activity occurred.

Examples:

Archive

↓

Restore

↓

Task receives new reward/punishment marks

↓

Archive again

↓

Use new archive date

---

Archive

↓

Restore

↓

Task edited significantly

↓

Archive again

↓

Use new archive date

---

Purpose:

Avoid noisy archive history caused by accidental taps.

---

# Statistics Integration

Archived tasks remain part of statistics.

Rules:

* contribute to StatsSummary
* contribute to TopTasks
* contribute to historical calculations

Condition:

Only when their activity falls inside the selected statistical period.

---

# TopTasks Integration

Archived tasks may appear in TopTasks.

If displayed:

Show subtle badge:

Архив

Archive

Uses:

10_TopTasks.md

---

# Empty State

Displayed when archive contains no tasks.

---

# Empty State Structure

Illustration

↓

Title

↓

Description

↓

Primary Button

---

# Title

Russian:

Здесь пока пусто

English:

Nothing here yet

---

# Description

Russian:

Архивированные задачи появятся здесь

English:

Archived tasks will appear here

---

# Primary Button

Russian:

На главную

English:

Go Home

Behavior:

Navigate to Tasks Screen.

---

# Empty State Rules

If archive is empty:

Do not display ArchiveList.

Display EmptyState only.

---

# Loading State

Display skeleton rows.

Structure:

Task title skeleton

↓

Date skeleton

↓

Restore button skeleton

Display approximately 5 rows.

---

# Error State

Display compact inline error.

Example:

Не удалось загрузить архив

[ Повторить ]

English:

Could not load archive

[ Retry ]

---

# Scroll Behavior

Single vertical scroll.

Rules:

* list scrolls naturally
* header remains fixed if application shell supports it
* no pagination in MVP

---

# Search

Not included in MVP.

---

# Filters

Not included in MVP.

---

# Permanent Delete

Not included in MVP.

Archived tasks are always recoverable.

---

# Animation

Restore:

Tap Restore

↓

Row fades out

↓

List reflows smoothly

Duration:

180-250ms

Avoid:

* bounce
* dramatic transitions
* particle effects

---

# Accessibility

Requirements:

* restore button keyboard accessible
* task title readable by screen readers
* archive date announced
* duration announced

Example:

Read a book

Archived June 13, 2026

In archive 12 days

Restore button

---

# Visual Style

Archive Screen should feel:

* calm
* lightweight
* secondary

Use:

* warm surfaces
* subtle separators
* compact spacing

Avoid:

* large cards
* oversized illustrations inside list
* heavy visual hierarchy

The focus should remain on restoring tasks quickly.

---

# Forbidden Features

Do not add in MVP:

* search
* filtering
* bulk restore
* permanent delete
* task editing
* task modal
* archive categories
* sorting controls

---

# Post MVP Features

## Search

Search archived tasks by title.

---

## Filters

Filter by:

* archive date
* pinned status
* activity level

---

## Bulk Restore

Select multiple tasks and restore them together.

---

## Permanent Delete

Allow removing tasks forever.

Requires strong confirmation.

---

## Archive Analytics

Display archive statistics.

Examples:

* total archived tasks
* average archive duration

---

# Design Intent

Archive Screen should answer:

"Which tasks have I completed or retired, and do I want any of them back?"

within a few seconds.

The user should be able to:

* quickly find archived tasks
* understand when they were archived
* restore them immediately

without navigating through additional screens.
