# 03_TaskHistory.md

# TaskHistory Specification

Version: 1.0

Status: Locked

---

# Purpose

TaskHistory is a compact visual component that displays the recent execution history of a task.

Its goal is to allow the user to understand recent task performance in less than one second.

TaskHistory is informational only.

It does not provide editing or navigation.

---

# Priority

Priority:
9/10

Usage Frequency:
10/10

Visual Importance:
High

TaskHistory is one of the defining visual features of the application.

---

# Usage

Used in:

* TaskRow

Future usage:

* TaskModal
* Statistics views
* Analytics widgets

---

# Component Structure

TaskHistory

```
DayIndicator
DayIndicator
DayIndicator
DayIndicator
DayIndicator
DayIndicator
DayIndicator
```

Maximum length:

7 indicators

---

# Purpose of Each Indicator

Each indicator represents one calendar day.

The indicator displays the state of the task for that day.

Possible states:

* Reward
* Punishment
* Null

---

# Timeline Direction

Indicators are displayed from:

Oldest → Newest

Example:

○ ○ 🟢 ○ 🔴 ○ 🟢

Left side:
Oldest day

Right side:
Most recent day

---

# Current Day

The last indicator always represents today.

Example:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Today

○ ○ 🟢 ○ 🔴 ○ 🟢

---

# History Window

TaskHistory always displays calendar days.

It never displays:

* last 7 actions
* last 7 completions
* last 7 failures

Only calendar days are considered.

---

# Age Rules

If task age is less than 7 days:

Display only existing days.

Examples:

Task age = 2 days

○ 🟢

Task age = 4 days

○ 🔴 ○ 🟢

Task age = 7+ days

Display latest 7 calendar days only.

Example:

🟢 ○ 🔴 ○ ○ 🟢 ○

---

# Visual States

## Null

Represents:

No task result recorded.

Appearance:

Empty circle

Example:

○

---

## Reward

Represents:

Task completed successfully.

Appearance:

Filled green circle

Example:

🟢

---

## Punishment

Represents:

Task failed.

Appearance:

Filled coral/red circle

Example:

🔴

---

# Visual Style

Shape:

Circle

Default size:

12px

Spacing:

Relaxed spacing

Indicators should never appear crowded.

Example:

○ ○ 🟢 ○ 🔴 ○ ○

Preferred over:

○○🟢○🔴○○

---

# Interactions

TaskHistory is display-only.

Supported interactions:

None

Not clickable.

Not draggable.

No context menu.

No long press behavior.

No tooltip in MVP.

---

# Animation

When state changes:

Null → Reward

Null → Punishment

Reward → Null

Punishment → Null

Use:

* scale animation
* fade animation

Goal:

Provide subtle feedback without distracting the user.

---

# Accessibility

Task state must not depend solely on color.

TaskHistory is always displayed together with:

* Task title
* StatusActionGroup

This ensures context is preserved.

Touch interaction is not required.

---

# Forbidden Features

Do not add:

* day labels
* weekdays
* dates
* charts
* trend lines
* percentages
* tooltips
* click interactions

TaskHistory should remain lightweight.

---

# Post MVP Features

Possible future additions:

## Day Tooltip

Long press indicator

↓

Display:

Date

Result

Example:

2026-06-19
Reward

---

## Statistics Integration

Allow TaskHistory to be reused inside:

* Task analytics
* Stats screen widgets
* Trend reports

---

# Design Intent

TaskHistory should answer:

"How have I been doing recently?"

without opening TaskModal or Stats Screen.

The component should be understandable at a glance and require no explanation.
