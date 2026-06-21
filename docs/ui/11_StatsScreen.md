# 11_StatsScreen.md

# Stats Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Stats Screen is the analytical center of the application.

Its purpose is to help the user understand:

* personal progress
* habit consistency
* successful periods
* unsuccessful periods
* strongest habits
* weakest habits

Unlike Tasks Screen, which focuses on action, Stats Screen focuses on reflection.

The screen should answer:

"How am I doing?"

within a few seconds.

---

# Priority

Priority:
9/10

Usage Frequency:
7/10

Visual Importance:
Very High

Stats Screen is the second most important screen in the application after Tasks Screen.

---

# High Level Structure

StatsScreen

```
Header

PeriodSelector

DateNavigation

StatsSummary

StatsHeatmap

TopTasks

BottomNavigation
```

---

# Layout Order

The order is fixed:

1. Header
2. PeriodSelector
3. DateNavigation
4. StatsSummary
5. StatsHeatmap
6. TopTasks
7. BottomNavigation

Do not reorder these sections in MVP.

---

# Header

Purpose:

Display current screen title.

Layout:

[ spacer ]   [ title ]   [ spacer ]

Rules:

* title centered
* no action buttons
* no settings
* no percentage toggle
* no archive shortcut

---

# Title

Russian:

Статистика

English:

Statistics

---

# PeriodSelector

Uses the same component as Tasks Screen.

Options:

* Day
* Week
* Month
* Year
* All Time

Russian:

* День
* Неделя
* Месяц
* Год
* Всё время

---

# PeriodSelector Behavior

Unlike Tasks Screen:

Stats Screen does not use automatic period switching.

Rules:

* user changes period manually
* selected period remains active
* no 15-second timer
* no automatic rotation

Reason:

Users may spend a long time analyzing data.

Automatic switching would be disruptive.

---

# DateNavigation

Purpose:

Navigate between periods.

Examples:

Week:

[ < ] This Week [ > ]

Month:

[ < ] June 2026 [ > ]

Year:

[ < ] 2026 [ > ]

Rules:

* appears below PeriodSelector
* changes selected period range
* affects StatsSummary
* affects TopTasks
* does not affect StatsHeatmap

---

# StatsSummary

Uses:

08_StatsSummary.md

Purpose:

Display reward and punishment totals for the selected period.

Includes:

* current totals
* comparison with previous equivalent period

Examples:

🍪 145
↑ +12

🪢 18
↓ -3

StatsSummary always respects:

* PeriodSelector
* DateNavigation

---

# StatsHeatmap

Uses:

09_StatsHeatmap.md

Title:

Активность

Activity

Purpose:

Display long-term activity history.

---

# Heatmap Independence

StatsHeatmap is independent from:

* PeriodSelector
* DateNavigation

Changing:

Day
Week
Month
Year
All Time

does not affect Heatmap.

Changing:

Current week
Previous month
Previous year

does not affect Heatmap.

Reason:

Heatmap represents long-term account activity.

This behavior mirrors GitHub Contributions.

---

# TopTasks

Uses:

10_TopTasks.md

Purpose:

Display strongest and weakest habits.

Default state:

Ranking Mode:

Best

Calculation Mode:

Efficiency

TopTasks respects:

* PeriodSelector
* DateNavigation

TopTasks does not depend on Heatmap year selector.

---

# Empty State

Displayed when user has no task history.

Condition:

No completed tasks.

No failed tasks.

No historical activity.

---

# Empty State Structure

Large centered card.

Contains:

Random joke

↓

Explanation text

---

# Joke Examples

Russian:

За последние 4.5 млрд лет выполнено 0 задач.

---

Пока статистика подозрительно пуста.

---

Сначала задачи.
Потом статистика.

---

One joke is displayed at a time.

A small predefined pool may be used.

---

# Explanation Text

Russian:

Статистика появится после выполнения задач.

English:

Statistics will appear after you complete tasks.

---

# Empty State Visibility Rules

If EmptyState is shown:

Do not render:

* StatsSummary
* StatsHeatmap
* TopTasks

Only EmptyState remains visible.

BottomNavigation remains visible.

---

# Loading State

Use skeletons for each major section.

Display:

StatsSummary Skeleton

↓

Heatmap Skeleton

↓

TopTasks Skeleton

Do not use a full-screen spinner.

The final page layout should remain recognizable during loading.

---

# Error State

Display compact inline error card.

Example:

Не удалось загрузить статистику

[ Повторить ]

English:

Could not load statistics

[ Retry ]

Rules:

* BottomNavigation remains visible
* page shell remains visible
* retry action reloads data

---

# Scroll Behavior

Stats Screen uses a single vertical scroll.

Scrollable content:

* StatsSummary
* StatsHeatmap
* TopTasks

BottomNavigation remains fixed.

---

# Bottom Padding

The page must include sufficient bottom spacing so:

* the final TopTasks rows
* Show All button
* EmptyState content

are never hidden behind BottomNavigation.

---

# Visual Style

Stats Screen should feel:

* calm
* analytical
* informative

Avoid:

* gamification overload
* excessive charts
* flashy animations
* bright decorative illustrations

The focus should remain on personal progress.

---

# Animation

Allowed:

* fade
* scale
* small vertical transitions

Duration:

150-250ms

Avoid:

* bounce
* dramatic motion
* page flips
* confetti

---

# Accessibility

Requirements:

* all controls keyboard accessible
* segmented controls expose active state
* period selector exposes selected period
* heatmap cells expose activity details
* ranking rows expose metrics
* screen reader friendly labels

---

# Forbidden Features

Do not add:

* automatic period switching
* dashboard widgets
* advertisements
* notifications
* social sharing
* achievement popups
* unrelated charts

Stats Screen should remain focused on personal analytics.

---

# Post MVP Features

## Percentage Display Mode

Optional global statistics mode.

Displays percentages instead of counts.

Not part of MVP.

---

## Goal Tracking

Compare current statistics with custom goals.

Not part of MVP.

---

## Trend Analytics

Advanced charts:

* rolling averages
* weekly trends
* monthly trends

Not part of MVP.

---

## Habit Insights

Automatic observations:

"You complete reading tasks most consistently."

Not part of MVP.

---

# Design Intent

Stats Screen should feel like a personal reflection tool.

The user should immediately understand:

* how much progress was made
* whether performance improved
* which habits are strongest
* which habits require attention
* how active they have been over time

without opening any additional screens.
