# 12_TaskModal.md

# TaskModal Specification

Version: 1.0

Status: Locked

---

# Purpose

TaskModal is the main task management surface.

It is used to:

- create a task
- edit task title
- pin or unpin a task
- view basic task statistics
- view recent task history
- archive a task

TaskModal is not used for archived tasks in MVP. Archived tasks are restored directly from Archive Screen.

---

# Priority

Priority: 9/10

Usage Frequency: 7/10

Visual Importance: High

TaskModal is the main secondary interaction surface after TaskRow.

---

# Modal Type

TaskModal uses a mobile Bottom Sheet.

It should feel native and iOS-like.

Do not use browser-native dialogs.

Do not use a desktop-centered modal on mobile.

---

# Height Behavior

The Bottom Sheet height is based on content.

Rules:

- sheet grows with content
- if content exceeds available height, inner content becomes scrollable
- action buttons remain fixed at the bottom of the sheet
- sheet must respect safe-area inset

---

# Modes

TaskModal has two MVP modes:

1. CreateTaskModal
2. EditTaskModal

Future mode:

- TaskAnalyticsModal / Analytics tab, Post MVP

---

# CreateTaskModal

Used when user taps:

+ Task / + Задача

## Create Structure

CreateTaskModal

    Title

    TaskNameInput

    PinCheckbox

    PrimaryCreateButton

## Create Title

Russian:

Новая задача

English:

New Task

## Create Fields

### Task Name

Single input field.

Rules:

- required
- max length: 80 characters
- empty value is invalid
- whitespace-only value is invalid
- primary button disabled while invalid

### Pin Checkbox

Label:

Russian:

📌 Закрепить

English:

📌 Pin task

Behavior:

If checked, task is created as pinned.

If unchecked, task is created as regular.

## Create Button

Russian:

Создать

English:

Create

Style:

- primary green
- fixed near bottom of sheet
- disabled if task name is empty or invalid

---

# EditTaskModal

Used when user taps an existing TaskRow.

## Edit Structure - unchanged title

EditTaskModal

    Title

    TaskNameInput

    PinUnpinAction

    TaskStats

    TaskHistory

    ArchiveAction

    ArchiveMutedText

## Edit Structure - changed title

If task title was changed:

EditTaskModal

    Title

    TaskNameInput

    PinUnpinAction

    TaskStats

    TaskHistory

    SaveButton

    ArchiveAction

---

# Edit Title

Russian:

Задача

English:

Task

---

# TaskNameInput

The task title can be edited.

Rules:

- max length: 80 characters
- empty value is invalid
- whitespace-only value is invalid
- changes are not saved automatically
- saving requires pressing Save button
- if user closes modal without saving, changes are discarded
- no confirmation dialog is shown in MVP

---

# Save Button

Displayed only when task title differs from the saved task title.

Russian:

Сохранить

English:

Save

Behavior:

- saves new task title
- after successful save, button disappears
- archive action remains visible below it

Visual behavior:

Save button slides in from the bottom action area.

Fixed bottom action area when visible:

[ Save ]

[ Archive ]

---

# Pin / Unpin Action

Pin management happens inside EditTaskModal.

TaskRow never contains a pin button.

If task is not pinned:

Russian:

📌 Закрепить задачу

English:

📌 Pin task

If task is pinned:

Russian:

📌 Открепить задачу

English:

📌 Unpin task

Behavior:

- action is saved immediately when tapped
- does not require pressing Save
- optimistic update may be used
- on failure rollback and show quiet toast

---

# TaskStats

Purpose:

Show basic totals for this task.

Recommended content:

- created date
- total rewards
- total punishments

Example:

Created: 12 June 2026

🍪 53

🪢 12

Rules:

- informational only
- no charts in MVP
- no percentages in MVP

---

# TaskHistory

Show recent task history.

Uses:

03_TaskHistory.md

Rules:

- display last 7 calendar days
- display only days since task creation
- display-only
- not editable inside modal

---

# Editing Historical Marks

TaskModal does not edit historical marks directly.

To change a past mark:

1. User returns to Tasks Screen.
2. User selects a previous date with DatePicker.
3. User changes reward/punishment from TaskRow.

Reason:

This keeps the modal simple and avoids adding a calendar editor.

---

# Archive Action

Archive action is available in EditTaskModal.

Button text:

Russian:

Архивировать

English:

Archive

Style:

