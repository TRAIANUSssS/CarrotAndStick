# 10_TopTasks.md

# TopTasks Specification

Version: 1.0

Status: Locked

---

# Purpose

TopTasks is an analytical component of the Stats Screen.

Its purpose is to help the user understand:

* which tasks are performing best
* which tasks are performing worst
* which habits are the most stable
* which habits require attention

TopTasks should encourage reflection and improvement rather than punishment.

---

# Priority

Priority:
8/10

Usage Frequency:
7/10

Visual Importance:
High

TopTasks is the main detailed analytics section of the Stats Screen.

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

TopTasks

```
Header

    Title

RankingModeSelector

    Best
    Worst

CalculationModeSelector

    Efficiency
    Consistency

TaskList

    TaskMetricRow[]

ShowAllButton
```

---

# Title

Russian:

Топ задач

English:

Top Tasks

---

# Ranking Mode Selector

Segmented control.

Options:

[ Best ] [ Worst ]

Russian:

[ Лучшие ] [ Худшие ]

---

# Best Mode

Displays tasks with the highest score.

Purpose:

Show strongest habits.

---

# Worst Mode

Displays tasks with the lowest score.

Purpose:

Show habits requiring attention.

---

# Calculation Mode Selector

Segmented control.

Options:

[ Efficiency ] [ Consistency ]

Russian:

[ Эффективность ] [ Регулярность ]

---

# Efficiency Mode

Purpose:

Measure success when a task was attempted.

Formula:

Reward

/

(Reward + Punishment)

Examples:

3 Reward

1 Punishment

↓

75%

---

10 Reward

0 Punishment

↓

100%

---

Tasks with no activity are excluded.

Formula denominator:

Reward + Punishment

must be greater than zero.

---

# Consistency Mode

Purpose:

Measure how regularly the task was completed during the selected period.

Formula:

Reward

/

DaysInPeriod

Examples:

3 Reward

30-day month

↓

10%

---

20 Reward

30-day month

↓

67%

---

Tasks with no activity are excluded.

---

# Period Dependency

TopTasks respects the currently selected Stats period.

Examples:

Day

↓

Calculate using selected day.

Week

↓

Calculate using selected week.

Month

↓

Calculate using selected month.

Year

↓

Calculate using selected year.

All Time

↓

Calculate using entire account history.

---

# Default View

Display:

Top 5 tasks

Only.

If more tasks exist:

Display:

Show All

button.

---

# Show All

Purpose:

Expand ranking beyond first five items.

Behavior:

Tap

↓

Expand full ranking.

No navigation required.

The list expands inline.

---

# Task Visibility Rules

Display only tasks that have activity.

Activity:

Reward + Punishment > 0

Tasks with:

0 Reward

0 Punishment

are excluded completely.

Even after Show All.

---

# Archived Tasks

Archived tasks participate in rankings.

Condition:

The task existed during the selected period.

Archived tasks should display a small visual badge.

Examples:

[ Archived ]

[ Архив ]

Badge should be subtle.

Do not visually dominate the row.

---

# Sorting Rules

Primary sort:

Metric value

Descending in Best mode.

Ascending in Worst mode.

---

# Tie Breaking

If two tasks have identical metric value:

Sort by:

1. Successful completions (higher first)

If still equal:

2. Creation date

Older task first.

---

# Task Row Structure

TaskMetricRow

```
TaskName

ArchiveBadge (optional)

ProgressBar

MetricSummary
```

---

# Task Name

Displays task title.

Maximum:

2 lines.

Follow TaskRow truncation rules.

---

# Metric Summary

Display both percentage and counts.

Format:

75% · 3/4

Meaning:

75% success

3 successful

4 total attempts

Examples:

100% · 7/7

75% · 3/4

25% · 1/4

---

# Progress Bar

Visual representation of task performance.

---

## Best Mode

Color order:

Coral

↓

Green

Example:

25% failed

75% successful

Progress bar:

[ coral ][ green ]

---

## Worst Mode

Color order:

Green

↓

Coral

Example:

75% successful

25% failed

Progress bar:

[ green ][ coral ]

Purpose:

Make negative portion visually obvious.

---

# Consistency Mode Progress Bar

Bar consists of three segments:

Completed

↓

Failed

↓

Unused

Example:

Period:

30 days

Task:

Reward = 15

Punishment = 5

Unused = 10

Bar:

[ green ][ coral ][ neutral ]

---

# Empty State

If no tasks qualify:

Display:

Russian:

Пока нечего сравнивать

English:

Nothing to compare yet

No ranking rows are shown.

---

# Interaction

MVP:

Informational only.

Rows are not clickable.

No navigation.

No modal opening.

No task details.

---

# Loading State

Display skeleton rows.

Structure:

Task name placeholder

Progress bar placeholder

Metric placeholder

Display approximately five skeleton rows.

---

# Error State

Display compact retry card.

Example:

Could not load rankings

[ Retry ]

BottomNavigation remains visible.

---

# Accessibility

Each row should expose:

Task name

Metric value

Completion counts

Example:

Read book

75 percent

3 successful completions

4 total attempts

---

# Animation

Changing:

* Best / Worst
* Efficiency / Consistency
* Period

should animate smoothly.

Recommended:

Fade + small vertical movement.

Duration:

180-250ms

Avoid:

* resorting jumps
* dramatic transitions
* bouncing cards

---

# Forbidden Features

Do not add:

* task editing
* task deletion
* navigation
* task detail screens
* charts inside rows
* filters beyond current selectors
* empty tasks

TopTasks is an analytical ranking component only.

---

# Post MVP Features

## Minimum Activity Threshold

Allow user-defined minimum activity threshold.

Example:

Show only tasks with at least 5 attempts.

Possible future UI:

Slider

Minimum Attempts

---

## Task Details

Tap task

↓

Open detailed task analytics.

Includes:

* heatmap
* streaks
* longest success run
* longest failure run
* historical trends

Not part of MVP.

---

## Advanced Filters

Filter by:

* active tasks
* archived tasks
* pinned tasks

Not part of MVP.

---

# Design Intent

TopTasks should answer:

"What are my strongest and weakest habits?"

within a few seconds.

The user should immediately identify:

* strongest habits
* weakest habits
* consistency level
* opportunities for improvement

without opening additional screens.
