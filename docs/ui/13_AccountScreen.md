# 13_AccountScreen.md

# Account Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Account Screen is the user's personal settings and profile area.

Its purpose is to:

* display account information
* provide access to application settings
* provide access to security settings
* provide access to archived tasks
* provide logout functionality

Account Screen should remain simple, lightweight and rarely visited.

Unlike Tasks Screen and Stats Screen, this screen is not intended for daily interaction.

---

# Priority

Priority:
5/10

Usage Frequency:
3/10

Visual Importance:
Medium

---

# High Level Structure

AccountScreen

```
Header

ProfileCard

SettingsSection

SecuritySection

BottomNavigation
```

---

# Layout Order

The order is fixed:

1. Header
2. ProfileCard
3. SettingsSection
4. SecuritySection
5. BottomNavigation

---

# Header

Purpose:

Display current screen title.

Layout:

[ spacer ]   Аккаунт   [ spacer ]

Rules:

* title centered
* no action buttons
* no settings icon
* no edit profile button

---

# Title

Russian:

Аккаунт

English:

Account

---

# ProfileCard

Purpose:

Display basic account information.

The card is informational only.

ProfileCard is not clickable in MVP.

---

# Structure

ProfileCard

```
Avatar

Username

RegistrationDate

Chevron
```

---

# Avatar

Display default application avatar.

MVP:

Static avatar only.

Users cannot change avatar in MVP.

---

# Username

Display current username.

Examples:

en_user1

nikolay

user123

Style:

* prominent
* medium/high emphasis

---

# Registration Date

Format:

Russian:

Участник с июня 2026

English:

Member since June 2026

Purpose:

Provide lightweight account context.

---

# Chevron

Display trailing chevron.

Purpose:

Visual consistency with other list elements.

Behavior:

No action in MVP.

ProfileCard does not open any screen.

---

# Settings Section

Purpose:

Display user-configurable preferences.

---

# Section Title

Russian:

Настройки

English:

Settings

---

# Settings Items

1. Language
2. Icon Pack
3. Archive

---

# Language Item

Layout:

Язык        Русский    >

English:

Language    Russian    >

---

# Behavior

Tap

↓

Open LanguageModal

Uses:

17_LanguageModal.md

---

# Icon Pack Item

Layout:

Набор иконок     Cookie & Whip    >

English:

Icon Pack     Cookie & Whip    >

---

# Behavior

Tap

↓

Open IconsModal

Uses:

18_IconsModal.md

---

# Archive Item

Layout:

Архив >

English:

Archive >

---

# Behavior

Tap

↓

Open ArchiveScreen

Uses:

14_ArchiveScreen.md

---

# Security Section

Purpose:

Display account security actions.

---

# Section Title

Russian:

Безопасность

English:

Security

---

# Security Items

1. Change Password
2. Logout

---

# Change Password

Layout:

Сменить пароль >

English:

Change Password >

---

# Behavior

Tap

↓

Open PasswordModal

Uses:

19_PasswordModal.md

---

# Logout

Layout:

Выйти из аккаунта >

English:

Log Out >

---

# Visual Style

Logout item uses coral text color.

Purpose:

Indicate destructive/session-ending action.

Rules:

* coral text
* no bright warning red
* visually distinct from regular settings

---

# Logout Confirmation

Logout requires confirmation.

Tap:

Выйти из аккаунта

↓

Open confirmation dialog.

---

# Confirm Logout Modal

Title:

Выйти из аккаунта?

English:

Log out?

---

# Description

Russian:

Вы сможете войти снова в любое время.

English:

You can sign back in at any time.

---

# Actions

Primary:

Выйти

Log Out

Coral button.

Secondary:

Отмена

Cancel

Neutral button.

---

# Logout Behavior

Confirm

↓

Clear authentication session

↓

Navigate to Login Screen

Uses:

15_LoginScreen.md

---

# Section Style

SettingsSection and SecuritySection use the same visual style.

Appearance:

* grouped cards
* rounded corners
* warm surface color
* subtle border
* light separation between rows

Inspired by:

iOS Settings

without looking like a system clone.

---

# Navigation

Account Screen is accessible through:

BottomNavigation

Uses:

06_BottomNavigation.md

---

# Scroll Behavior

Normally:

No scrolling required.

However:

If content exceeds screen height:

Enable vertical scrolling.

BottomNavigation remains fixed.

---

# Empty States

No empty states required.

Profile information should always exist.

---

# Loading State

Display:

* ProfileCard skeleton
* Settings rows skeleton
* Security rows skeleton

Keep page layout visible.

Do not use fullscreen spinner.

---

# Error State

Display compact inline error.

Example:

Не удалось загрузить настройки

[ Повторить ]

English:

Could not load settings

[ Retry ]

BottomNavigation remains visible.

---

# Animation

Opening modals:

* fade
* slide

Navigation:

* standard application page transition

Duration:

180-250ms

Avoid:

* bounce
* dramatic motion
* decorative effects

---

# Accessibility

Requirements:

* all rows keyboard accessible
* clear focus states
* proper labels for settings
* screen-reader friendly values

Examples:

Language: Russian

Icon Pack: Cookie & Whip

---

# Forbidden Features

Do not add in MVP:

* avatar upload
* avatar editor
* profile editing
* email editing
* account deletion
* privacy policy page
* terms of service page
* notification settings
* theme customization

---

# Post MVP Features

## Custom Avatar

Allow users to upload or choose an avatar.

---

## Account Deletion

Add account deletion flow.

Requires confirmation.

---

## Notification Settings

Enable task reminders.

---

## Application Information

Possible future section:

* version
* changelog
* privacy policy
* terms

---

## Custom Icon Pack Naming

Allow users to create custom icon packs and assign names.

---

# Design Intent

Account Screen should feel calm, simple and administrative.

The user should immediately understand:

* who is logged in
* which settings are currently active
* how to change preferences
* how to access archived tasks
* how to securely log out

without navigating through multiple layers of menus.
