# 17_Modals.md

# Modals Specification

Version: 1.0

Status: Locked

---

# Purpose

This document defines the common modal system and all small MVP modals used by the application.

TaskModal is not described here because it has its own dedicated specification:

12_TaskModal.md

This document covers:

- shared modal rules
- LanguageModal
- IconsModal
- PasswordModal
- ConfirmLogoutModal
- Toast

---

# Modal Philosophy

Modals should feel:

- mobile-native
- calm
- lightweight
- predictable
- iOS-like

They should never feel like desktop popups placed inside a mobile app.

---

# Modal Type

All small modals use Bottom Sheet style.

This applies to:

- LanguageModal
- IconsModal
- PasswordModal
- ConfirmLogoutModal

Do not use centered desktop-style modal windows in MVP.

---

# Desktop Behavior

Desktop uses the same centered mobile shell as the rest of the application.

Bottom Sheets remain Bottom Sheets inside that mobile shell.

Do not convert modals into desktop dialogs.

---

# Common Bottom Sheet Structure

BottomSheet

    Backdrop

    Sheet

        DragHandle

        Header

        Content

        Actions

---

# Drag Handle

Every Bottom Sheet must have a drag handle.

Appearance:

- small horizontal rounded bar
- muted gray / beige
- centered at top of sheet

Purpose:

- visually communicates sheet behavior
- makes UI feel mobile-native

---

# Backdrop

Bottom Sheet uses a soft backdrop.

Rules:

- darkened overlay is allowed
- blur is allowed if subtle
- backdrop should not feel heavy
- app content remains visually present but inactive

---

# Closing Behavior

Supported close methods:

- tap backdrop
- close button, if present
- Escape key on desktop
- completed selection/action

Backdrop tap behavior:

Always closes the modal without warning in MVP.

This includes PasswordModal even if fields contain typed data.

No unsaved changes confirmation in MVP.

---

# Height Behavior

Bottom Sheet height is based on content.

Rules:

- sheet grows with content
- if content is taller than screen, inner content scrolls
- sheet respects safe-area inset
- actions stay accessible

---

# Animation

Opening:

- sheet slides up
- backdrop fades in
- duration: 200-280ms

Closing:

- sheet slides down
- backdrop fades out
- duration: 180-240ms

Avoid:

- bounce
- elastic motion
- dramatic zoom
- shake
- confetti

---

# Shared Visual Style

Use:

- warm surface
- rounded top corners
- subtle border or shadow
- calm spacing
- clear hierarchy
- muted secondary text

Avoid:

- heavy shadows
- pure white cold surfaces
- bright destructive red
- dense desktop form layout

---

# LanguageModal

## Purpose

LanguageModal allows the user to choose application language.

Used from:

- RegisterScreen
- AccountScreen

---

## Options

MVP supports exactly two languages:

- Русский
- English

---

## Behavior

Selection applies immediately.

No Save button.

Tap language option:

1. Set language.
2. Update UI language.
3. Close modal.

---

## Structure

LanguageModal

    DragHandle

    Title

    LanguageOption[]

---

## Title

Russian:

Язык

English:

Language

---

## Option State

Each option displays:

- language name
- selected state

Selected option may use:

- checkmark
- green accent
- subtle selected background

---

## Forbidden Features

Do not add in MVP:

- language search
- regional variants
- auto-detect language
- save button

---

# IconsModal

## Purpose

IconsModal allows the user to choose the active icon pack.

Used from:

- AccountScreen

Not used during registration in MVP.

During registration, icon pack is selected automatically based on language.

---

## Options

MVP supports exactly two icon packs:

1. Cookie & Whip
2. Carrot & Stick

Russian display examples:

- Пряник и кнут
- Морковь и палка

English display examples:

- Cookie & Whip
- Carrot & Stick

---

## Behavior

Selection applies immediately.

No Save button.

Tap icon pack option:

1. Set active icon pack.
2. Update visible icons.
3. Close modal.

---

## Structure

IconsModal

    DragHandle

    Title

    IconPackOption[]

---

## Title

Russian:

Набор иконок

English:

Icon Pack

---

## Option State

Each option displays:

- icon pack name
- optional small icon preview
- selected state

Selected option may use:

- checkmark
- green accent
- subtle selected background

---

## Custom Icons

Custom icon packs are not part of MVP.

They are Post MVP.

---

