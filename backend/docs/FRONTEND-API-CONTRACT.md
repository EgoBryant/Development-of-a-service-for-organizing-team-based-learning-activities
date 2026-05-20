# Контракт API для фронтенд-команды (MVP)

Backend: ASP.NET Core 8 + EF Core + PostgreSQL.
Base URL (dev): `http://127.0.0.1:8080` (см. `DEFAULT_LOCAL_API` во `frontend/src/start.ts`).
Все JSON в **camelCase**. Ошибки — RFC 7807 ProblemDetails (`title`, `detail`, `status`).
Аутентификация — JWT: `Authorization: Bearer <token>`.

## 1. Реестр эндпоинтов

| Метод | Путь | Auth | Тело запроса | Тело ответа | Назначение |
|-------|------|------|--------------|-------------|------------|
| POST | `/api/auth/register` | — | `RegisterRequest` (`userName`, `email`, `password`) | `AuthResponse` | Регистрация |
| POST | `/api/auth/login` | — | `LoginRequest` (`email`, `password`) | `AuthResponse` | Логин |
| GET | `/api/auth/me` | JWT | — | `UserProfileResponse` | Текущий пользователь |
| GET | `/api/profile` | JWT | — | `UserProfileResponse` | Профиль |
| PUT | `/api/profile` | JWT | `UpdateProfileDto` (camelCase) | `UserProfileResponse` | Сохранить ЛК |
| GET | `/api/groups` | JWT | — | `GroupResponse[]` | Справочник групп |
| POST | `/api/groups` | Admin | `CreateGroupDto` | `GroupResponse` | Добавить группу (admin) |
| GET | `/api/teams` | JWT | — | `TeamResponse[]` | Все команды |
| GET | `/api/teams/{id}` | JWT | — | `TeamResponse` | Команда по id |
| GET | `/api/teams/me` | JWT | — | `TeamResponse` | Моя команда |
| POST | `/api/teams/create` | Student | `CreateTeamDto` (`name`, `description`) | `TeamResponse` | Создать команду |
| POST | `/api/teams/join` | Student | `JoinTeamRequest` (`inviteCode`) | `TeamResponse` | Вступить в команду |
| PATCH | `/api/teams/{id}/score` | Admin | `UpdateTeamScoreRequest` | `TeamResponse` | Правка `Score` |
| GET | `/api/ratings/teams` | JWT | `?search&sort&limit` | `RatingTeam[]` | Лидерборд команд |
| GET | `/api/ratings/teams/{id}` | JWT | — | `RatingTeam` | Карточка команды |
| GET | `/api/ratings/users` | JWT | `?search&sort&limit` | `RatingUser[]` | Лидерборд пользователей |
| GET | `/api/ratings/users/{id}` | JWT | — | `RatingUser` | Карточка пользователя |
| GET | `/api/votes` | JWT | — | `VoteResponse[]` | Все голоса своей команды |
| GET | `/api/votes/my` | JWT | — | `MyVoteResponse[]` | Голоса, отданные мной |
| POST | `/api/votes` | Student | `CreateVoteDto` (`toUserId`, `score`) | `VoteResponse` | Оценить тиммейта 1–5 |
| GET | `/api/help-requests` | JWT | `?scope=all\|incoming\|outgoing` | `HelpRequestResponse[]` | Запросы помощи |
| POST | `/api/help-requests` | Captain | `CreateHelpRequestDto` | `HelpRequestResponse` | Создать «спасение» |
| PATCH | `/api/help-requests/{id}/status` | Captain | `UpdateHelpRequestStatusDto` | `HelpRequestResponse` | Сменить статус |
| GET | `/api/checkins` | JWT | — | `CheckInResponse[]` | Check-in команды |
| POST | `/api/checkins` | Captain | `CreateCheckInDto` (`weekNumber`, `reportText`) | `CheckInResponse` | Сдать check-in |
| GET | `/api/knowledge-posts` | JWT | `?search&type` | `KnowledgePostResponse[]` | Биржа знаний |
| POST | `/api/knowledge-posts` | JWT | `CreateKnowledgePostDto` | `KnowledgePostResponse` | Опубликовать пост |
| DELETE | `/api/knowledge-posts/{id}` | JWT (автор/Admin) | — | 204 | Удалить пост |
| GET | `/api/events/calendar` | JWT | `?from&to&scope=all\|mine` | `CalendarEventResponse[]` | События календаря |
| POST | `/api/events` | JWT | `CreateCalendarEventDto` | `CalendarEventResponse` | Создать событие |
| DELETE | `/api/events/{id}` | JWT (автор/Admin) | — | 204 | Удалить событие |
| GET | `/api/news` | — | `?limit` | `NewsResponse[]` | Новости |
| POST | `/api/news` | Admin | `CreateNewsDto` | `NewsResponse` | Опубликовать новость |
| DELETE | `/api/news/{id}` | Admin | — | 204 | Удалить новость |
| GET | `/api/activity-feed` | JWT | `?limit` | `ActivityFeedItemResponse[]` | Лента активности |
| GET | `/api/challenges` | JWT | — | `ChallengeResponse[]` | Активные челленджи |
| POST | `/api/challenges` | Admin | `CreateChallengeDto` | `ChallengeResponse` | Создать челлендж |
| POST | `/api/challenges/{id}/submit` | Student | `SubmitChallengeDto` | `ChallengeProgressResponse` | Сдать челлендж |
| PATCH | `/api/challenges/progress/{progressId}/review` | Admin | `ReviewChallengeProgressDto` | `ChallengeProgressResponse` | Approved/Rejected |
| GET | `/api/challenges/teams/{teamId}/progress` | JWT | — | `ChallengeProgressResponse[]` | Прогресс команды |
| GET | `/api/achievements` | JWT | — | `AchievementResponse[]` | Каталог ачивок |
| GET | `/api/users/me/achievements` | JWT | — | `UserAchievementResponse[]` | Мои ачивки |
| GET | `/api/users/{userId}/achievements` | JWT | — | `UserAchievementResponse[]` | Ачивки пользователя |
| PATCH | `/api/admin/users/{userId}/points` | Admin | `AdminUpdateUserPointsDto` | 204 | Правка персональных баллов |
| POST | `/api/admin/krk/recalculate` | Admin | — | 204 | Полный пересчёт КРК |
| DELETE | `/api/admin/knowledge-posts/{postId}` | Admin | — | 204 | Модерация поста |

