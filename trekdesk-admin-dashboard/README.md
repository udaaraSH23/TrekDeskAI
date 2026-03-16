# TrekDesk AI — Admin Dashboard

Production administration dashboard for the TrekDesk AI platform (AI-powered voice assistant for trekking tour operators). Manage AI persona settings, tour knowledge bases, widget configuration, and monitor call analytics from a single, secure interface.

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
- [Documentation](#documentation)
- [Deployment & Hosting](#deployment--hosting)

---

## Tech Stack

| Category       | Technology                                  | Version       |
| -------------- | ------------------------------------------- | ------------- |
| UI Framework   | React                                       | 19            |
| Language       | TypeScript                                  | ~5.9          |
| Build Tool     | Vite                                        | 7             |
| Routing        | React Router DOM                            | 7             |
| Server State   | TanStack Query (React Query)                | 5             |
| Client State   | Zustand                                     | 5             |
| HTTP Client    | Axios                                       | 1             |
| Validation     | Zod                                         | 4             |
| Authentication | Google Identity SDK (`@react-oauth/google`) | 0.13          |
| Voice / VAD    | `@ricky0123/vad-web` + `onnxruntime-web`    | 0.0.30 / 1.24 |
| Icons          | Lucide React                                | Latest        |
| Testing        | Vitest + Testing Library                    | Latest        |

---

## Project Structure

```
trekdesk-admin-dashboard/
├─ src/
│  ├─ assets/
│  ├─ components/          # layout, shared, ui primitives
│  ├─ features/            # auth, conversations, devtools, knowledge, overview, persona, shared, tours, voice, widget
│  ├─ layouts/
│  ├─ lib/                 # queryClient, errors, validators
│  ├─ services/            # api.ts
│  ├─ store/               # Zustand stores
│  ├─ types/
│  ├─ App.tsx, main.tsx, index.css, setupTests.ts
├─ public/
│  └─ vad/                 # VAD/ONNX assets (synced by script)
├─ scripts/
│  └─ sync-vad-assets.js   # copies VAD + ONNX runtime into public/vad
├─ docs/                   # architecture, feature, and reference docs
│  ├─ README.md
│  ├─ ARCHITECTURE.md
│  ├─ STATE_MANAGEMENT.md
│  ├─ ERROR_HANDLING.md
│  ├─ VALIDATION.md
│  ├─ TESTING.md
│  ├─ VOICE_ARCHITECTURE.md
│  ├─ components/
│  ├─ services/
│  └─ features/            # FEATURE_*.md per domain
├─ Dockerfile
├─ firebase.json / .firebaserc
├─ typedoc.json
├─ vite.config.ts
├─ tsconfig*.json
├─ package.json / package-lock.json
└─ .env, .gitignore, LICENSE
```

---

## Getting Started

### Prerequisites

- Node.js ≥ 18
- npm ≥ 9
- Google OAuth Client ID
- TrekDesk backend running

### Installation

```bash
npm install
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

Two login flows:

1. **Google OAuth** (production) — `POST /auth/google` exchanges Google ID Token for JWT.
2. **Dev Secret** (development) — `POST /auth/dev-login`, shown only when `VITE_ENABLE_DEV_LOGIN=true`.

JWT stored in `localStorage` (`trekdesk_token`) and attached via Axios interceptor. On 401, token is cleared and user is redirected to `/login?expired=true`.

Auth diagrams and flows: `docs/features/FEATURE_AUTH.md`.

---

## Architecture Overview

```
Browser
  └─ React SPA (Vite)
       ├─ AuthProvider (AuthContext)    → session state
       ├─ QueryClientProvider           → server-state cache
       ├─ GoogleOAuthProvider           → OAuth identity
       └─ App (React Router)
            ├─ /login                   → Login page (public)
            └─ /* [ProtectedRoute]
                 └─ Layout (Sidebar + Header + <Outlet>)
                      └─ <Page> → useXxx hook → XxxService → api.ts → Backend API
```

State tiers:

- **Server state**: TanStack Query hooks (features/\*/hooks/).
- **Client/UI state**: Zustand `uiStore` for sidebar/theme.

See `docs/ARCHITECTURE.md` for diagrams; voice system details in `docs/VOICE_ARCHITECTURE.md`.

---

## Available Scripts

| Script          | Command                           | Description                                                               |
| --------------- | --------------------------------- | ------------------------------------------------------------------------- |
| Dev Server      | `npm run dev`                     | Start Vite HMR dev server on port 5173                                    |
| Build           | `npm run build`                   | TypeScript compile + Vite production bundle                               |
| Preview         | `npm run preview`                 | Serve the production build locally                                        |
| Lint            | `npm run lint`                    | Run ESLint over the entire `src/`                                         |
| Test            | `npm test`                        | Run Vitest in watch mode                                                  |
| Test (CI)       | `npx vitest --run`                | Single-pass test run (for CI pipelines)                                   |
| Sync VAD assets | `node scripts/sync-vad-assets.js` | Copy VAD + ONNX runtime assets into `public/vad` (post-install/pre-build) |

---

## Testing

Uses **Vitest** + **@testing-library/react** + **jsdom**.

```bash
npm test             # watch mode
npx vitest --run     # single-pass (CI/pre-commit)
```

Full guidance: `docs/TESTING.md`.

---

## Documentation

- **Docs index:** `docs/README.md`
- **Architecture:** `docs/ARCHITECTURE.md`
- **State model:** `docs/STATE_MANAGEMENT.md`
- **Validation:** `docs/VALIDATION.md`
- **Testing:** `docs/TESTING.md`
- **Voice system:** `docs/VOICE_ARCHITECTURE.md`
- **Feature guides:** `docs/features/FEATURE_*.md` (tours, knowledge/RAG, persona, widget, auth, conversations, diagnostics, overview, voice, shared)
- **Supporting references:** `docs/components/UI_COMPONENTS.md`, `docs/services/SERVICES.md`, `docs/ERROR_HANDLING.md`

---

## Deployment & Hosting

- **Firebase Hosting:** `firebase.json` serves `dist/` with SPA rewrites to `index.html`. Run `npm run build` before deploy.
- **Docker:** Multi-stage Dockerfile (Node build → unprivileged Nginx). Build image; default port 8080.
- **Voice assets:** Run `node scripts/sync-vad-assets.js` after install to copy VAD/ONNX artifacts into `public/vad` (required for VAD-powered voice sessions).
