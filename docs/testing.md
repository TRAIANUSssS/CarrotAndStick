# Testing

## Backend

Run tests from project root:

```bash
docker compose exec -T backend pytest -q
```

Current tests:

- `backend/tests/test_auth.py`
- `backend/tests/test_tasks.py`
- `backend/tests/test_stats.py`

Covered:

- register/login/logout/me/change-password;
- default icon pack by language;
- duplicate login;
- invalid language;
- auth-required behavior;
- task create/edit/details/archive/restore;
- active vs archived task lists;
- pin/unpin sorting;
- history omits dates before task creation;
- task totals;
- mark create/update/delete flow;
- mark date validation for pre-creation and future dates;
- stats summary period aggregation;
- stats summary auth and user scoping;
- ownership checks;
- blank task name validation.

Test users use unique login prefixes and are cleaned up after each test through `cleanup_users`.

## Frontend

Current verification:

```bash
cd frontend
npm run build
```

No frontend test framework is installed yet.

Add frontend tests later around the new task UI. Useful next coverage:

- auth guard redirects;
- task card reward/punishment click behavior;
- add/edit/archive task modal flows;
- archived tasks UI;
- summary period rotation and rendering;
- date picker state and refresh behavior.

## Manual Smoke

Useful manual checks:

```text
http://localhost:5173/register
http://localhost:5173/login
http://localhost:5173/app/tasks
http://localhost:5173/app/tasks/archived
```

Backend health:

```bash
curl http://localhost:8000/api/health
```