## 2. Маппинг «экран фронта → endpoint»

### 2.1 Авторизация / профиль
| UI / событие | Заменяется на |
|--------------|---------------|
| `signIn` (`start.ts`) | `POST /api/auth/login` |
| `signUp` (`start.ts`) | `POST /api/auth/register` |
| `session restore` | `GET /api/auth/me` |
| «Сохранить ЛК» | `PUT /api/profile` |
| Подсказки группы | `GET /api/groups` |

### 2.2 Экран `TeamPage` / `start.ts` команды
| Текущий код фронта | Куда переключать |
|--------------------|------------------|
| `createTeam(name, direction)` + `LOCAL_TEAM_STORAGE_PREFIX` | `POST /api/teams/create` (`description` принимает значение `direction`) |
| `joinTeamByInviteCode` (`localCreatedTeam` + DEMO коды) | `POST /api/teams/join` |
| Чтение `localCreatedTeam` | `GET /api/teams/me` (вернёт `inviteCode`, `members`, `score`, `krk`) |
| `TeamMemberView[]` | `TeamResponse.members[]` — каждый член имеет `displayName`, `roleLabel`, `avatarUrl`, `isCaptain` |
| QR / invite link | значение `inviteCode` из `TeamResponse` |

После `create`/`join` следующий `GET /api/auth/me` отдаст обновлённые `teamId`, `teamName`, `teamInviteCode`, `isCaptain`, `teamScore`.

### 2.3 Экран `RatingPage`
| Демо-источник | API |
|---------------|-----|
| `DEMO_RATING_TEAMS` | `GET /api/ratings/teams?sort=rank-asc` |
| Поиск по командам | `GET /api/ratings/teams?search=<text>` |
| Зал славы / топ-10 | `GET /api/ratings/teams?limit=10` |
| `DEMO_RATING_USERS` | `GET /api/ratings/users` |

`RatingTeam.id`, `RatingTeamMember.id`, `RatingUser.id`, `RatingUser.teamId` — **строки** (`team.Id.ToString()`).
`league` строго одно из: `БАЗОВАЯ`, `БРОНЗА`, `СЕРЕБРО`, `ЗОЛОТО` (см. пороги ниже).
`krk` — `double`, округлён до 1 знака.

### 2.4 Голосование (`teamModal: "vote"`)
| UI | API |
|----|-----|
| Шкала 1–5 | `POST /api/votes` body `{ toUserId, score }` |
| Кого уже оценил | `GET /api/votes/my` |
| Сводка по команде | `GET /api/votes` |

Запреты:
* Self-vote — 400 BadRequest.
* Дубликат `(teamId, fromUserId, toUserId)` — 409 Conflict.
* Член не из своей команды — 400 BadRequest.

