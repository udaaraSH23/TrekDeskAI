# Services Reference

Services in `src/services/` are pure **API communication modules**. They know nothing about React state, hooks, or the query cache — they just make HTTP calls and return typed data. All calls go through the centralized `api.ts` Axios instance.

Every error thrown by a service will be an `ApiError` instance (set up by the response interceptor in `api.ts`).

---

## api.ts — Axios Instance

**File:** `src/services/api.ts`

The shared Axios instance used by all other services. Not imported or called directly from components.

### Configuration

| Setting      | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Base URL     | `VITE_API_URL` (default: `http://localhost:3001/api/v1`) |
| Content-Type | `application/json`                                       |

### Interceptors

| Interceptor            | Action                                                                                                                 |
| ---------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| **Request**            | Reads `trekdesk_token` from localStorage; adds `Authorization: Bearer <token>` header                                  |
| **Response (success)** | Passes response through unchanged                                                                                      |
| **Response (error)**   | Extracts message → wraps in `ApiError(statusCode, message)`. On 401: clears token + redirects to `/login?expired=true` |

---

## AuthService

**File:** `src/services/AuthService.ts`

| Method                       | HTTP | Endpoint          | Params                | Returns                         |
| ---------------------------- | ---- | ----------------- | --------------------- | ------------------------------- |
| `loginWithGoogle(idToken)`   | POST | `/auth/google`    | `{ idToken: string }` | `{ user: User, token: string }` |
| `loginWithDevSecret(secret)` | POST | `/auth/dev-login` | `{ secret: string }`  | `{ user: User, token: string }` |
| `verifySession()`            | GET  | `/auth/verify`    | —                     | `User`                          |
| `setToken(token)`            | —    | localStorage      | `token: string`       | `void`                          |
| `getToken()`                 | —    | localStorage      | —                     | `string \| null`                |
| `clearToken()`               | —    | localStorage      | —                     | `void`                          |

> `loginWithDevSecret` is only callable when `ENABLE_DEVELOPMENT_LOGIN=true` is set on the backend. It is safe to call client-side regardless — the backend will return 403 if it's disabled.

---

## AnalyticsService

**File:** `src/services/AnalyticsService.ts`

| Method              | HTTP | Endpoint                 | Params       | Returns                          |
| ------------------- | ---- | ------------------------ | ------------ | -------------------------------- |
| `getCallLogs()`     | GET  | `/analytics/calls`       | —            | `CallLog[]`                      |
| `getStats()`        | GET  | `/analytics/calls/stats` | —            | `CallStats`                      |
| `getCallDetail(id)` | GET  | `/analytics/calls/:id`   | `id: string` | `CallLog` (with full transcript) |

### Types

```typescript
interface CallLog {
  id: string;
  session_id: string;
  transcript: TranscriptMessage[]; // NOT any — structured array
  summary: string;
  sentiment_score: number;
  duration_seconds: number;
  created_at: string;
}

interface CallStats {
  total_calls: number;
  avg_duration_seconds: number;
  avg_sentiment_score: number;
  calls_today: number;
  calls_this_week: number;
}
```

---

## KnowledgeService

**File:** `src/services/KnowledgeService.ts`

| Method          | HTTP | Endpoint                  | Params              | Returns                   |
| --------------- | ---- | ------------------------- | ------------------- | ------------------------- |
| `ingest(data)`  | POST | `/knowledge/ingest`       | `KnowledgeDocument` | `{ message: string }`     |
| `search(query)` | GET  | `/knowledge/search?q=...` | `query: string`     | `KnowledgeSearchResult[]` |

### Types

```typescript
interface KnowledgeDocument {
  content: string; // min 10, max 50,000 chars
  trek_id?: string | null; // UUID to scope the chunk
  metadata?: Record<string, string>;
}

interface KnowledgeSearchResult {
  content: string;
  trek_id?: string | null;
  metadata?: Record<string, string>;
  similarity?: number; // cosine similarity score 0–1
}
```

---

## PersonaService

**File:** `src/services/PersonaService.ts`

| Method                     | HTTP  | Endpoint   | Params            | Returns           |
| -------------------------- | ----- | ---------- | ----------------- | ----------------- |
| `getSettings()`            | GET   | `/persona` | —                 | `PersonaSettings` |
| `updateSettings(settings)` | PATCH | `/persona` | `PersonaSettings` | `PersonaSettings` |

### Types

```typescript
interface PersonaSettings {
  voice_name: string; // max 100 chars
  system_instruction: string; // max 10,000 chars
  temperature: number; // 0.0 – 2.0 (note: Gemini range, NOT 0–1)
}
```

---

## TourService

**File:** `src/services/TourService.ts`

| Method                    | HTTP   | Endpoint     | Params                  | Returns  |
| ------------------------- | ------ | ------------ | ----------------------- | -------- |
| `getTours()`              | GET    | `/tours`     | —                       | `Trek[]` |
| `getTourById(id)`         | GET    | `/tours/:id` | `id: string`            | `Trek`   |
| `createTour(payload)`     | POST   | `/tours`     | `CreateTrekPayload`     | `Trek`   |
| `updateTour(id, payload)` | PUT    | `/tours/:id` | `id, UpdateTrekPayload` | `Trek`   |
| `deleteTour(id)`          | DELETE | `/tours/:id` | `id: string`            | `void`   |

### Types

```typescript
type DifficultyLevel = "easy" | "moderate" | "challenging" | "extreme";

interface Trek {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  base_price_per_person: number;
  transport_fee: number;
  difficulty_level?: DifficultyLevel;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CreateTrekPayload {
  name: string;
  description?: string;
  base_price_per_person: number;
  transport_fee?: number;
  difficulty_level?: DifficultyLevel;
}

type UpdateTrekPayload = Partial<CreateTrekPayload>;
```

> ⚠️ **Field name alignment:** Field names use `snake_case` matching the Postgres column names. Previous versions incorrectly used `basePrice`, `durationDays`, `isActive` — these do not exist on the backend.
