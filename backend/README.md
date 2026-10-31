# Rootine API

A habit-tracking backend built with **Express · TypeScript · PostgreSQL · Drizzle ORM**.

---

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill in environment variables
cp .env.example .env

# 3. Run database migrations
npm run db:migrate

# 4. Start development server
npm run dev

# 5. Build for production
npm run build
node dist/server.mjs
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_SECRET` | ✅ | Secret key for signing JWT access tokens |
| `PORT` | No | HTTP port (default: 7000) |
| `APP_NAME` | No | App name used in emails (default: Rootine API) |
| `NODE_ENV` | No | `development` or `production` |
| `SMTP_HOST` | No | SMTP server host (e.g. smtp.gmail.com) |
| `SMTP_PORT` | No | SMTP port (default: 587) |
| `SMTP_USER` | No | SMTP username / email address |
| `SMTP_PASS` | No | SMTP password or app password |
| `EMAIL_FROM` | No | Sender email address |

---

## Base URL

All API routes are prefixed with `/api/v1`.

```
http://localhost:7000/api/v1
```

---

## Authentication

Protected routes require a JWT access token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Access tokens expire in **10 minutes**. Use the refresh token to get a new one.

---

## Rate Limits

| Scope | Limit |
|-------|-------|
| All routes | 100 requests / 15 min per IP |
| `/api/v1/auth/*` | 10 requests / 15 min per IP |

---

## Endpoints

### Auth — `/api/v1/auth`

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/register` | No | Create a new account |
| `POST` | `/login` | No | Log in — returns `token`, `refreshToken`, `expiresIn` |
| `POST` | `/logout` | No | Revoke a refresh token |
| `POST` | `/verify-email` | No | Verify email with token from inbox |
| `POST` | `/resend-verification` | No | Re-send the verification email |
| `POST` | `/forgot-password` | No | Send a password reset token |
| `POST` | `/reset-password` | No | Reset password using the token |
| `POST` | `/refresh-token` | No | Exchange refresh token for a new access token |
| `GET` | `/me` | ✅ | Get current user profile |

#### Register
```json
POST /api/v1/auth/register
{
  "name": "Kenneth Imperial",
  "email": "kenneth@example.com",
  "password": "Secure@123",
  "phoneNumber": "09171234567",
  "countryCode": "PH",
  "city": "Cordova"
}
```

#### Login
```json
POST /api/v1/auth/login
{ "email": "kenneth@example.com", "password": "Secure@123" }

// Response includes:
{ "token": "...", "refreshToken": "...", "expiresIn": 600 }
```

---

### Tasks — `/api/v1/tasks` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/` | Create a task |
| `GET` | `/` | List tasks (paginated) |
| `GET` | `/today` | Today's dashboard with progress |
| `GET` | `/:id` | Get one task |
| `PATCH` | `/:id` | Update a task |
| `DELETE` | `/:id` | Soft-delete a task |
| `PATCH` | `/:id/archive` | Archive a task |
| `PATCH` | `/:id/unarchive` | Restore from archive |
| `PUT` | `/reorder` | Reorder tasks by position |
| `POST` | `/:id/complete` | Mark task complete for today |
| `DELETE` | `/:id/complete` | Undo today's completion |
| `GET` | `/:id/completions` | List all completions for a task |
| `GET` | `/:id/stats` | Streak & stats for a task |

#### Pagination
```
GET /api/v1/tasks?page=1&limit=20&includeArchived=false
```

Response includes:
```json
{
  "data": {
    "tasks": [...],
    "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3, "hasNextPage": true }
  }
}
```

#### Create Task
```json
POST /api/v1/tasks
{
  "title": "Drink 8 glasses of water",
  "frequency": "DAILY",
  "scheduleConfig": { "targetPerDay": 8 },
  "preferredTimeWindow": "MORNING",
  "reminderEnabled": true,
  "reminderTime": "08:00",
  "reminderIntervalHours": 2,
  "maxDailyReminders": 4
}
```

---

### User Settings — `/api/v1/users` 🔒

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/me` | Get current user profile |
| `PATCH` | `/me` | Update profile fields |
| `PATCH` | `/me/email` | Request email change (sends token to new address) |
| `POST` | `/me/email/verify` | Confirm new email with token |
| `PATCH` | `/me/password` | Change password |

#### Update Profile
```json
PATCH /api/v1/users/me
{
  "name": "Kenneth R. Imperial",
  "city": "Cebu",
  "timezone": "Asia/Manila",
  "phoneNumber": "09171234567",
  "countryCode": "PH"
}
```

#### Change Email (2-step)
```json
// Step 1: Request
PATCH /api/v1/users/me/email
{ "newEmail": "new@example.com" }

// Step 2: Verify with token from inbox
POST /api/v1/users/me/email/verify
{ "token": "<token_from_email>" }
```

#### Change Password
```json
PATCH /api/v1/users/me/password
{ "currentPassword": "OldPass@1", "newPassword": "NewPass@2" }
```

---

## Response Format

All responses follow this structure:

```json
{
  "status": "success" | "error",
  "message": "Human-readable message",
  "code": 200,
  "data": { ... }
}
```

Error responses include:
```json
{
  "status": "error",
  "message": "What went wrong",
  "errors": [ ... ]  // validation errors only
}
```

---

## Project Structure

```
src/
├── app.ts                  # Express setup, middleware, routes
├── server.ts               # Entry point, starts server + reminder worker
├── config/
│   └── env.ts              # Environment variable validation
├── controllers/            # HTTP layer — reads req, calls service, writes res
├── services/               # Business logic
│   ├── auth/               # Sign-up, login, token, email verify, password reset
│   ├── task/               # Task CRUD, completions, dashboard, stats
│   ├── reminder/           # Background email reminder worker
│   └── user/               # Profile, email change, password change
├── repositories/           # Database queries (Drizzle ORM)
├── routes/                 # URL + method definitions
├── schema/                 # Zod validation schemas + TypeScript types
├── middlewares/            # Auth guard, validation, error handler
├── db/
│   └── schema.ts           # Database table definitions
└── utils/                  # Mailer, timezone helpers, streak calculator
```

---

## Members

- Imperial, Kenneth R.
- Aying, Clifford S.

**Cordova Public College** — Capstone Project