- coral / destructive-secondary
- not aggressive red
- visually less dominant than primary Save button when Save is visible

Behavior:

- archives task immediately
- no confirmation dialog in MVP
- closes modal after success
- archived task disappears from Tasks Screen
- archived task remains in statistics
- archived task can be restored from Archive Screen

---

# Archive Muted Text

Displayed when task title is unchanged and Save button is not visible.

Russian:

Вы всегда сможете восстановить эту задачу из архива

English:

You can always restore this task from the archive

Style:

- small
- muted
- placed near ArchiveAction
- visually secondary

If Save button is visible, this muted text may be hidden to preserve space.

---

# Bottom Action Area

Action buttons are fixed to the bottom of the Bottom Sheet.

Rules:

- Save button appears above ArchiveAction when title has unsaved changes
- ArchiveAction remains visible
- buttons respect safe area
- content scrolls behind/above fixed action area with proper padding

Changed title state:

[ Save ]

[ Archive ]

Unchanged title state:

[ Archive ]

[ muted restore text ]

---

# Archived Tasks

Archived tasks do not open TaskModal in MVP.

Archive Screen displays archived tasks as a list.

Each archived task row contains:

- task title
- date archived
- restore button

No modal is required for archived task restore in MVP.

---

# Close Behavior

Closing EditTaskModal with unsaved title changes:

- discard changes
- no confirmation dialog

Closing CreateTaskModal with typed text:

- discard changes
- no confirmation dialog in MVP

---

# Validation

Task name validation:

- required
- trimmed value must be non-empty
- max length: 80 characters

Validation UI:

- disable primary button if invalid
- optionally show subtle validation text after interaction

Do not show blocking browser alert.

---

# Loading State

For EditTaskModal:

If task details are loading:

- show skeleton for input
- show skeleton for stats
- show skeleton for history
- keep modal shell visible

For CreateTaskModal:

No loading state required before opening.

---

# Error State

If loading task details fails:

Show compact error message inside modal.

Example:

Russian:

Не удалось загрузить задачу

[ Повторить ]

English:

Could not load task

[ Retry ]

---

# API Behavior

Create:

- optimistic UI optional
- after successful create, close modal and show new task in list

Edit title:

- save only after pressing Save
- rollback not needed if request fails before updating canonical state
- show quiet toast on failure

Pin/unpin:

- immediate save
- optimistic update allowed
- rollback on failure

Archive:

- immediate save
- no confirmation
- close modal after success
- show quiet toast on failure

---

# Animation

Opening:

- bottom sheet slides up
- fade backdrop
- duration: 200-280ms

Closing:

- bottom sheet slides down
- backdrop fades out
- duration: 180-240ms

Save button appearance:

- slide + fade
- duration: 180-220ms

Pin/unpin:

- small state transition
- no large animation

Avoid:

- bounce
- confetti
- shake
- dramatic movement

---

# Accessibility

Requirements:

- focus should move into modal when opened
- focus should be trapped inside modal while open
- Escape closes modal on desktop
- close button must have accessible label
- inputs must have labels
- icon-only actions must have aria-label
- action buttons must be reachable by keyboard

---

# Visual Style

TaskModal should match the warm iOS-like product style.

Use:

- warm surface
- rounded top corners
- subtle border/shadow
- calm spacing
- clear hierarchy

Avoid:

- desktop form layout
- heavy shadows
- dense settings-panel look
- too many colors

---

# Forbidden Features

Do not add in MVP:

- task description
- categories
- tags
- deadlines
- reminders
- direct history editing
- task analytics tab
- permanent delete
- archived task modal
- custom task icons
- drag and drop controls

---

# Post MVP Features

## Task Analytics

A future analytics mode/tab may show:

- task-specific heatmap
- streaks
- best period
- worst period
- reward/punishment trend
- detailed history

Could be opened from TopTasks or TaskModal.

## Custom Task Icon

Allow user to choose emoji/sticker/icon for a task.

Inspired by Telegram topic icons.

## Permanent Delete

May be added later with strong confirmation.

Not part of MVP.

## Direct History Editing

Could allow editing marks from a calendar inside TaskModal.

Not part of MVP.

---

# Design Intent

TaskModal should feel like a focused task control panel.

The user should be able to quickly:

- create a task
- rename a task
- pin or unpin a task
- see basic task history
- archive a task

without leaving the calm mobile flow of the application.
