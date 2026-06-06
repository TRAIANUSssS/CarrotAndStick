# API

Base URL in local development:

```text
http://localhost:8000
```

All authenticated requests use httpOnly cookie auth. Frontend requests must use `credentials: "include"`.

## Health

### GET `/api/health`

Response:

```json
{
  "status": "ok"
}
```

## Auth

### POST `/api/auth/register`

Request:

```json
{
  "login": "user123",
  "password": "secret-password",
  "language": "ru"
}
```

Response: `201`

```json
{
  "user": {
    "id": "...",
    "login": "user123"
  },
  "settings": {
    "language": "ru",
    "icon_pack": "cookie_whip"
  }
}
```

Sets `carrot_stick_session` httpOnly cookie.

### POST `/api/auth/login`

Request:

```json
{
  "login": "user123",
  "password": "secret-password"
}
```

Response: same shape as register.

### POST `/api/auth/logout`

Response: `204`

Clears auth cookie.

### GET `/api/auth/me`

Response:

```json
{
  "user": {
    "id": "...",
    "login": "user123"
  },
  "settings": {
    "language": "ru",
    "icon_pack": "cookie_whip"
  }
}
```

### POST `/api/auth/change-password`

Request:

```json
{
  "old_password": "old-password",
  "new_password": "new-password"
}
```

Response: `204`

## Tasks

### GET `/api/tasks?date=YYYY-MM-DD`

Returns active tasks for the current user.

Response:

```json
{
  "items": [
    {
      "id": "...",
      "name": "Read book",
      "created_at": "2026-06-06T10:00:00Z",
      "archived_at": null,
      "is_pinned": true,
      "pinned_at": "2026-06-06T11:00:00Z",
      "selected_date_status": null,
      "history": [
        {
          "date": "2026-06-06",
          "status": "reward"
        }
      ]
    }
  ]
}
```

Rules:

- active list excludes archived tasks;
- history is at most 7 days;
- history does not include dates before `task.created_at::date`;
- missing mark is returned as `null`.

### POST `/api/tasks`

Request:

```json
{
  "name": "Read book"
}
```

Response: `201`

```json
{
  "id": "...",
  "name": "Read book",
  "created_at": "...",
  "archived_at": null,
  "is_pinned": false,
  "pinned_at": null
}
```

### PATCH `/api/tasks/{task_id}`

Request:

```json
{
  "name": "Read 20 pages"
}
```

Response: task object.

### POST `/api/tasks/{task_id}/archive`

Archives task by setting `archived_at`.

Response: task object.

### POST `/api/tasks/{task_id}/restore`

Restores task by clearing `archived_at`.

Response: task object.

### GET `/api/tasks/archived`

Returns archived tasks for current user.

Response:

```json
[
  {
    "id": "...",
    "name": "Read book",
    "created_at": "...",
    "archived_at": "...",
    "is_pinned": false,
    "pinned_at": null
  }
]
```

### POST `/api/tasks/{task_id}/pin`

Sets `is_pinned = true` and updates `pinned_at`.

Response: task object.

### POST `/api/tasks/{task_id}/unpin`

Sets `is_pinned = false` and clears `pinned_at`.

Response: task object.

### GET `/api/tasks/{task_id}`

Returns task details.

Response:

```json
{
  "id": "...",
  "name": "Read book",
  "created_at": "...",
  "archived_at": null,
  "is_pinned": false,
  "pinned_at": null,
  "total_reward": 48,
  "total_punishment": 9
}
```

## Marks

### PUT `/api/tasks/{task_id}/marks/{date}`

Creates, updates, or removes a mark for the given task and date.

Path:

```text
date = YYYY-MM-DD
```

Request:

```json
{
  "status": "reward"
}
```

Allowed `status` values:

- `"reward"`
- `"punishment"`
- `null` to remove the existing mark

Response:

```json
{
  "task_id": "...",
  "date": "2026-06-06",
  "status": "reward"
}
```

Rules:

- backend accepts the final state, frontend handles toggle behavior;
- user can edit past dates;
- user cannot set a mark before `task.created_at::date`;
- user cannot set a mark for a future date;
- task ownership is enforced the same way as other task endpoints;
- `null` is represented by deleting the `task_marks` row.
