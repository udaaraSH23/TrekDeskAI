# Error Handling

## Error Categories

| Type                     | Class               | Origin                               | User-Visible?                  |
| ------------------------ | ------------------- | ------------------------------------ | ------------------------------ |
| **API errors** (4xx/5xx) | `ApiError`          | Response interceptor in `api.ts`     | Yes — `.message` from backend  |
| **Validation errors**    | Zod `ZodError`      | `lib/validators/*.ts` on form submit | Yes — field-level messages     |
| **Auth errors**          | `Error` (re-thrown) | `AuthContext` login/devLogin         | Yes — surfaced in Login UI     |
| **Unexpected crashes**   | Generic `Error`     | Runtime bugs                         | Yes — `ErrorBoundary` fallback |

---

## ApiError Class (`lib/errors/ApiError.ts`)

The frontend equivalent of the backend's `AppError`. Every non-2xx response from the backend is converted to an `ApiError` instance by the Axios response interceptor.

```typescript
class ApiError extends Error {
  statusCode: number; // HTTP status code
  isOperational: boolean; // true for 4xx (user error), false for 5xx (server bug)
}
```

**Consumer pattern:**

```typescript
try {
  await TourService.createTour(payload);
} catch (err) {
  if (err instanceof ApiError) {
    // .message is always human-readable (from backend's response envelope)
    setError(err.message);
  }
}
```

---

## Centralized API Error Transformation (`services/api.ts`)

The Axios **response interceptor** runs on every failed request and performs three steps:

```mermaid
flowchart TD
    Fail["Non-2xx response"]
    IsAxios{axios.isAxiosError?}
    Extract["Extract message:\n1. response.data.message\n2. error.message\n3. Generic fallback"]
    Is401{statusCode === 401?}
    Clear["Clear token\nRedirect → /login?expired=true"]
    Reject["throw new ApiError(statusCode, message)"]
    PassThrough["re-throw as-is\n(non-Axios error)"]

    Fail --> IsAxios
    IsAxios -- yes --> Extract
    Extract --> Is401
    Is401 -- yes --> Clear --> Reject
    Is401 -- no --> Reject
    IsAxios -- no --> PassThrough
```

**Message resolution priority:**

1. `response.data.message` — the backend's standardized envelope field
2. `error.message` — Axios network message (e.g. `"Network Error"`)
3. `"An unexpected error occurred. Please try again."` — generic fallback

---

## Validation Errors (Zod)

Zod schemas in `lib/validators/` validate form data **before** any API call is made.

### Usage Pattern

```typescript
import { createTrekSchema } from "../lib/validators/tourValidators";

const result = createTrekSchema.safeParse(formData);
if (!result.success) {
  const fieldErrors = result.error.flatten().fieldErrors;
  // e.g. { name: ["Trek name must be at least 3 characters"] }
  setErrors(fieldErrors);
  return; // stop before calling the service
}
// Only call service when data is clean
await TourService.createTour(result.data);
```

Validation errors appear immediately in the UI on field blur or form submit — no network round-trip required.

---

## AuthContext Error Handling

Login errors are caught, converted to strings, and stored in `AuthContext.error`. The `Login.tsx` page reads this value and renders it inline.

```typescript
// AuthContext.login()
try {
  const { user, token } = await AuthService.loginWithGoogle(idToken);
  // ...
} catch (err: unknown) {
  const message = getErrorMessage(err, "Failed to login with Google");
  setError(message); // store for UI
  throw new Error(message); // re-throw so Login.tsx can respond
}
```

The internal `getErrorMessage()` helper handles three cases:

1. Axios-style error: `err.response.data.message`
2. Standard `Error`: `err.message`
3. Plain string: used as-is

---

## ErrorBoundary (`components/shared/ErrorBoundary.tsx`)

A React class-based Error Boundary wraps the entire application in `App.tsx`. It catches:

- Uncaught runtime JavaScript errors during rendering
- Errors thrown in lifecycle methods of child components

```mermaid
flowchart LR
    Runtime["Uncaught render error"]
    EB["ErrorBoundary.getDerivedStateFromError()"]
    Fallback["Render fallback UI\n'Something went wrong'"]
    Normal["Normal render"]

    Runtime --> EB
    EB -- hasError=true --> Fallback
    EB -- hasError=false --> Normal
```

> **Note:** `ErrorBoundary` does **not** catch errors in async event handlers, `setTimeout`, or server calls. Those are handled by `try/catch` in services and hooks.

---

## Error Handling Checklist

When adding a new feature, ensure:

- [ ] Service method is wrapped in a try/catch in the calling hook or component
- [ ] User-facing error messages come from `err.message` (never expose raw stack traces)
- [ ] `instanceof ApiError` is used to distinguish API errors from programming bugs
- [ ] Form submission validates with Zod `.safeParse()` _before_ calling the service
- [ ] Loading states are set correctly (`setLoading(true/false)`) around async calls
