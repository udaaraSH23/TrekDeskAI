# Authentication Feature

## Overview

Authentication uses **Google OAuth 2.0** plus a **Dev Secret** bypass for local testing. Implemented as a vertical feature in `src/features/auth` with centralized token handling and route protection.

## Flows

### Architecture

```mermaid
graph TD
    User["dY` Admin User"]

    subgraph Frontend Logic
        Provider["AuthProvider.tsx\n(State Owner)"]
        Hook["useAuth.ts\n(Consumer API)"]
        Service["AuthService.ts\n(API Layer)"]
        Interceptor["api.ts\n(Axios Interceptor)"]
    end

    subgraph Identity Providers
        Google["Google Identity Services\n(ID Token)"]
        Dev["Dev Secret\n(Env Var)"]
    end

    Backend["TrekDesk Backend\n(/auth/verify, /auth/google)"]

    User -->|"Interacts"| Provider
    Provider --> Service
    Service --> Interceptor
    Interceptor --> Backend
    Provider -.->|"Exposes state via"| Hook
    User -->|"Authenticates with"| Google
    User -->|"Bypasses with"| Dev
```

### Google OAuth Authentication

```mermaid
sequenceDiagram
    participant U as Admin User
    participant G as Google Login UI
    participant C as Login.tsx
    participant S as AuthService.ts
    participant B as Backend API

    U->>G: Click "Sign in with Google"
    G-->>C: Returns Google ID Token
    C->>S: Exchange ID Token for Session
    S->>B: POST /auth/google { idToken }
    B-->>S: 200 { user, token }
    S->>S: Store token in localStorage
    S-->>C: Success
    C->>C: Redirect to Dashboard
```

### Session Initialization

```mermaid
sequenceDiagram
    participant P as AuthProvider
    participant S as AuthService
    participant B as Backend API
    participant LS as LocalStorage

    P->>LS: Read "trekdesk_token"
    alt Token exists
        P->>S: verifySession()
        S->>B: GET /auth/verify
        alt Valid JWT
            B-->>P: User metadata
            P->>P: setUser(user)
        else Expired/Invalid
            B-->>P: 401 Unauthorized
            P->>LS: clearToken()
        end
    end
    P->>P: setLoading(false)
```

## Data Contracts

- Endpoints: `POST /auth/google`, `POST /auth/dev`, `GET /auth/verify`.
- Types: `user`, `token`, and error payloads aligned with backend schemas.
- Token storage: `localStorage["trekdesk_token"]`; Axios interceptor attaches Bearer.
- Headers: `x-skip-toast` to suppress global toasts on login/verify failures.

## State Ownership

- Context: `AuthProvider` holds `user`, `loading`, `error`, and actions (`login`, `devLogin`, `logout`).
- Server state: session verification handled via AuthService calls (not cached in Query).
- UI state: `ProtectedRoute` gates routes; loading gate prevents redirect flicker.

## UI Composition

- **Login.tsx**: Google button + dev secret input (behind flag).
- **ProtectedRoute.tsx**: guards authed routes and preserves redirect intent.
- **AuthProvider.tsx**: wraps router; initializes session on mount.

## Edge Cases & Constraints

- Token expiry: 401 clears token and redirects to `/login?expired=true`.
- Dev secret guarded by env flag; omit in production builds.
- Ensure loading gate remains until verify completes to avoid flash of unauth content.

## Testing Notes

- Google flow: mock token exchange success/failure; localStorage set/clear.
- Session init: token present vs missing vs expired; redirects after logout.
- ProtectedRoute: ensures unauth users redirected with `from` saved.
- Dev login: enabled only when flag set; rejects invalid secret.
