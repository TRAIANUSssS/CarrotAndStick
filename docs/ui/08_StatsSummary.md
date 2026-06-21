# 08_StatsSummary.md

# StatsSummary Specification

Version: 1.0

Status: Locked

---

# Purpose

StatsSummary is the primary summary component on the Stats screen.

Its purpose is to help the user quickly understand:

- how many rewards were earned in the selected period
- how many punishments were received in the selected period
- how this period compares to the previous equivalent period

StatsSummary is about progress and reflection.

It is visually related to HeroStats, but it is a separate component.

---

# Usage

Used on:

- Stats Screen

Not used on:

- Tasks Screen

Tasks Screen uses HeroStats instead.

---

# Difference from HeroStats

HeroStats:

- one unified card
- used on Tasks Screen
- shows current totals only
- uses compact numbers
- no period comparison

StatsSummary:

- two separate cards
- used on Stats Screen
- shows current totals
- shows comparison with previous period
- uses normal numbers where possible
- focused on progress analysis

---

# Component Structure

StatsSummary

    RewardSummaryCard

        Icon

        Value

        Delta

    PunishmentSummaryCard

        Icon

        Value

        Delta

---

# Layout

StatsSummary uses two separate cards placed horizontally.

Reference:

[ reward card ] [ punishment card ]

Example:

Reward card:

cookie icon

15

up arrow +5

Punishment card:

whip icon

2

down arrow -1

Rules:

- two cards in one row
- equal width
- consistent height
- should fit iPhone 13 mini
- do not stack vertically in MVP unless absolutely necessary

---

# Numbers

StatsSummary shows plain numbers.

Do not show percentages in MVP.

Examples:

15

120

3021

Do not compact numbers unless layout breaks.

If needed on small screens, reduce font size before using compact formatting.

---

# Delta Logic

Delta is calculated as:

current period value - previous period value

Examples:

Current rewards: 15

Previous rewards: 10

Delta:

+5

Current punishments: 3

Previous punishments: 5

Delta:

-2

---

# Previous Period Comparison

Compare selected period with the previous equivalent period.

Rules:

If selected period is Day:

Compare with previous day.

If selected period is Week:

Compare with previous week.

If selected period is Month:

Compare with previous month.

If selected period is Year:

Compare with previous year.

If selected period is All Time:

Previous period comparison may be hidden because there is no equivalent previous all-time period.

---

# Zero Previous Period

If the previous period had zero marks and the current period has marks, show normal numeric delta.

Example:

Previous rewards: 0

Current rewards: 5

Delta:

+5

Do not show:

- infinity
- NEW
- percentage increase
- special badge

---

# Delta Display

Delta is displayed below the main value.

Format:

+N

-N

0

Examples:

+5

-2

0

---

# Delta Color Rules

## Reward Delta

For rewards:

Increase is good.

+N:

green

-N:

coral / negative

0:

muted neutral

## Punishment Delta

For punishments:

Decrease is good.

-N:

green

+N:

coral / negative

0:

muted neutral

---

# Delta Arrows

Arrows may be used.

Reward examples:

Rewards increased:

up arrow +5

Rewards decreased:

down arrow -2

No change:

0

Punishment examples:

Punishments decreased:

down arrow -2

Punishments increased:

up arrow +3

No change:

0

Rules:

- arrow direction follows numeric change
- color follows whether the change is good or bad
- zero uses muted neutral and may omit arrow

---

# All Time Behavior

For All Time period:

StatsSummary still shows total reward and total punishment.

Recommended MVP behavior:

Hide delta for All Time.

Reason:

All Time has no meaningful previous equivalent period.

---

# Visual Style

Cards should feel similar to the overall app style:

- warm surface
- rounded corners
- subtle border
- minimal shadow
- large readable number
- icon visible but not overwhelming

Recommended:

- soft green tint for RewardSummaryCard
- soft coral tint for PunishmentSummaryCard
- no heavy gradients
- no complex charts inside the cards

---

# Animation

When period changes:

- value updates with scale + fade
- delta updates with fade
- card should not jump in size

Avoid:

- count-up animation
- bouncing numbers
- dramatic transitions

---

# Accessibility

StatsSummary must be understandable without color alone.

Each card includes:

- icon
- value
- delta text

Screen reader text should describe whether the change is good or bad.

Examples:

Reward count 15, increased by 5 compared to previous week.

Punishment count 2, decreased by 1 compared to previous week.

---

# Forbidden Features

Do not add in MVP:

- percentages
- charts
- trend lines
- mini heatmaps
- detailed task breakdown
- comparison badges like NEW
- infinity values
- clickable card behavior

StatsSummary is informational only.

---

# Post MVP Features

Possible future additions:

## Percentage Mode

A global Stats screen display toggle may later switch some components to percentages.

Not part of MVP.

## Richer Comparison

Future versions may show:

- percentage difference
- previous period value
- trend labels
- tiny sparklines

## Clickable Cards

In the future, tapping a card could filter TopTasks by reward or punishment.

Not part of MVP.

---

# Design Intent

StatsSummary should answer:

Am I doing better or worse than before?

within one glance.

The user should immediately understand:

- current reward count
- current punishment count
- whether each number improved or worsened compared to the previous period
