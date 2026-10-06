# SeatMate — совместные поездки и шеринг авто по Беларуси

Веб-приложение для поиска попутчиков и организации совместных поездок
по городам Беларуси. Всё локализовано под РБ: валюта **BYN**, телефоны
`+375`, города: Минск, Брест, Гродно, Витебск, Гомель, Могилев, Полоцк,
Новополоцк, Барановичи, Бобруйск, Лида, Пинск.

## Стек

| Слой | Технологии |
|------|-----------|
| Client | React (Vite), Tailwind CSS, Framer Motion, Lucide React, Socket.io-client, React-Leaflet |
| Server | Node.js, Express, Socket.io, SQLite (better-sqlite3) |

## Структура

```
curs4/
├── run.sh                 # запуск всего приложения
├── README.md
├── server/
│   ├── index.js           # Express API + Socket.io + cron
│   ├── db.js              # схема SQLite
│   ├── seed.js            # первичное наполнение БД
│   ├── cron.js            # фоновые задачи (каждые 3 мин)
│   ├── cities.js          # координаты городов
│   └── seatmate.db        # файл БД (создаётся автоматически)
└── client/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── App.jsx, main.jsx, api.js, socket.js, cities.js
        ├── context/AuthContext.jsx
        ├── components/    # Header, TripCard, MapView
        └── pages/         # Home, Trip, CreateTrip, Profile, Chats, Admin, Login
```

## Запуск

```bash
chmod +x run.sh
./run.sh
```

Скрипт: проверяет/ставит зависимости, сидирует БД (один раз), запускает
Express (`:3001`) и Vite (`:5173`), обрабатывает `SIGINT/SIGTERM` и
корректно гасит все фоновые процессы.

Открыть: **http://localhost:5173**

### Тестовые аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| ADMIN | admin@seatmate.by | admin123 |
| DRIVER | driver1@seatmate.by | 1234 |
| CLIENT | client1@seatmate.by | 1234 |

В шапке сайта есть **Quick User Switcher** — мгновенная смена аккаунта
без ввода пароля.

## Бизнес-правила

- Пассажир — максимум **1 активная бронь** на одно время (±3ч).
- Водитель — максимум **3 активные поездки** суммарно и **ни одной** на то же время (±3ч).
- Cron удаляет из БД все поездки с прошедшим временем отправления (вместе с бронами, чатами и отзывами).
- Места списываются атомарно (`UPDATE ... WHERE seats_available >= ?`) — овербукинг невозможен.
- Отмена брони возвращает места в поездку.
- Рейтинг пользователя пересчитывается по отзывам.

## Seeder и Cron

- `server/seed.js` — 7 пользователей (админ, 3 водителя, 3 клиента), 3 авто,
  10 реальных поездок по Беларуси, брони, 2 активных чата с сообщениями,
  отзывы, жалоба, уведомления.
- `server/index.js` запускает `runCron()` каждые **3 минуты**:
  1. **удаление** поездок с прошедшим `departure_time` + связанных записей;
  2. генерация 2–3 новых поездок на сегодня/завтра;
  3. удаление устаревших отменённых броней и прочитанных уведомлений.

## API (REST)

```
POST /api/auth/login            {email,password}
POST /api/auth/register         {full_name,email,password,phone,role}
GET  /api/auth/quick-users
GET  /api/trips?origin=&destination=&date=
GET  /api/trips/:id
POST /api/trips                 {driver_id,vehicle_id,origin,destination,departure_time,price,seats_total,features}
PUT  /api/trips/:id             {...}
DELETE /api/trips/:id           (мягкая отмена + отмена броней)
POST /api/trips/:id/book        {passenger_id,seats_booked}
POST /api/rentals/:id/cancel
GET  /api/users/:id             (профиль: авто, активные брони, история, отзывы)
PUT  /api/users/:id
POST /api/users/:id/balance     {amount}
GET  /api/vehicles/:driverId / POST /api/vehicles / PUT|DELETE /api/vehicles/:id
GET  /api/chats?userId=
GET  /api/chats/:id/messages
POST /api/chats                 {trip_id,participant_ids}
DELETE /api/chats/:id
GET  /api/chats/all/admin
POST /api/reviews               {trip_id,author_id,target_user_id,rating,comment,type}
GET  /api/reviews/app
POST /api/reports               {reporter_id,target_trip_id,target_user_id,reason}
GET  /api/reports               (admin)
POST /api/reports/:id/resolve
POST /api/reports/block-user    {user_id}
GET  /api/notifications/:userId
POST /api/notifications/:userId/read
GET  /api/admin/users / POST /api/admin/users
PUT|DELETE /api/admin/users/:id
GET  /api/admin/trips / GET /api/admin/stats
```

## Socket.io

Клиент испускает / сервер слушает:

| Событие | Направление | Payload |
|---------|-------------|---------|
| `join_chat` | C→S | `{chatId, userId}` |
| `send_message` | C→S | `{chatId, senderId, text}` |
| `typing` / `stop_typing` | C→S | `{chatId, userId, name}` |
| `message_read` | C→S | `{chatId, userId}` |
| `new_message` | S→C | объект сообщения |
| `typing` / `stop_typing` | S→C | `{userId, name}` |
| `messages_read` | S→C | `{chatId, userId}` |
| `chat_notification` | S→C | `{chatId, text}` |

## UI

- Глубокий тёмный фон `#0B0B0B`, карточки `#1C1C1E` + glassmorphism + `border-white/10`.
- Акцент — светодиодный красный `#FF0000` (статус LIVE, бейджи непрочитанного, алерты).
- Шрифты: **Silkscreen** (пиксельные заголовки/цифры) + **Space Grotesk** (текст).
- Карты: React-Leaflet с тёмными тайлами CARTO, маркеры городов, красная полилиния маршрута.
- Калькулятор топлива при создании поездки (литр ≈ 2.4 BYN).
