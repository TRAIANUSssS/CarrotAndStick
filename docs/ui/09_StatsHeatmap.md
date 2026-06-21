# 09_StatsHeatmap.md

# StatsHeatmap Specification

Version: 1.0

Status: Locked

---

# Purpose

StatsHeatmap is the primary long-term activity visualization component of the application.

Its purpose is to help the user understand:

* consistency
* activity level
* successful periods
* unsuccessful periods
* gaps in habit tracking

at a glance.

StatsHeatmap is inspired by GitHub Contribution Graph.

---

# Priority

Priority:
9/10

Usage Frequency:
8/10

Visual Importance:
Very High

StatsHeatmap is the main visual centerpiece of the Stats Screen.

---

# Usage

Used on:

* Stats Screen

Not used on:

* Tasks Screen
* Archive Screen
* Account Screen

---

# High Level Structure

StatsHeatmap

```
Header

    Title

    YearSelector

WeekdayLabels

HeatmapGrid

Legend
```

---

# Header

Purpose:

Select displayed date range.

Layout:

Activity                     [ Last ▼ ]

---

# Title

Russian:

Активность

English:

Activity

---

# YearSelector

Available values:

Last

2026

2025

2024

...

Only years since account creation are shown.

Example:

User registered in 2025.

Selector:

Last

2026

2025

---

# Range Rules

## Last

Displays:

Last 365 calendar days.

Range:

Today - 364 days

↓

Today

---

## Specific Year

Displays:

01 January YYYY

↓

31 December YYYY

Example:

2025

↓

01.01.2025 - 31.12.2025

---

# Grid Structure

Heatmap uses GitHub-style layout.

Columns:

Weeks

Rows:

Weekdays

Weekday order:

Monday
Tuesday
Wednesday
Thursday
Friday
Saturday
Sunday

---

# Weekday Labels

Displayed above the grid.

Examples:

Пн Вт Ср Чт Пт Сб Вс

Mon Tue Wed Thu Fri Sat Sun

Purpose:

Improve readability.

---

# Cell Rules

One cell = one calendar day.

Cell size:

14px × 14px

Gap:

2px

Shape:

Rounded square

Recommended radius:

3-4px

---

# Future Dates

Future dates are not displayed.

Example:

Today = Thursday.

Friday and later cells do not appear yet.

Reason:

Future days should never be confused with empty days.

---

# Day States

## Empty Day

Condition:

Reward = 0

Punishment = 0

Appearance:

Empty / very light neutral cell.

---

## Positive Day

Condition:

Reward > Punishment

Appearance:

Green cell.

---

## Negative Day

Condition:

Reward < Punishment

Appearance:

Coral cell.

---

## Neutral Day

Condition:

Reward = Punishment

AND

Reward + Punishment > 0

Appearance:

Neutral gray cell.

---

# Color Logic

Color represents:

Day outcome.

Green:

Positive day.

Coral:

Negative day.

Gray:

Neutral day.

---

# Intensity Logic

Intensity represents:

Activity level.

Formula:

Activity = Reward + Punishment

Examples:

1 action

↓

Very light

10 actions

↓

Medium

30 actions

↓

Strong

---

# Examples

Reward = 1

Punishment = 0

Result:

Light green

---

Reward = 20

Punishment = 0

Result:

Dark green

---

Reward = 1

Punishment = 10

Result:

Medium coral

---

Reward = 5

Punishment = 5

Result:

Neutral gray

---

# Interaction

Cells are clickable.

---

# Day Popover

Tap cell

↓

Open lightweight popover.

Example:

19 June 2026

🍪 7

🪢 1

Success: 87%

---

# Success Formula

SuccessRate =

Reward

/

(Reward + Punishment)

Example:

7 / (7 + 1)

=

87.5%

Display:

87%

---

# Popover Rules

Purpose:

Inspect a specific day.

Popover should feel lightweight.

Do not use full-screen modal.

Preferred:

Popover near tapped cell.

Avoid:

Large bottom sheets.

---

# Legend

Display compact legend below Heatmap.

Example:

□ Empty

■ Positive

■ Negative

■ Neutral

or similar compact representation.

Purpose:

Help new users understand the color system.

---

# Loading State

Use Heatmap skeleton.

Requirements:

* preserve final dimensions
* preserve layout
* avoid spinner-only loading

---

# Error State

Display compact error card.

Example:

Could not load activity

[ Retry ]

BottomNavigation remains visible.

---

# Accessibility

Heatmap must not rely solely on color.

Each cell should expose:

* date
* reward count
* punishment count
* success rate

Example screen reader text:

19 June 2026

7 rewards

1 punishment

87 percent success

---

# Animation

Hover/Tap:

Subtle scale animation.

Popover:

Fade + scale.

Duration:

150-220ms

Avoid:

* bounce
* dramatic motion
* particle effects

---

# Forbidden Features

Do not add:

* numbers inside cells
* emoji inside cells
* labels inside cells
* automatic navigation
* editable cells

Heatmap is primarily a visualization component.

---

# Post MVP Features

Possible future additions:

## Advanced Filtering

Filter by:

* task
* task group
* reward only
* punishment only

## Multi-Year View

Show several years in one view.

## Compare Years

Compare:

2026 vs 2025

## Streak Highlighting

Highlight long positive streaks.

---

# Design Intent

StatsHeatmap should answer:

“How active was I over time?”

within a few seconds.

The user should instantly identify:

* productive periods
* difficult periods
* inactive periods
* overall consistency

without reading numbers or opening additional screens.
