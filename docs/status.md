# Project Status

Last updated: 2026-06-06

## Completed

- Phase 1: project bootstrap.
- Phase 2: backend base, SQLAlchemy, Alembic, PostgreSQL models.
- Phase 3: backend auth.
- Phase 4: frontend auth.
- Phase 5: tasks backend.
- Minimal backend tests are in place.

## Running Services

Docker Compose starts:

- PostgreSQL on `5432`.
- FastAPI backend on `8000`.
- Vite frontend on `5173`.

Start:

```bash
docker compose up --build
```

Open locally:

```text
http://localhost:5173
```

Open from a phone on the same LAN:

```text
http://LOCAL_PC_IP:5173
```

In dev, frontend derives backend URL as `http://<current-host>:8000` when `VITE_API_BASE_URL` is empty.

## Current App Behavior

- User can register with login/password/language.
- Registration sets an httpOnly auth cookie.
- User can log in, log out, and change password.
- Frontend has `/login`, `/register`, and guarded `/app/tasks`.
- `/app/tasks` is currently a placeholder showing current user/settings and logout.
- Backend tasks API supports create, edit, archive, restore, pin, unpin, list active, list archived, and details.

## Verification

Known passing checks:

```bash
docker compose exec -T backend pytest -q
npm run build
```

Current backend test count: 14 tests.

