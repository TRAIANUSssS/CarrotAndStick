# Decisions

## Product Scope

- MVP must stay a self-discipline diary, not a large task manager.
- No categories, tags, deadlines, reminders, charts, percentages, streaks, drag and drop, PWA, offline mode, OAuth, email, or password recovery in MVP.

## Data and Identity

- Use UUID primary keys.
- Each user can only access their own tasks, marks, settings, and stats.
- Ownership must be checked in every endpoint that works with user-owned data.

## Auth

- Use JWT in an httpOnly cookie.
- Do not store auth token in `localStorage`.
- Cookie name: `carrot_stick_session`.
- Password hashing: Argon2 through `pwdlib`.
- Login is unique; email is not used.

## Task Marks

- Supported mark statuses: `reward`, `punishment`, `null`.
- Only `reward` and `punishment` are physically stored.
- `null` means no `task_marks` row exists for `(task_id, date)`.
- Absence of a mark is not a failure and must not count as punishment.
- Past dates are allowed.
- Future marks should be forbidden in Phase 6.
- Marks before `task.created_at::date` should be forbidden in Phase 6.

## Tasks

- Tasks are archived instead of physically deleted.
- Archived tasks disappear from the main task list.
- Archived tasks remain available for statistics.
- Archived tasks can be restored.
- Pin sorting:
  - pinned tasks first;
  - latest pinned task first among pinned;
  - then normal tasks by creation order.

## Dates

- Daily marks use plain `date` in `YYYY-MM-DD`.
- Frontend sends the user's local date.
- Backend stores marks as PostgreSQL `date`.
- `created_at`, `updated_at`, `archived_at`, and `pinned_at` use `timestamptz`.
- Week is Monday to Sunday in MVP.

## Icons

- Icon packs are predefined.
- RU default: `cookie_whip`.
- EN default: `carrot_stick`.
- Frontend should use icon pack abstraction, not hardcoded asset paths inside product components.
- Navigation icons are in `frontend/src/assets/navigation`.
- Navigation SVGs contain embedded PNGs; use CSS mask if they need monochrome recoloring.

## Dev Network

- Vite listens on `0.0.0.0`.
- If `VITE_API_BASE_URL` is empty, frontend derives API URL from current host:
  - `http://localhost:5173` -> `http://localhost:8000`
  - `http://LOCAL_PC_IP:5173` -> `http://LOCAL_PC_IP:8000`
- VPN or Windows Firewall can block LAN access from phone.

