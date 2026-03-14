# Authentication Flow

## Overview

Two login modes are supported:

| Mode                  | Used In          | Flow                           |
| --------------------- | ---------------- | ------------------------------ |
| **Google OAuth**      | Production       | Google ID Token → Backend JWT  |
| **Dev Secret Bypass** | Development only | Plaintext secret → Backend JWT |

Both flows result in a backend-issued JWT, stored in `localStorage`, and attached to every subsequent API request via an Axios request interceptor.

---

## Google OAuth Login — Full Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login.tsx
    participant G as @react-oauth/google
    participant GS as Google OAuth servers
    participant A as AuthContext.login()
    participant S as AuthService.loginWithGoogle()
    participant API as api.ts (Axios)
    participant B as Backend /auth/google
    participant LS as localStorage

    U->>L: Click "Sign in with Google"
    L->>G: useGoogleLogin()
    G->>GS: OAuth consent flow (popup/redirect)
    GS-->>G: Authorization Code
    G->>GS: Exchange code for tokens
    GS-->>G: { credential: idToken }
    G-->>L: onSuccess({ credential })
    L->>A: login(idToken)
    A->>S: loginWithGoogle(idToken)
    S->>API: POST /auth/google { idToken }
    API->>B: HTTP POST
    B->>B: Verify ID token with Google
    B-->>API: 200 { data: { user, token } }
    API-->>S: response.data
    S-->>A: { user, token }
    A->>LS: setItem("trekdesk_token", token)
    A->>A: setUser(userData)
    A-->>L: loading=false, user set
    L->>L: React Router → redirect to /
```

---

## Dev Secret Login — Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant L as Login.tsx
    participant A as AuthContext.devLogin()
    participant S as AuthService.loginWithDevSecret()
    participant B as Backend /auth/dev-login

    U->>L: Enter dev secret + click Login
    L->>A: devLogin(secret)
    A->>S: loginWithDevSecret(secret)
    S->>B: POST /auth/dev-login { secret }
    B->>B: Validate secret (env var check only)
    B-->>S: 200 { data: { user, token } }
    S-->>A: { user, token }
    A->>A: setToken(token), setUser(user)
```

> **Security note:** The dev-login endpoint is disabled at the backend level when `NODE_ENV=production`. The secret is never validated client-side.

---

## Token Lifecycle

```mermaid
stateDiagram-v2
    [*] --> NoToken: First visit / after logout

    NoToken --> LoggingIn: User clicks login
    LoggingIn --> Authenticated: Token received from backend
    LoggingIn --> NoToken: Login fails

    Authenticated --> VerifyingSession: App reloaded\n(AuthProvider mount)
    VerifyingSession --> Authenticated: Token valid
    VerifyingSession --> NoToken: Token expired / invalid\n(clearToken called)

    Authenticated --> NoToken: User logs out\n(logout() called)
    Authenticated --> NoToken: 401 response intercepted\n(api.ts auto-clears token)
```

### Token Storage

| Key              | Location       | Type                |
| ---------------- | -------------- | ------------------- |
| `trekdesk_token` | `localStorage` | Bearer JWT (string) |

The token is read by the **request interceptor** in `api.ts` on every API call:

```ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("trekdesk_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### 401 Auto-Logout

The **response interceptor** in `api.ts` handles 401 responses globally:

```ts
if (statusCode === 401) {
  localStorage.removeItem("trekdesk_token");
  if (!window.location.pathname.includes("/login")) {
    window.location.href = "/login?expired=true";
  }
}
```

This means any protected page that receives a 401 will automatically redirect the user to the login page with a `?expired=true` query param, which the Login page can use to show an "Your session has expired" message.

---

## ProtectedRoute Guard

`src/features/auth/components/ProtectedRoute.tsx` wraps all dashboard routes. It reads from `AuthContext` and:

1. **If `loading` is true** → Renders a full-screen spinner (prevents login-flash during session verification)
2. **If `user` is null** → Redirects to `/login`, preserving the original path in `location.state.from`
3. **If `user` is set** → Renders children

```mermaid
flowchart TD
    Mount["ProtectedRoute mounts"]
    Loading{loading?}
    User{user?}
    Spinner["🔄 Full-screen spinner"]
    Redirect["Redirect to /login\nstate.from = current path"]
    Children["Render children"]

    Mount --> Loading
    Loading -- yes --> Spinner
    Loading -- no --> User
    User -- null --> Redirect
    User -- set --> Children
```

---

## Logout

Logout is entirely client-side — the backend JWT is _not_ invalidated on the server. This is an acceptable trade-off for a short-lived dashboard JWT (typical expiry: 24h).

```ts
// AuthContext.logout()
const logout = () => {
  AuthService.clearToken(); // removes trekdesk_token from localStorage
  setUser(null); // triggers ProtectedRoute → redirect
};
```
