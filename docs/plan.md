# Кнут и Пряник / Carrot & Stick — план реализации для Codex

## 1. Цель

Реализовать MVP mobile-first веб-приложения для отслеживания повторяющихся задач по механике reward / punishment / null.

Приложение должно поддерживать:

- регистрацию и вход по логину и паролю;
- httpOnly cookie auth;
- отдельные данные для каждого пользователя;
- создание, редактирование, закрепление и архивирование задач;
- выставление статуса задачи за выбранную дату;
- статистику по периодам;
- локализацию RU/EN;
- предустановленные наборы иконок;
- запуск через Docker Compose;
- возможность открыть frontend с телефона в локальной сети.

---

## 2. Зафиксированный стек

```text
Frontend: React + Vite + TypeScript
Backend: FastAPI + Python
DB: PostgreSQL
Auth: httpOnly cookie + JWT/session token
Deploy/local: Docker Compose
```

Рекомендуемые библиотеки:

### Backend

```text
fastapi
uvicorn[standard]
sqlalchemy
alembic
psycopg[binary]
pydantic
pydantic-settings
python-jose[cryptography] или PyJWT
passlib[bcrypt] или pwdlib[argon2]
python-multipart
```

### Frontend

```text
react
react-dom
react-router-dom
vite
typescript
```

Опционально:

```text
@tanstack/react-query
zustand
clsx
```

Для MVP можно обойтись без UI-библиотеки и сделать собственные простые компоненты.

---

## 3. Структура репозитория

Рекомендуемая структура:

```text
carrot-stick-tracker/
  backend/
    app/
      api/
        routes/
      core/
      db/
      models/
      schemas/
      services/
      main.py
    alembic/
    alembic.ini
    Dockerfile
    pyproject.toml
    .env.example

  frontend/
    src/
      api/
      assets/
        iconpacks/
          cookie_whip/
            reward.svg
            punishment.svg
          carrot_stick/
            reward.svg
            punishment.svg
      components/
      features/
        auth/
        tasks/
        stats/
        account/
      i18n/
        ru.ts
        en.ts
      layouts/
      pages/
      router/
      types/
      utils/
      main.tsx
    Dockerfile
    package.json
    vite.config.ts
    .env.example

  docs/
    concept.md
    plan.md

  docker-compose.yml
  README.md
```

---

## 4. Docker Compose

Docker Compose должен поднимать:

- PostgreSQL;
- backend;
- frontend.

Frontend должен быть доступен не только с компьютера, но и с телефона в локальной сети.

Для Vite dev server нужно слушать `0.0.0.0`.

Пример:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: carrot_stick
      POSTGRES_USER: carrot_stick
      POSTGRES_PASSWORD: carrot_stick
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build:
      context: ./backend
    environment:
      DATABASE_URL: postgresql+psycopg://carrot_stick:carrot_stick@postgres:5432/carrot_stick
      JWT_SECRET: change-me
      JWT_EXPIRES_MINUTES: 43200
      COOKIE_SECURE: "false"
      COOKIE_SAMESITE: lax
      CORS_ORIGINS: http://localhost:5173,http://127.0.0.1:5173
    ports:
      - "8000:8000"
    depends_on:
      - postgres
    command: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app

  frontend:
    build:
      context: ./frontend
    ports:
      - "5173:5173"
    depends_on:
      - backend
    command: npm run dev -- --host 0.0.0.0
    volumes:
      - ./frontend:/app
      - /app/node_modules

volumes:
  postgres_data:
```

После запуска пользователь должен иметь возможность открыть приложение с телефона:

```text
http://LOCAL_PC_IP:5173
```

Например:

```text
http://192.168.1.45:5173
```

Важно: телефон и компьютер должны быть в одной сети.

---

## 5. Backend architecture

### 5.1. Основные сущности

- User
- UserSettings
- Task
- TaskMark

### 5.2. Таблица users

Поля:

```text
id: UUID или BIGSERIAL primary key
login: string, unique, indexed
password_hash: string
created_at: timestamptz
updated_at: timestamptz
```

Требования:

- login уникальный;
- пароль хранить только в виде hash;
- plaintext password никогда не сохранять и не логировать.

### 5.3. Таблица user_settings

Поля:

```text
id: UUID или BIGSERIAL primary key
user_id: FK users.id, unique
language: string // ru | en
icon_pack: string // cookie_whip | carrot_stick
created_at: timestamptz
updated_at: timestamptz
```

Правила по умолчанию:

```text
language = ru → icon_pack = cookie_whip
language = en → icon_pack = carrot_stick
```

Но после регистрации пользователь может выбрать любой доступный icon pack независимо от языка.

### 5.4. Таблица tasks

Поля:

```text
id: UUID или BIGSERIAL primary key
user_id: FK users.id
name: string
created_at: timestamptz
updated_at: timestamptz
archived_at: timestamptz nullable
is_pinned: boolean default false
pinned_at: timestamptz nullable
```

Индексы:

```text
(user_id)
(user_id, archived_at)
(user_id, is_pinned, pinned_at)
```

Правила:

- задачи не удаляются физически в MVP;
- архивирование = заполнение `archived_at`;
- восстановление = `archived_at = null`;
- закрепление = `is_pinned = true`, `pinned_at = now()`;
- открепление = `is_pinned = false`, `pinned_at = null`.

### 5.5. Таблица task_marks

Поля:

```text
id: UUID или BIGSERIAL primary key
task_id: FK tasks.id
user_id: FK users.id
mark_date: date
status: string // reward | punishment
created_at: timestamptz
updated_at: timestamptz
```

Ограничения:

```text
unique(task_id, mark_date)
status in ('reward', 'punishment')
```

`null`-статус физически не хранится. Если записи нет, значит состояние за день пустое.

Зачем хранить `user_id` в `task_marks`:

- проще и быстрее фильтровать статистику по пользователю;
- можно дополнительно проверять владение;
- удобнее строить индексы.

Индексы:

```text
(user_id, mark_date)
(task_id, mark_date)
(user_id, status, mark_date)
```

---

## 6. Auth

### 6.1. Подход

Использовать JWT или session token в httpOnly cookie.

Cookie параметры для локальной разработки:

```text
HttpOnly: true
Secure: false
SameSite: lax
Path: /
```

Для production:

```text
HttpOnly: true
Secure: true
SameSite: lax или strict
Path: /
```

### 6.2. Эндпоинты авторизации

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
```

### 6.3. POST /api/auth/register

Request:

```json
{
  "login": "user123",
  "password": "password",
  "language": "ru"
}
```

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

После регистрации можно сразу выставить auth cookie.

Важно: на странице регистрации нужно показать предупреждение, что восстановление пароля в MVP не предусмотрено.

### 6.4. POST /api/auth/login

Request:

```json
{
  "login": "user123",
  "password": "password"
}
```

Response аналогичен register.

### 6.5. POST /api/auth/logout

Удаляет cookie.

### 6.6. GET /api/auth/me

Возвращает текущего пользователя и настройки.

Если cookie нет или токен невалиден — `401`.

### 6.7. POST /api/auth/change-password

Request:

```json
{
  "old_password": "old",
  "new_password": "new"
}
```

Проверить старый пароль, затем обновить hash.

---

## 7. API задач

### 7.1. GET /api/tasks

Возвращает активные задачи пользователя для главной страницы.

Query params:

```text
date=YYYY-MM-DD
```

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
      "pinned_at": "2026-06-10T10:00:00Z",
      "selected_date_status": "reward",
      "history": [
        { "date": "2026-06-06", "status": "reward" },
        { "date": "2026-06-07", "status": null },
        { "date": "2026-06-08", "status": "reward" },
        { "date": "2026-06-09", "status": "punishment" },
        { "date": "2026-06-10", "status": null }
      ]
    }
  ]
}
```

Сортировка:

```text
1. is_pinned desc
2. pinned_at desc nulls last
3. created_at asc
```

История:

- максимум 7 дней;
- не включать даты до `task.created_at::date`;
- отсутствующая отметка = `null`.

### 7.2. POST /api/tasks

Request:

```json
{
  "name": "Read book"
}
```

Создает активную задачу.

### 7.3. PATCH /api/tasks/{task_id}

Request:

```json
{
  "name": "Read 20 pages"
}
```

Редактирует название задачи.

### 7.4. POST /api/tasks/{task_id}/archive

Архивирует задачу.

Физически не удалять.

### 7.5. POST /api/tasks/{task_id}/restore

Восстанавливает задачу из архива.

### 7.6. GET /api/tasks/archived

Возвращает архивные задачи пользователя.

### 7.7. POST /api/tasks/{task_id}/pin

Закрепляет задачу:

```text
is_pinned = true
pinned_at = now()
```

### 7.8. POST /api/tasks/{task_id}/unpin

Открепляет задачу:

```text
is_pinned = false
pinned_at = null
```

### 7.9. GET /api/tasks/{task_id}

Возвращает детали задачи:

```json
{
  "id": "...",
  "name": "Read book",
  "created_at": "2026-06-06T10:00:00Z",
  "archived_at": null,
  "is_pinned": false,
  "total_reward": 48,
  "total_punishment": 9
}
```

---

## 8. API отметок

### 8.1. PUT /api/tasks/{task_id}/marks/{date}

Ставит или снимает отметку за дату.

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

или

```json
{
  "status": "punishment"
}
```

или

```json
{
  "status": null
}
```

Правила:

- если status = reward/punishment, создать или обновить запись;
- если status = null, удалить запись из `task_marks`;
- нельзя ставить отметку на дату раньше даты создания задачи;
- пользователь может ставить отметку на прошлые даты;
- для MVP можно разрешить будущие даты или запретить. Рекомендуется запретить будущие даты.

Response:

```json
{
  "task_id": "...",
  "date": "2026-06-10",
  "status": "reward"
}
```

### 8.2. Toggle-логика на frontend

Backend принимает итоговое состояние.

Frontend сам решает:

```text
current = null, clicked reward      → send reward
current = punishment, clicked reward→ send reward
current = reward, clicked reward    → send null
current = null, clicked punishment  → send punishment
current = reward, clicked punishment→ send punishment
current = punishment, clicked punishment → send null
```

---

## 9. API статистики

### 9.1. Периоды

Поддерживаемые значения:

```text
day
week
month
year
all_time
```

Неделя в MVP: понедельник–воскресенье.

### 9.2. GET /api/stats/summary

Используется для верхнего блока главной страницы.

Query params:

```text
period=day|week|month|year|all_time
anchor_date=YYYY-MM-DD
```

Response:

```json
{
  "period": "week",
  "start_date": "2026-06-08",
  "end_date": "2026-06-14",
  "reward_count": 15,
  "punishment_count": 4
}
```

Для `all_time`:

```json
{
  "period": "all_time",
  "start_date": null,
  "end_date": null,
  "reward_count": 120,
  "punishment_count": 28
}
```

### 9.3. GET /api/stats/tasks

Используется для вкладки статистики.

Query params:

```text
period=day|week|month|year|all_time
anchor_date=YYYY-MM-DD
```

Response:

```json
{
  "period": "week",
  "start_date": "2026-06-08",
  "end_date": "2026-06-14",
  "total_reward": 15,
  "total_punishment": 4,
  "tasks": [
    {
      "task_id": "...",
      "name": "Read book",
      "archived_at": null,
      "reward_count": 7,
      "punishment_count": 0
    },
    {
      "task_id": "...",
      "name": "Gym",
      "archived_at": "2026-06-12T10:00:00Z",
      "reward_count": 0,
      "punishment_count": 0
    }
  ]
}
```

Правила отображения задач:

- если задача на начало периода еще не существовала, не показывать;
- если задача уже существовала, но имеет 0/0 за период, показывать;
- архивные задачи участвуют в статистике;
- для `all_time` показывать все задачи пользователя.

Техническое уточнение для периода:

- для day: начало и конец = anchor_date;
- для week: понедельник–воскресенье недели, в которую входит anchor_date;
- для month: первый и последний день месяца anchor_date;
- для year: 1 января – 31 декабря года anchor_date;
- для all_time: без date range.

---

## 10. API настроек

### 10.1. GET /api/settings

Response:

```json
{
  "language": "ru",
  "icon_pack": "cookie_whip"
}
```

### 10.2. PATCH /api/settings

Request:

```json
{
  "language": "en",
  "icon_pack": "carrot_stick"
}
```

Можно обновлять одно или оба поля.

Валидация:

```text
language in ['ru', 'en']
icon_pack in ['cookie_whip', 'carrot_stick']
```

---

## 11. Frontend architecture

### 11.1. Роуты

```text
/login
/register
/app/tasks
/app/stats
/app/account
/app/tasks/archived
```

После входа пользователь попадает на:

```text
/app/tasks
```

Неавторизованный пользователь при попытке открыть `/app/*` отправляется на `/login`.

### 11.2. Layout

Основной layout:

```text
<AppShell>
  <MobileContainer>
    <PageContent />
    <BottomNavigation />
  </MobileContainer>
</AppShell>
```

Desktop должен повторять мобильный интерфейс:

- ограниченная максимальная ширина;
- центрирование по горизонтали;
- нижняя навигация остается нижней навигацией.

Рекомендуемый max-width:

```text
420px–520px
```

### 11.3. Нижняя навигация

Три вкладки:

```text
Tasks
Stats
Account
```

В UI отображать иконками, без обязательного текста.

Для доступности добавить `aria-label`.

---

## 12. Локализация frontend

Сразу заложить словари:

```text
frontend/src/i18n/ru.ts
frontend/src/i18n/en.ts
```

Пример:

```ts
export const ru = {
  nav: {
    tasks: "Задачи",
    stats: "Статистика",
    account: "Аккаунт"
  },
  periods: {
    day: "за день",
    week: "за неделю",
    month: "за месяц",
    year: "за год",
    all_time: "за все время"
  }
};
```

```ts
export const en = {
  nav: {
    tasks: "Tasks",
    stats: "Stats",
    account: "Account"
  },
  periods: {
    day: "per day",
    week: "per week",
    month: "per month",
    year: "per year",
    all_time: "all time"
  }
};
```

Не хардкодить пользовательские строки в компонентах.

---

## 13. Icon packs frontend

### 13.1. Структура ассетов

```text
frontend/src/assets/iconpacks/
  cookie_whip/
    reward.svg
    punishment.svg
  carrot_stick/
    reward.svg
    punishment.svg
```

### 13.2. Конфиг

```ts
export type IconValue = {
  type: "emoji" | "asset";
  value: string;
};

export type IconPack = {
  id: string;
  titleKey: string;
  reward: IconValue;
  punishment: IconValue;
};

export const ICON_PACKS: Record<string, IconPack> = {
  cookie_whip: {
    id: "cookie_whip",
    titleKey: "iconPacks.cookieWhip",
    reward: {
      type: "asset",
      value: "/src/assets/iconpacks/cookie_whip/reward.svg"
    },
    punishment: {
      type: "asset",
      value: "/src/assets/iconpacks/cookie_whip/punishment.svg"
    }
  },
  carrot_stick: {
    id: "carrot_stick",
    titleKey: "iconPacks.carrotStick",
    reward: {
      type: "asset",
      value: "/src/assets/iconpacks/carrot_stick/reward.svg"
    },
    punishment: {
      type: "asset",
      value: "/src/assets/iconpacks/carrot_stick/punishment.svg"
    }
  }
};
```

В реальной Vite-сборке лучше импортировать SVG как URL, чтобы сборщик корректно обработал файлы.

### 13.3. Компонент AppIcon

```tsx
type AppIconProps = {
  icon: IconValue;
  alt: string;
  size?: number;
};
```

Поведение:

- если `type === "emoji"`, рендерить span;
- если `type === "asset"`, рендерить img.

---

## 14. Страница Tasks

### 14.1. Содержимое

- Верхний блок summary.
- Переключатель периода summary.
- Кнопка добавления задачи.
- Выбор даты.
- Список активных задач.
- Кнопка перехода к архивным задачам.

### 14.2. Summary periods на главной

Порядок:

```ts
const HOME_PERIODS = ["all_time", "week", "day", "month", "year"];
```

Автоматическое переключение:

- каждые 15 секунд;
- при ручном клике на стрелки сбрасывать таймер;
- желательно сделать паузу после ручного действия.

### 14.3. Date picker

Для MVP можно использовать обычный input:

```html
<input type="date" />
```

По умолчанию — сегодняшняя локальная дата пользователя.

### 14.4. Task card

Карточка содержит:

- название;
- историю за последние 7 дней;
- кнопку reward;
- кнопку punishment.

При клике по карточке открыть task modal.

Важно: клики по reward/punishment не должны открывать modal. Использовать `event.stopPropagation()`.

### 14.5. Add task

Для MVP можно сделать modal:

- input name;
- save;
- cancel.

---

## 15. Task modal

Модальное окно задачи показывает:

- название;
- дата создания;
- total reward;
- total punishment;
- edit name;
- pin/unpin;
- archive;
- close.

Для архивной задачи в архивном списке:

- restore;
- close.

Удаления навсегда нет.

---

## 16. Страница Archived Tasks

Содержимое:

- заголовок;
- список архивных задач;
- у каждой задачи кнопка restore;
- переход назад.

Архивная задача не отображается на главной, но отображается в статистике.

---

## 17. Страница Stats

### 17.1. Default state

По умолчанию:

```text
period = week
anchorDate = today
```

### 17.2. Порядок периодов

```ts
const STATS_PERIODS = ["day", "week", "month", "year", "all_time"];
```

### 17.3. Навигация по периодам

Для day:

```text
previous = anchorDate - 1 day
next = anchorDate + 1 day
```

Для week:

```text
previous = anchorDate - 1 week
next = anchorDate + 1 week
```

Для month:

```text
previous = anchorDate - 1 month
next = anchorDate + 1 month
```

Для year:

```text
previous = anchorDate - 1 year
next = anchorDate + 1 year
```

Для all_time стрелки скрыть или отключить.

### 17.4. Содержимое

Показывать:

- period selector;
- period navigation;
- full total reward;
- full total punishment;
- task rows with full reward/punishment values.

Проценты в MVP не показывать.

---

## 18. Страница Account

Содержимое:

- login;
- language selector;
- icon pack selector;
- change password form;
- logout button.

### 18.1. Language selector

Варианты:

```text
Русский
English
```

Значения:

```text
ru
en
```

### 18.2. Icon pack selector

Варианты:

```text
cookie_whip
carrot_stick
```

Отображать preview:

```text
[reward icon] + [punishment icon]
```

### 18.3. Change password

Поля:

- old password;
- new password;
- repeat new password.

Frontend должен проверить совпадение нового пароля и повтора.

Backend должен проверить старый пароль.

---

## 19. Форматирование чисел

### 19.1. Главная страница

Использовать компактный формат до трех значимых символов.

Примеры:

```text
10      → 10
100     → 100
1000    → 1,0К
5678    → 5,67К
11111   → 11,1К
100999  → 100К
1234567 → 1,23М
```

Для английской локали можно использовать:

```text
1.0K
5.67K
11.1K
100K
1.23M
```

### 19.2. Статистика

На странице статистики выводить полные значения без сокращения.

---

## 20. Даты и timezone

Для отметок использовать `date` без времени:

```text
YYYY-MM-DD
```

Frontend отправляет локальную дату пользователя.

Backend хранит ее как PostgreSQL `date`.

Для `created_at`, `updated_at`, `archived_at`, `pinned_at` использовать `timestamptz`.

В MVP не нужно делать сложную систему часовых поясов.

---

## 21. Валидация и ошибки

### 21.1. Общие правила

Backend должен возвращать понятные ошибки:

- `400` — неверные данные;
- `401` — не авторизован;
- `403` — нет доступа к объекту;
- `404` — объект не найден;
- `409` — конфликт, например login уже занят.

### 21.2. Проверка владения

Каждый endpoint, работающий с задачей, должен проверять, что задача принадлежит текущему пользователю.

Пользователь не должен иметь возможность получить, изменить, архивировать или отметить чужую задачу.

### 21.3. Даты

Запретить отметки:

- раньше даты создания задачи;
- на будущие даты, если в MVP выбран запрет будущих дат.

Рекомендуется запретить будущие даты.

---

## 22. Security checklist

Для MVP обязательно:

- пароли только в hash;
- httpOnly cookie;
- не хранить JWT в localStorage;
- не логировать пароли;
- валидировать все входные данные;
- проверять ownership для всех task endpoints;
- использовать CORS только для разрешенных origins;
- настроить cookie `Secure=true` для production;
- использовать секрет JWT из env;
- не коммитить `.env`.

---

## 23. Frontend API client

Все запросы должны идти с credentials:

```ts
fetch(url, {
  credentials: "include",
  ...options
});
```

Рекомендуется сделать единый wrapper:

```ts
apiClient.get(...)
apiClient.post(...)
apiClient.patch(...)
apiClient.put(...)
```

При `401` перенаправлять пользователя на `/login`.

---

## 24. MVP implementation order

### Phase 1. Project bootstrap

- Создать структуру репозитория.
- Настроить Docker Compose.
- Поднять PostgreSQL.
- Поднять FastAPI.
- Поднять Vite React.
- Проверить доступ с телефона по локальной сети.

### Phase 2. Backend base

- Настроить SQLAlchemy.
- Настроить Alembic.
- Создать модели users, user_settings, tasks, task_marks.
- Создать миграции.
- Настроить dependency для DB session.

### Phase 3. Auth

- Реализовать password hashing.
- Реализовать register.
- Реализовать login.
- Реализовать logout.
- Реализовать me.
- Реализовать change password.
- Настроить httpOnly cookie.

### Phase 4. Frontend auth

- Страница регистрации.
- Страница входа.
- Auth guard для `/app/*`.
- Загрузка текущего пользователя через `/api/auth/me`.
- Logout.

### Phase 5. Tasks backend

- CRUD создания и редактирования задач.
- Архивирование и восстановление.
- Закрепление и открепление.
- Получение активных задач с history и selected date status.
- Получение архивных задач.
- Детали задачи.

### Phase 6. Marks backend

- Endpoint установки отметки.
- Toggle через итоговый status.
- Проверки даты и ownership.

### Phase 7. Tasks frontend

- Основной layout.
- Нижняя навигация.
- Экран задач.
- Summary block.
- Date picker.
- Task card.
- Add task modal.
- Task details modal.
- Mark reward/punishment/null.
- Archived tasks screen.

### Phase 8. Stats

- Backend summary endpoint.
- Backend task stats endpoint.
- Frontend stats page.
- Period selector.
- Period navigation.
- Full values in stats.

### Phase 9. Settings

- Backend settings endpoints.
- Frontend account page.
- Language selector.
- Icon pack selector.
- Change password.

### Phase 10. Polish

- Mobile-first styling.
- Desktop centered mobile container.
- Loading states.
- Empty states.
- Error states.
- Confirm archive action.
- Compact number formatting.
- Auto-switch summary period every 15 seconds.
- Basic accessibility labels.

---

## 25. Acceptance criteria для MVP

MVP считается готовым, если:

1. Пользователь может зарегистрироваться по логину и паролю.
2. При регистрации пользователь выбирает язык.
3. После регистрации пользователь попадает в приложение.
4. Пользователь может выйти и войти снова.
5. Auth хранится в httpOnly cookie.
6. Пользователь может создать задачу.
7. Пользователь может поставить задаче reward на выбранную дату.
8. Пользователь может поставить задаче punishment на выбранную дату.
9. Повторный клик по выбранному статусу снимает оценку.
10. `null` не учитывается в статистике.
11. Пользователь может выбрать прошлую дату и изменить отметку.
12. Карточка задачи показывает историю до 7 дней, не включая даты до создания задачи.
13. Пользователь может открыть modal задачи и увидеть totals.
14. Пользователь может редактировать название задачи.
15. Пользователь может закрепить и открепить задачу.
16. Последняя закрепленная задача находится выше остальных закрепленных.
17. Пользователь может архивировать задачу.
18. Архивная задача пропадает с главной.
19. Архивная задача остается в статистике.
20. Пользователь может восстановить архивную задачу.
21. Главная показывает totals за выбранный период.
22. На главной периоды идут в порядке: all_time, week, day, month, year.
23. На главной большие числа сокращаются.
24. Статистика по умолчанию открывается за неделю.
25. В статистике периоды идут в порядке: day, week, month, year, all_time.
26. В статистике значения выводятся полностью.
27. Неделя считается с понедельника по воскресенье.
28. Пользователь может изменить язык.
29. Пользователь может изменить icon pack.
30. Пользователь может изменить пароль.
31. Пользователь не может видеть или менять чужие задачи.
32. Приложение запускается через Docker Compose.
33. Frontend доступен с телефона в локальной сети.
34. Desktop отображает тот же mobile-first интерфейс.

---

## 26. Не делать в MVP

Не реализовывать:

- физическое удаление задач;
- email;
- восстановление пароля;
- OAuth;
- категории;
- теги;
- дедлайны;
- уведомления;
- графики;
- проценты;
- streak;
- drag&drop;
- загрузку пользовательских иконок;
- PWA;
- offline mode;
- публичные профили.

---

## 27. Notes for Codex

- Не расширять scope MVP без необходимости.
- Не превращать приложение в большой task manager.
- Сохранять mobile-first подход.
- Не использовать localStorage для auth token.
- Не хардкодить RU/EN строки в компонентах.
- Не хардкодить icon pack в компонентах.
- Не удалять задачи физически.
- Не учитывать отсутствие отметки как punishment.
- Не показывать даты до создания задачи в history.
- Не забывать `credentials: "include"` на frontend requests.
- Все backend endpoints должны фильтровать данные по текущему пользователю.

---

## 28. Future improvements

После MVP можно добавить:

- Drag&Drop сортировку;
- настройку первого дня недели;
- загрузку пользовательских иконок;
- streak;
- календарь активности;
- графики;
- проценты;
- темы оформления;
- PWA;
- offline-first;
- напоминания;
- email и восстановление пароля;
- экспорт статистики;
- дополнительные языки;
- дополнительные icon packs.