# PasswordModal

## Purpose

PasswordModal allows authenticated users to change their password.

Used from:

- AccountScreen -> Security -> Change Password

---

## Structure

PasswordModal

    DragHandle

    Title

    CurrentPasswordInput

    NewPasswordInput

    ConfirmNewPasswordInput

    SaveButton

---

## Title

Russian:

Сменить пароль

English:

Change Password

---

## Fields

### Current Password

Russian:

Текущий пароль

English:

Current Password

### New Password

Russian:

Новый пароль

English:

New Password

### Confirm New Password

Russian:

Повторите новый пароль

English:

Repeat New Password

---

## Password Rules

New password:

- required
- minimum length: 8 characters

Confirm password:

- required
- must match New Password

Current password:

- required

---

## Password Visibility Toggle

All password fields include show/hide password button.

Rules:

- icon-only
- accessible label required
- toggles visibility
- does not clear input value

---

## Save Button

Russian:

Сохранить

English:

Save

Style:

- primary green
- full width

Disabled when:

- current password is empty
- new password is invalid
- confirm password does not match
- request is in progress

---

## Behavior

Tap Save:

1. Validate fields.
2. Send password change request.
3. If success:
   - close modal
   - show toast
4. If failure:
   - show inline error
   - keep fields unless security policy requires clearing them

---

## Success Toast

Russian:

Пароль изменён

English:

Password changed

---

## Error Message

Russian:

Не удалось изменить пароль

English:

Could not change password

If backend returns invalid current password:

Russian:

Текущий пароль неверный

English:

Current password is incorrect

---

# ConfirmLogoutModal

## Purpose

ConfirmLogoutModal prevents accidental logout.

Used from:

- AccountScreen -> Security -> Log Out

---

## Structure

ConfirmLogoutModal

    DragHandle

    Title

    Description

    PrimaryLogoutButton

    CancelButton

---

## Title

Russian:

Выйти из аккаунта?

English:

Log out?

---

## Description

Russian:

Вы сможете войти снова в любое время.

English:

You can sign back in at any time.

---

## Primary Action

Russian:

Выйти

English:

Log Out

Style:

- coral
- destructive but not aggressive

Behavior:

- clears authentication session
- navigates to LoginScreen

---

## Secondary Action

Russian:

Отмена

English:

Cancel

Style:

- neutral

Behavior:

- closes modal

---

# Toast

## Purpose

Toast provides quiet temporary feedback.

Used for:

- unavailable forgot password feature
- failed optimistic actions
- password changed
- settings saved
- generic small feedback

---

## Position

Toast appears near the bottom of the screen.

Placement:

- above BottomNavigation when BottomNavigation is visible
- above safe-area inset
- centered horizontally inside mobile shell

---

## Duration

Default:

2-3 seconds

Longer messages may remain slightly longer, but should not block interaction.

---

## Visual Style

Toast should be:

- compact
- warm dark or warm surface depending on theme
- rounded
- subtle shadow
- readable
- non-invasive

Avoid:

- full-width alerts
- browser alert
- loud colors
- blocking modal behavior

---

## Toast Examples

Forgot password placeholder:

Russian:

Функция скоро появится

English:

This feature is coming soon

Password changed:

Russian:

Пароль изменён

English:

Password changed

Save failure:

Russian:

Не удалось сохранить изменения

English:

Could not save changes

---

# Accessibility

All modals must:

- move focus into modal on open
- restore focus on close
- support Escape close on desktop
- have accessible title
- expose modal semantics
- ensure buttons have accessible names
- trap focus while open when appropriate

Toast:

- should be announced politely to screen readers
- should not steal focus

---

# Common Forbidden Features

Do not add in MVP:

- nested modals
- draggable resizing
- desktop centered modals
- complex modal routing
- confirmation on backdrop close
- heavy glassmorphism
- large illustrations in small modals

---

# Post MVP Features

## Custom Icon Packs

Allow users to create or upload custom icon sets.

## More Languages

Add additional languages.

## Password Recovery

Forgot password flow from LoginScreen.

## Stronger Native Haptics

If the app becomes native/PWA-like, modals and critical actions may use platform haptics.

---

# Design Intent

The modal system should feel like a calm extension of the mobile app.

The user should never feel taken out of context.

Every modal should be:

- focused
- short
- reversible
- visually consistent
- easy to dismiss
