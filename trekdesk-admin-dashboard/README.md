# TrekDesk AI — Admin Dashboard

> Production administration dashboard for the **TrekDesk AI** platform — an AI-powered voice assistant for trekking tour operators. Manage AI persona settings, tour knowledge bases, widget configuration, and monitor call analytics from a single, secure interface.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Authentication](#authentication)
- [Architecture Overview](#architecture-overview)
- [Available Scripts](#available-scripts)
- [Testing](#testing)
- [API Documentation](#api-documentation)

---

## Tech Stack

| Category       | Technology                   | Version |
| -------------- | ---------------------------- | ------- |
| UI Framework   | React                        | 19      |
| Language       | TypeScript                   | ~5.9    |
| Build Tool     | Vite                         | 7       |
| Routing        | React Router DOM             | 7       |
| Server State   | TanStack Query (React Query) | 5       |
| Client State   | Zustand                      | 5       |
| HTTP Client    | Axios                        | 1       |
| Validation     | Zod                          | 4       |
| Authentication | @react-oauth/google          | 0.13    |
| Icons          | Lucide React                 | Latest  |
| Testing        | Vitest + Testing Library     | Latest  |

---

## Project Structure

```
trekdesk-admin-dashboard/
├── src/
│   ├── main.tsx                  # App bootstrap + provider tree
│   ├── App.tsx                   # Root router config (lazy loaded routes)
│   │
│   ├── pages/                    # Route-level page components
│   │   ├── Login.tsx             # Google OAuth + dev-login entry
│   │   ├── Overview.tsx          # Dashboard home with analytics
│   │   ├── Conversations.tsx     # Call log viewer and transcript
│   │   ├── Persona.tsx           # AI persona/prompt configuration
│   │   ├── KnowledgeBase.tsx     # RAG doc ingestion + search
│   │   └── WidgetConfig.tsx      # Embeddable widget customizer
│   │
│   ├── components/
│   │   ├── Header.tsx            # Top bar with search + profile
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   ├── ProtectedRoute.tsx    # Auth guard component
│   │   ├── ui/                   # Reusable design-system components
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx          # Card + CardHeader/Content/Footer
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   └── shared/
│   │       └── ErrorBoundary.tsx
│   │
│   ├── context/
│   │   └── AuthContext.tsx       # Auth state Provider
│   │
│   ├── hooks/                    # TanStack Query data hooks
│   │   ├── useAnalytics.ts
│   │   ├── useKnowledge.ts
│   │   ├── usePersona.ts
│   │   └── useTours.ts
│   │
│   ├── services/                 # API communication layer
│   │   ├── api.ts                # Axios instance + interceptors
│   │   ├── AuthService.ts
│   │   ├── AnalyticsService.ts
│   │   ├── KnowledgeService.ts
│   │   ├── PersonaService.ts
│   │   └── TourService.ts
│   │
│   ├── store/
│   │   └── uiStore.ts            # Zustand: sidebar + theme state
│   │
│   ├── lib/
│   │   ├── queryClient.ts        # Singleton TanStack Query client
│   │   ├── errors/
│   │   │   └── ApiError.ts       # Typed error class for API failures
│   │   └── validators/           # Client-side Zod schemas
│   │       ├── knowledgeValidators.ts
│   │       ├── personaValidators.ts
│   │       └── tourValidators.ts
│   │
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.types.ts          # Shared API envelope types
│   │   ├── auth.types.ts
│   │   ├── analytics.types.ts
│   │   ├── knowledge.types.ts
│   │   ├── persona.types.ts
│   │   └── tour.types.ts
│   │
│   └── layouts/
│       └── Layout.tsx            # Shell: Sidebar + Header + <Outlet>
│
├── docs/                         # Architecture & reference documentation
│   ├── ARCHITECTURE.md
│   ├── STATE_MANAGEMENT.md
│   ├── AUTH_FLOW.md
│   ├── ERROR_HANDLING.md
│   ├── VALIDATION.md
│   ├── TESTING.md
│   ├── components/
│   ├── pages/
│   ├── services/
│   ├── hooks/
│   └── api/                      # TypeDoc-generated HTML reference
│
├── typedoc.json                  # TypeDoc config
├── vite.config.ts
├── tsconfig.app.json
└── package.json
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A Google OAuth Client ID (for login)
- The TrekDesk backend running (see `trekdesk-backend-prod`)

### Installation

```bash
# 1. Install dependencies
npm install

# 2. Copy the example env file and fill in your values
cp .env.example .env
```

### Development Server

```bash
npm run dev
# → http://localhost:5173
```

---

## Environment Variables

| Variable                | Required | Description                                                    |
| ----------------------- | -------- | -------------------------------------------------------------- |
| `VITE_API_URL`          | Yes      | Backend API base URL (e.g. `http://localhost:3001/api/v1`)     |
| `VITE_GOOGLE_CLIENT_ID` | Yes      | Google OAuth 2.0 Client ID                                     |
| `VITE_ENABLE_DEV_LOGIN` | No       | Set to `"true"` to show the dev-login bypass on the Login page |

---

## Authentication

The app supports two login flows:

1. **Google OAuth** (production) — Uses `@react-oauth/google`. The Google ID Token is exchanged for a backend-issued JWT via `POST /auth/google`.
2. **Dev Secret Bypass** (development only) — A plaintext secret exchanged via `POST /auth/dev-login`. Only visible when `VITE_ENABLE_DEV_LOGIN=true`. Completely disabled at the backend in production.

The JWT is persisted in `localStorage` under the key `trekdesk_token` and automatically attached to every API request via an Axios request interceptor. On a 401 response, the interceptor clears the token and redirects to `/login?expired=true`.

See [docs/AUTH_FLOW.md](docs/AUTH_FLOW.md) for the full sequence diagram.

---

## Architecture Overview

```
Browser
  └── React SPA (Vite)
        ├── AuthProvider (AuthContext)   → session state
        ├── QueryClientProvider          → server-state cache
        ├── GoogleOAuthProvider          → OAuth identity
        └── App (React Router)
              ├── /login                → Login page (public)
              └── /*  [ProtectedRoute]
                    └── Layout
                          ├── Sidebar
                          ├── Header
                          └── <Page>
                                └── useFoo() hook
                                      └── FooService
                                            └── api.ts (Axios)
                                                  └── Backend API
```

**State is split into two tiers:**

- **Server state** (API data) → TanStack Query cache, managed via hooks in `src/hooks/`
- **Client/UI state** (sidebar, theme) → Zustand store in `src/store/uiStore.ts`

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full architecture doc with Mermaid diagrams.

---

## Available Scripts

| Script     | Command            | Description                                 |
| ---------- | ------------------ | ------------------------------------------- |
| Dev Server | `npm run dev`      | Start Vite HMR dev server on port 5173      |
| Build      | `npm run build`    | TypeScript compile + Vite production bundle |
| Preview    | `npm run preview`  | Serve the production build locally          |
| Lint       | `npm run lint`     | Run ESLint over the entire `src/`           |
| Test       | `npm test`         | Run Vitest in watch mode                    |
| Test (CI)  | `npx vitest --run` | Single-pass test run (for CI pipelines)     |
| API Docs   | `npm run docs:api` | Generate TypeDoc HTML into `docs/api/`      |

---

## Testing

The test suite uses **Vitest** + **@testing-library/react** + **jsdom**.

```bash
# Watch mode (during development)
npm test

# Single-pass run (CI / pre-commit)
npx vitest --run
```

Test files sit alongside source files (`*.test.ts` / `*.test.tsx`). Coverage areas:

- **UI Components**: `Button`, `Input`, `Card`, `Badge`
- **Zustand store**: `uiStore`
- **Validators**: all Zod schemas in `lib/validators/`
- **ApiError class**: `lib/errors/ApiError.test.ts`

See [docs/TESTING.md](docs/TESTING.md) for full testing guide and patterns.

---

## API Documentation

Auto-generated TypeDoc reference from all `src/` modules.

```bash
npm run docs:api
# → Open docs/api/index.html in your browser
```

Hand-written reference docs are in the `docs/` folder:

| Document                                                                | Description                                     |
| ----------------------------------------------------------------------- | ----------------------------------------------- |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md)                                 | System architecture, folder guide, routing map  |
| [STATE_MANAGEMENT.md](docs/STATE_MANAGEMENT.md)                         | Zustand + TanStack Query state model            |
| [AUTH_FLOW.md](docs/AUTH_FLOW.md)                                       | Auth sequence diagrams, token lifecycle         |
| [ERROR_HANDLING.md](docs/ERROR_HANDLING.md)                             | Centralized error handling strategy             |
| [VALIDATION.md](docs/VALIDATION.md)                                     | Zod schema catalogue and usage patterns         |
| [TESTING.md](docs/TESTING.md)                                           | Test setup, patterns, and coverage guide        |
| [components/UI_COMPONENTS.md](docs/components/UI_COMPONENTS.md)         | Button, Input, Card, Badge props reference      |
| [components/LAYOUT_COMPONENTS.md](docs/components/LAYOUT_COMPONENTS.md) | Header, Sidebar, ProtectedRoute                 |
| [pages/PAGES.md](docs/pages/PAGES.md)                                   | Per-page route, data, and interaction reference |
| [services/SERVICES.md](docs/services/SERVICES.md)                       | Per-service method and endpoint table           |
| [hooks/HOOKS.md](docs/hooks/HOOKS.md)                                   | Hook purpose, query keys, return shape          |
