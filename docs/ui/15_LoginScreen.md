# 15_LoginScreen.md

# Login Screen Specification

Version: 1.0

Status: Locked

---

# Purpose

Login Screen is the entry point for existing users.

Its purpose is to:

- authenticate the user
- preserve the warm product feeling before entering the app
- provide a clear path to registration
- provide a placeholder for future password recovery

Login Screen should be calm, minimal and fast.

---

# Priority

Priority: 8/10

Usage Frequency: 4/10

Visual Importance: High

The screen is not used daily by authenticated users, but it strongly affects the first impression of the product.

---

# High Level Structure

LoginScreen

    AuthHero

        AppIconGroup

        AppTitle

        WelcomeText

    LoginForm

        LoginOrEmailInput

        PasswordInput

        ForgotPasswordButton

        SubmitButton

    RegisterLink

---

# Visual Style

Login Screen must continue the main application style.

Use:

- warm off-white background
- warm surface cards
- rounded inputs
- soft shadows
- green primary button
- calm spacing
- iOS-like visual language

Avoid:

- corporate auth page style
- dark background
- sharp input boxes
- heavy borders
- social login buttons in MVP

---

# AuthHero

Purpose:

Create emotional continuity with the product.

Recommended structure:

App icons

Кнут и Пряник

Добро пожаловать обратно

English:

Carrot & Stick

Welcome back

---

# App Icon Group

Display product icons.

Example:

Cookie + Whip

or

Carrot + Stick

The icons should use the current/default icon pack.

If no user preference is known before login, use the default pack.

---

# App Title

Russian:

Кнут и Пряник

English:

Carrot & Stick

Style:

- centered
- prominent
- friendly
- not oversized

---

# Welcome Text

Russian:

Добро пожаловать обратно

English:

Welcome back

Style:

- muted
- secondary
- short

---

# Login Form

The form contains:

- LoginOrEmailInput
- PasswordInput
- ForgotPasswordButton
- SubmitButton

---

# LoginOrEmailInput

Label / placeholder:

Russian:

Логин или Email

English:

Login or Email

Rules:

- required
- trimmed value must be non-empty
- supports username login
- supports email login
- value remains after failed login attempt

---

# PasswordInput

Label / placeholder:

Russian:

Пароль

English:

Password

Rules:

- required
- trimmed value must be non-empty
- password value is cleared after failed login attempt
- password is hidden by default

---

# Password Visibility Toggle

PasswordInput includes show/hide password button.

Purpose:

Reduce typing frustration on mobile.

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

# Forgot Password

Visible as a small text button.

Russian:

Забыли пароль?

English:

Forgot password?

MVP behavior:

Tap

↓

Show quiet toast.

Russian toast:

Функция скоро появится

English toast:

This feature is coming soon

No password recovery form in MVP.

---

# Submit Button

Russian:

Войти

English:

Log In

Style:

- primary green
- full width
- visually clear

Disabled state:

Button is disabled when:

- login/email field is empty
- password field is empty
- request is in progress

---

# Submit Behavior

On submit:

1. Validate fields.
2. Send login request.
3. If successful:
   - store authenticated session via backend cookie/session mechanism
   - navigate to Tasks Screen
4. If failed:
   - show error message
   - keep login/email field value
   - clear password field

---

# Login Error

Generic error message:

Russian:

Неверный email или пароль

English:

Invalid email or password

Rules:

- do not reveal whether login/email exists
- do not use browser alert
- display inline error near form
- keep tone calm

---

# Auth Persistence

After successful login:

The user should remain authenticated after closing and reopening the browser.

Authentication is handled through the existing backend/session/cookie system.

No Remember me checkbox in MVP.

---

# Register Link

Displayed below the form.

Russian:

Нет аккаунта? Создать аккаунт

English:

No account? Create account

Behavior:

Tap

↓

Navigate to Register Screen

Uses:

16_RegisterScreen.md

---

# Social Login

Not included in MVP.

Do not add:

- Google login
- Apple login
- GitHub login
- social auth buttons

---

# Loading State

When login request is in progress:

- disable form inputs or submit button
- show subtle loading state on submit button
- do not replace whole screen with spinner

Example:

Входим...

English:

Logging in...

---

# Error State

Use inline form error.

No blocking modal.

No full-screen error.

No browser alert.

---

# Keyboard Behavior

Mobile:

- focus first input when appropriate
- pressing Enter / Done submits if form valid
- keyboard must not hide submit button permanently

Desktop:

- Enter submits form
- Tab order is logical

---

# Accessibility

Requirements:

- all inputs have labels
- password visibility toggle has accessible label
- submit button exposes disabled state
- error message is announced to screen readers
- register link is keyboard accessible
- forgot password button is keyboard accessible

---

# Animation

Allowed:

- gentle form entrance fade
- button press scale
- error fade-in
- screen transition fade/slide

Recommended duration:

150-250ms

Avoid:

- shake animation on error
- aggressive bounce
- flashy effects

---

# Forbidden Features

Do not add in MVP:

- social login
- remember me checkbox
- email confirmation flow
- password recovery form
- marketing sections
- onboarding carousel
- dark theme
- captcha UI unless backend requires it

---

# Post MVP Features

## Password Recovery

Forgot Password should open a real password recovery flow.

Requires email.

## Email Confirmation

Registration may require email confirmation in the future.

## Social Login

Google / Apple login may be added later.

## Two-Factor Authentication

Not part of MVP.

---

# Design Intent

Login Screen should make returning to the app feel effortless.

The user should immediately understand:

- where to enter login or email
- where to enter password
- how to log in
- how to create an account

without being distracted by non-essential options.
