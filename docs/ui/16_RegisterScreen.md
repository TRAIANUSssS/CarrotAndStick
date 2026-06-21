# 16_RegisterScreen.md

# Register Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Register Screen is the account creation entry point for new users.

Its purpose is to:

- create a new user account
- collect required authentication data
- let the user choose application language
- automatically choose default icon pack based on selected language
- immediately authenticate the user after successful registration

Register Screen should feel calm, simple and lightweight.

---

# Priority

Priority: 8/10

Usage Frequency: 3/10

Visual Importance: High

The screen is used rarely, but it strongly affects the first impression of the product.

---

# High Level Structure

RegisterScreen

    AuthHero

        AppIconGroup

        AppTitle

        IntroText

    RegisterForm

        UsernameInput

        EmailInput

        PasswordInput

        ConfirmPasswordInput

        LanguageSelector

        SubmitButton

    LoginLink

---

# Visual Style

Register Screen must continue the main application style.

Use:

- warm off-white background
- warm surface cards
- rounded inputs
- subtle borders
- soft shadows
- green primary button
- calm spacing
- iOS-like visual language

Avoid:

- corporate sign-up page style
- heavy onboarding
- multiple-step wizard in MVP
- social login buttons
- overly playful illustrations

---

# AuthHero

Purpose:

Create emotional continuity with the product.

Recommended structure:

App icons

Кнут и Пряник

Создайте аккаунт

English:

Carrot & Stick

Create your account

---

# Register Form

The form contains fields in this exact order:

1. Username
2. Email
3. Password
4. Confirm Password
5. Language
6. Submit Button

Do not reorder fields in MVP.

---

# UsernameInput

Label / placeholder:

Russian:

Имя пользователя

English:

Username

Rules:

- required
- minimum length: 3 characters
- maximum length: 30 characters
- allowed characters:
  - letters
  - numbers
  - underscore
  - hyphen
- whitespace-only value is invalid

Forbidden:

- spaces
- special characters outside underscore and hyphen
- empty value

---

# EmailInput

Label / placeholder:

Russian:

Email

English:

Email

Rules:

- required
- must be valid email format
- email confirmation is not required in MVP
- email is stored for future password recovery

---

# PasswordInput

Label / placeholder:

Russian:

Пароль

English:

Password

Rules:

- required
- minimum length: 8 characters
- hidden by default
- includes show/hide password toggle

---

# ConfirmPasswordInput

Label / placeholder:

Russian:

Повторите пароль

English:

Repeat Password

Rules:

- required
- must match PasswordInput
- hidden by default
- includes show/hide password toggle

---

# Password Visibility Toggle

Both password fields include show/hide password button.

Rules:

- icon-only button
- accessible label required
- toggles between visible and hidden password
- does not clear entered value

Russian labels:

Показать пароль

Скрыть пароль

English labels:

Show password

Hide password

---

# Password Match Validation

Password mismatch is shown while typing.

Russian:

Пароли не совпадают

English:

Passwords do not match

Rules:

- validation should feel soft
- do not use browser alert
- do not show aggressive red unless user has interacted with field
- SubmitButton remains disabled while passwords do not match

---

# LanguageSelector

Displayed directly on Register Screen.

Layout:

Язык      Русский     >

English:

Language      English     >

Behavior:

Tap

↓

Open LanguageModal

Uses:

17_LanguageModal.md

---

# Icon Pack Selection

Icon pack is not shown on Register Screen.

Reason:

The concept of icon packs may be confusing for new users.

Default icon pack is selected automatically based on selected language.

Suggested default mapping:

Russian:

Cookie & Whip / Пряник и кнут

English:

Carrot & Stick

Users may change icon pack later from Account Screen.

Uses:

18_IconsModal.md

---

# Submit Button

Russian:

Создать аккаунт

English:

Create Account

Style:

- primary green
- full width
- visually clear

Disabled state:

Button is disabled when:

- username is invalid
- email is invalid
- password is invalid
- passwords do not match
- language is not selected
- request is in progress

---

# Submit Behavior

On submit:

1. Validate all fields.
2. Send registration request.
3. If successful:
   - create user account
   - set selected language
   - set default icon pack based on selected language
   - authenticate user automatically
   - navigate to Tasks Screen
4. If failed:
   - show inline error
   - preserve entered username and email
   - clear password fields if appropriate

---

# Successful Registration

After successful registration:

Navigate directly to Tasks Screen.

Do not send the user back to Login Screen.

Do not require email confirmation in MVP.

---

# Login Link

Displayed below the form.

Russian:

Уже есть аккаунт? Войти

English:

Already have an account? Log in

Behavior:

Tap

↓

Navigate to Login Screen

Uses:

15_LoginScreen.md

---

# Loading State

When registration request is in progress:

- disable submit button
- show subtle loading state on submit button
- avoid full-screen spinner

Example:

Russian:

Создаём...

English:

Creating...

---

# Accessibility

Requirements:

- all inputs have labels
- language selector is keyboard accessible
- password visibility toggles have accessible labels
- validation messages are announced to screen readers
- submit button exposes disabled state
- login link is keyboard accessible

---

# Forbidden Features

Do not add in MVP:

- multi-step onboarding
- explicit icon pack selection
- social registration
- email confirmation flow
- marketing sections
- onboarding carousel
- captcha UI unless backend requires it
- terms/privacy checkbox unless legally required

---

# Post MVP Features

## Email Confirmation

Add email verification after registration.

## Social Registration

Google / Apple registration may be added later.

## Icon Pack Selection During Onboarding

A later onboarding step may let users choose icon pack more explicitly.

## Terms and Privacy

Add legal links if product becomes public.

---

# Design Intent

Register Screen should make creating an account feel quick and safe.

The user should immediately understand:

- what information is required
- how to choose language
- how to create an account
- how to return to Login Screen

without being forced through unnecessary onboarding steps.
