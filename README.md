# Carrot & Stick

Mobile-first habit tracker based on daily `reward` / `punishment` / `null` marks.

## Local Development

```bash
docker compose up --build
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

