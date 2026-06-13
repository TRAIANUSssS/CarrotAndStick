# Carrot & Stick

Mobile-first habit tracker based on daily `reward` / `punishment` / `null` marks.

## Local Development

```bash
docker compose up --build
```

If you want to run services without Docker:

```powershell
Copy-Item .env.example .env
```

For local host-based runs, PostgreSQL must be available on `localhost:5432`.
Then update `DATABASE_URL` in `.env`:

```text
DATABASE_URL=postgresql+psycopg://carrot_stick:carrot_stick@localhost:5432/carrot_stick
```

In `docker compose`, PostgreSQL is used only on the internal Docker network and is not published to the host by default.

Install dependencies:

```powershell
python -m venv .venv
.\.venv\Scripts\python -m pip install -r backend\requirements.txt
cd frontend
npm install
```

Backend:

```powershell
.\.venv\Scripts\python -m alembic -c backend\alembic.ini upgrade head
.\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload
```

Frontend:

```powershell
cd frontend
npm run dev -- --host 0.0.0.0 --port 5173
```

Open on this machine:

```text
http://localhost:5173
```

Open from a phone on the same network:

```text
http://LOCAL_PC_IP:5173
```

In dev mode, the frontend derives the backend URL from the current host when `VITE_API_BASE_URL` is empty. For example, opening `http://192.168.1.45:5173` makes API calls to `http://192.168.1.45:8000`.

For production, set explicit values in `.env`, especially `APP_ENV=prod`, `JWT_SECRET`, `COOKIE_SECURE=true`, and `CORS_ORIGINS`.
