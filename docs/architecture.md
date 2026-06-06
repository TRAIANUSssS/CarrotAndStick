# Architecture

## Stack

- Frontend: React + Vite + TypeScript.
- Backend: FastAPI + SQLAlchemy + Alembic.
- Database: PostgreSQL.
- Auth: JWT stored in httpOnly cookie.
- Local runtime: Docker Compose.

## Repository Layout

```text
backend/
  alembic/
  app/
    api/
      routes/
    core/
    db/
    models/
    schemas/
    scripts/
    services/
    main.py
  tests/

frontend/
  src/
    api/
    components/
    assets/
    features/
    i18n/
    pages/
    router/
```

## Backend Pattern

- `app/api/routes/*`: HTTP endpoints.
- `app/schemas/*`: Pydantic request/response schemas.
- `app/services/*`: business logic.
- `app/scripts/*`: repeatable local maintenance and demo-data scripts.
- `app/models/*`: SQLAlchemy ORM models.
- `app/api/deps.py`: shared FastAPI dependencies, including DB session and current user.
- `app/db/session.py`: SQLAlchemy engine/session factory.

Routes should stay thin. Ownership checks and reusable behavior should live in services.

## Frontend Pattern

- `src/api/client.ts`: fetch wrapper with `credentials: "include"`.
- `src/api/auth.ts`: typed auth API.
- `src/api/tasks.ts` and `src/api/stats.ts`: typed task and summary API.
- `src/components/*`: shared shell, modal, and navigation UI.
- `src/features/auth`: auth context, forms, and guard.
- `src/router/AppRouter.tsx`: app routes.
- `src/i18n`: RU/EN dictionaries.

Do not hardcode user-facing RU/EN strings in components unless they are temporary placeholders.

## Data Model

Main entities:

- `User`
- `UserSettings`
- `Task`
- `TaskMark`

All primary keys use UUID.

`TaskMark.status` stores only:

- `reward`
- `punishment`

The `null` daily state is represented by absence of a `task_marks` row.