### 2.5 «Спасение» / RescueModal / `teamModal: "requests" | "rescue"`
| Поле фронта | Поле бэка |
|-------------|-----------|
| `topic` | `topic` |
| `tag` | `tag` |
| `description` | `description` |
| `format` | `format` |
| `dateTime` (ISO в UTC) | `scheduledAtUtc` |
| `league` (TeamRescueDraft) | `leagueLabel` |
| target team | `toTeamId` |
| bonus | `bonusPoints` |

После `PATCH /api/help-requests/{id}/status` со статусом `Completed` сервер автоматически:
* добавляет `bonusPoints` к `Team.Score` принимающей команды (`toTeamId`),
* помечает запрос `bonusAwarded = true` (повторное `Completed` не задвоит начисление),
* пересчитывает КРК обеих команд,
* добавляет запись в `/api/activity-feed`.

### 2.6 Биржа знаний
| UI | API |
|----|-----|
| Лента | `GET /api/knowledge-posts` |
| Поиск | `GET /api/knowledge-posts?search=...` |
| Фильтр по тегу | `GET /api/knowledge-posts?type=Java` |
| Создание | `POST /api/knowledge-posts` |
| Удалить свой пост | `DELETE /api/knowledge-posts/{id}` |

### 2.7 События и новости (вместо DEMO)
| UI | API |
|----|-----|
| Календарь команды | `GET /api/events/calendar?scope=mine` |
| Общий календарь | `GET /api/events/calendar?scope=all` |
| Создать событие | `POST /api/events` |
| Лента новостей | `GET /api/news` |
| Лента активности | `GET /api/activity-feed` |

Маппинг полей формы создания события (TeamEventCreateDraft):
```
topic         → topic
tag           → tag
description   → description
format        → format
dateTime ISO  → startsAtUtc
isGlobal      → isGlobal  (по умолчанию false ⇒ создаётся для команды текущего пользователя)
```

### 2.8 Check-in
* `GET /api/checkins` — отчёты текущей команды, упорядочены по убыванию недели.
* `POST /api/checkins` — `{ weekNumber, reportText }` (только капитан/админ).
* Дубликат `(teamId, weekNumber)` → 409.
* Поля ответа: `weekNumber, reportText, status, submittedAtUtc, teamId, teamName, createdAtUtc`.

### 2.9 Челленджи
* Список: `GET /api/challenges` — каждый объект содержит `teamStatus` (Submitted | Approved | Rejected | null) для команды текущего пользователя.
* Сдать: `POST /api/challenges/{id}/submit` body `{ proofText }`.
* Прогресс команды: `GET /api/challenges/teams/{teamId}/progress`.

### 2.10 Ачивки
* Каталог: `GET /api/achievements`.
* Ачивки игрока: `GET /api/users/{id}/achievements`.
* Мои ачивки: `GET /api/users/me/achievements`.

Триггеры MVP:
* `FIRST_CHECKIN` — первый успешный `POST /api/checkins`.
* `FIRST_RESCUE` — капитан принимающей команды, когда `PATCH /api/help-requests/{id}/status` переводит запрос в `Completed`.
* `FIRST_VOTE` — первый голос пользователя.
* `FIRST_CHALLENGE` — первая успешная сдача челленджа.
* `TOP3_TEAM` — выдаётся вручную админом (правка `UserPoints`) — TODO для расширения.

## 3. Формула КРК

```
КРК = (БазовыйРейтинг × 0.6) + (КоэффициентСплочённости × 0.3) + (БонусЧелленджи × 0.1)
```

Нормализация каждого компонента в диапазон 0–10:
* **БазовыйРейтинг** — `Team.Score`, нормализованный к максимуму `Team.Score` по всей выборке: `score / maxScore * 10`.
* **Сплочённость** — среднее голосов команды (`Vote.Score`, шкала 1–5), пересчитанное в 0–10: `(avg - 1) / 4 * 10`.
* **БонусЧелленджи** — сумма `Challenge.BonusPoints` за approved прогрессы команды, нормализована к максимуму по всем командам.

Если данных нет (нет голосов / нет approved челленджей / `maxScore = 0`), соответствующий компонент = 0.
Результат сохраняется в `Team.KrkCached` и в API отдаётся округлённым до 1 знака.

Пересчёт КРК запускается автоматически при:
* `POST /api/votes`
* `PATCH /api/help-requests/{id}/status` (Completed)
* `PATCH /api/challenges/progress/{id}/review` (Approved/Rejected)
* `PATCH /api/teams/{id}/score`
* `POST /api/admin/krk/recalculate` (массовый)

