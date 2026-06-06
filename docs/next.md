# Handoff

## Current State

Phase 1-5 are complete.

Implemented:

- Docker Compose bootstrap.
- PostgreSQL + FastAPI + Vite React.
- SQLAlchemy models and Alembic migration.
- Backend auth with JWT httpOnly cookie.
- Frontend auth pages and guard.
- Backend tasks API.
- Backend tests for auth and tasks.

## Next Step

Phase 6: Marks backend.

Implement:

- `PUT /api/tasks/{task_id}/marks/{date}`;
- set/update mark for `reward` and `punishment`;
- delete mark row when status is `null`;
- ownership checks;
- date checks:
  - reject dates before `task.created_at::date`;
  - reject future dates;
- response shape:

```json
{
  "task_id": "...",
  "date": "2026-06-10",
  "status": "reward"
}
```

## Important Context

- `null` daily state is absence of a `task_marks` row.
- Backend receives final desired mark status; frontend toggle logic comes later.
- Existing helper `get_user_task` in `app/services/tasks.py` should be reused for ownership.
- Existing tests are run through Docker:

```bash
docker compose exec -T backend pytest -q
```

## Files To Inspect First

- `backend/app/api/routes/tasks.py`
- `backend/app/services/tasks.py`
- `backend/app/models/task_mark.py`
- `backend/tests/test_tasks.py`
- `docs/decisions.md`
- `docs/api.md`

## Known Good Verification

At the last update:

- backend tests: 14 passed;
- frontend build: passes;
- backend health: `{"status":"ok"}`;
- compose services: postgres/backend/frontend are healthy/running.