## 4. Лиги пользователей

`RatingUser.league` рассчитывается по `UserPoints`:

| Порог `points` | Лига |
|----------------|------|
| `0..149` | `БАЗОВАЯ` |
| `150..299` | `БРОНЗА` |
| `300..399` | `СЕРЕБРО` |
| `≥ 400` | `ЗОЛОТО` |

## 5. Известные расхождения (контракт-pizza)

| Фронт | Бэк | Решение |
|-------|-----|---------|
| `TeamCreateDraft.direction` | `CreateTeamDto.description` | Фронт пишет `direction` в `description` без дополнительной обработки. Сервер хранит и отдаёт его как `description`. |
| `RescueDraft.dateTime` (локаль/ISO) | `CreateHelpRequestDto.scheduledAtUtc` (UTC) | Фронт конвертирует в UTC перед отправкой. |
| `TeamRescueDraft.photoFileName` | пока **не поддерживается** | В MVP API не сохраняет файлы для спасения. Будет добавлено отдельной задачей. |
| `RatingTeam.id: string` | `Team.Id: int` | Бэк отдаёт `id` как строку (`Id.ToString()`) — для совместимости с фронтовым `RatingTeam.id: string`. |
| `RatingUser.teamId: string \| null` | `User.TeamId: int?` | То же — строка либо `null`. |

## 6. Примеры curl

> Перед запуском авторизуйтесь и сохраните токен в переменную окружения:
> ```bash
> TOKEN=$(curl -s -X POST http://127.0.0.1:8080/api/auth/login \
>   -H "Content-Type: application/json" \
>   -d '{"email":"ivanov@teamexam.local","password":"Captain123!"}' \
>   | jq -r .token)
> ```

### Лидерборд топ-10 команд
```bash
curl -s http://127.0.0.1:8080/api/ratings/teams?limit=10 \
  -H "Authorization: Bearer $TOKEN"
```

### Создать команду
```bash
curl -s -X POST http://127.0.0.1:8080/api/teams/create \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"ОМЕГА","description":"Frontend"}'
```

### Голос за тиммейта
```bash
curl -s -X POST http://127.0.0.1:8080/api/votes \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"toUserId":12,"score":5}'
```

### Спасение
```bash
curl -s -X POST http://127.0.0.1:8080/api/help-requests \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "toTeamId": 2,
    "topic": "Помогите с матаном",
    "tag": "Матан",
    "description": "Не успеваем разобрать ряды Тейлора",
    "format": "онлайн",
    "scheduledAtUtc": "2026-05-22T14:00:00Z",
    "leagueLabel": "ЗОЛОТО",
    "bonusPoints": 25
  }'
```

### Завершить спасение
```bash
curl -s -X PATCH http://127.0.0.1:8080/api/help-requests/1/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"Completed"}'
```

### Создать новость (Admin)
```bash
curl -s -X POST http://127.0.0.1:8080/api/news \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Старт недели","body":"Сегодня сдача check-in до 23:59"}'
```

## 7. Демо-данные (после первого запуска)

* Группа `РИ-420001`.
* Пользователи (пароль Captain — `Captain123!`, Student — `Student123!`, Admin — `Admin123!`):
  * `admin@teamexam.local` (Admin)
  * `ivanov@teamexam.local` (Captain, Альфа)
  * `kozlov@teamexam.local` (Student, Альфа)
  * `petrov@teamexam.local` (Captain, Бета)
  * `novikov@teamexam.local` (Student, Бета)
  * `sidorov@teamexam.local` (Captain, Гамма)
  * `volkov@teamexam.local` (Student без команды)
* Команды Alpha/Beta/Gamma с invite-кодами `ALPHA1`, `BETA01`, `GAMMA1`.
* Каталог из 5 челленджей и 5 ачивок.

## 8. Эксплуатация

* Миграции применяются автоматически при старте API (`Program.cs` → `InitializeDatabaseAsync`). При локальной разработке можно явно: `dotnet ef database update --project backend`.
* Swagger — `/swagger` (только Development).
* Health — `GET /health`.

## 9. Вне MVP (заглушки)

* OAuth УрФУ — `IExternalAuthProvider`, реализация `NotImplementedExternalAuthProvider`. Подключение — после согласования AD.
* Импорт оценок учебного портала — `IPortalGradesImporter`, реализация `NotImplementedPortalGradesImporter`.

Эти интерфейсы зарегистрированы в DI, чтобы вызов с фронта/админки сразу видел NotImplemented и не падал на пустых полях.
