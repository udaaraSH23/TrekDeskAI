# Pages Reference

All pages live in `src/pages/` and are lazy-loaded via `React.lazy()`. They are the top-level consumer of hooks and are responsible for rendering the full-page data view.

---

## Login

**File:** `src/pages/Login.tsx`
**Route:** `/login`
**Protected:** No

### Purpose

Entry point for authentication. Supports two login modes:

1. **Google OAuth** (always available) — renders the `@react-oauth/google` login button
2. **Dev Secret input** (visible only when `VITE_ENABLE_DEV_LOGIN=true`) — a text input + button that exchanges a plaintext secret for a JWT

### Data Dependencies

| Dependency         | Source      | Used For                              |
| ------------------ | ----------- | ------------------------------------- |
| `login(idToken)`   | `useAuth()` | Google OAuth login                    |
| `devLogin(secret)` | `useAuth()` | Dev secret login                      |
| `error`            | `useAuth()` | Displays login error messages         |
| `loading`          | `useAuth()` | Disables button during login call     |
| `user`             | `useAuth()` | Redirects to `/` if already logged in |

### Key Interactions

- On successful login: React Router redirects to `/` (or `location.state.from` if coming from a protected redirect)
- On failure: `error` string from `AuthContext` is displayed inline

---

## Overview

**File:** `src/pages/Overview.tsx`
**Route:** `/`
**Protected:** Yes

### Purpose

Dashboard home. Displays aggregate KPI cards and a recent call log table.

### Data Dependencies

| Hook                  | Data        | Used For                                                |
| --------------------- | ----------- | ------------------------------------------------------- |
| `useAnalyticsStats()` | `CallStats` | KPI metric cards (total calls, avg duration, sentiment) |
| `useCallLogs()`       | `CallLog[]` | Recent activity log table                               |

### Key Interactions

- Stats cards show loading skeletons while `isLoading: true`
- Error state shows an error badge if the API call fails
- Call log rows are sortable/filterable (if implemented)

---

## Conversations

**File:** `src/pages/Conversations.tsx`
**Route:** `/conversations`
**Protected:** Yes

### Purpose

Displays the full call log list. Selecting a log shows the full transcript in a side panel.

### Data Dependencies

| Hook                    | Data        | Used For                                                      |
| ----------------------- | ----------- | ------------------------------------------------------------- |
| `useCallLogs()`         | `CallLog[]` | Left-side call list                                           |
| `useCallLogDetails(id)` | `CallLog`   | Full transcript on right, enabled only when a log is selected |

### Key State

| State           | Type             | Description                         |
| --------------- | ---------------- | ----------------------------------- |
| `selectedLogId` | `string \| null` | ID of the currently viewed call log |

### Key Interactions

- Clicking a call log row → sets `selectedLogId` → triggers `useCallLogDetails`
- Transcript renders each `TranscriptMessage` with role-based styling (user vs. AI)
- Duration and sentiment score are displayed per log entry

---

## Persona

**File:** `src/pages/Persona.tsx`
**Route:** `/persona`
**Protected:** Yes

### Purpose

Allows admins to configure the AI voice assistant's name, system prompt, and response temperature.

### Data Dependencies

| Hook                         | Data              | Used For                     |
| ---------------------------- | ----------------- | ---------------------------- |
| `usePersonaSettings()`       | `PersonaSettings` | Populates the form on load   |
| `useUpdatePersonaSettings()` | mutation          | Saves changes on form submit |

### Validation

Form is validated with `updatePersonaSchema` (Zod) before the mutation fires. Inline errors appear for each field.

### Key Interactions

- On mount: form is pre-populated with current settings from the API
- On save: validates → `mutate()` → success toast or error message
- Unsaved changes warning: shown if user navigates away with a dirty form (if implemented)

---

## KnowledgeBase

**File:** `src/pages/KnowledgeBase.tsx`
**Route:** `/knowledge`
**Protected:** Yes

### Purpose

Two-panel page for RAG (Retrieval-Augmented Generation) management:

1. **Ingest** — a textarea + metadata form for adding new knowledge chunks
2. **Search** — a search bar that runs semantic similarity queries

### Data Dependencies

| Hook                        | Data                      | Used For                      |
| --------------------------- | ------------------------- | ----------------------------- |
| `useIngestKnowledge()`      | mutation                  | Ingests a new document chunk  |
| `useKnowledgeSearch(query)` | `KnowledgeSearchResult[]` | Shows semantic search results |

### Validation

- Ingest form validated with `ingestKnowledgeSchema`
- Search input validated with `knowledgeSearchSchema` (query must be min 3 chars)

### Key Interactions

- After successful ingest: ingest form resets; knowledge search cache is invalidated
- Search is debounced (if implemented) to avoid firing on every keystroke
- Each search result shows content + similarity score

---

## WidgetConfig

**File:** `src/pages/WidgetConfig.tsx`
**Route:** `/widget`
**Protected:** Yes

### Purpose

Allows admins to customize the embeddable chat widget appearance and behavior, and to manage tour offerings that the widget can promote.

### Data Dependencies

| Hook              | Data     | Used For                          |
| ----------------- | -------- | --------------------------------- |
| `useTours()`      | `Trek[]` | Renders the list of current tours |
| `useCreateTour()` | mutation | Adds a new tour                   |
| `useUpdateTour()` | mutation | Edits an existing tour            |
| `useDeleteTour()` | mutation | Removes a tour                    |

### Validation

Tour create/update forms are validated with `createTrekSchema` / `updateTrekSchema`.

### Key Interactions

- Tour list table: supports inline edit and delete per row
- Create tour: modal or inline form with Zod-validated fields
- Widget preview: visual preview panel (static or iframe embed)
- Embed code: auto-generated `<script>` snippet the admin can copy

---

## PlaceholderPage

**File:** `src/pages/PlaceholderPage.tsx`

A bare placeholder used for routes that are not yet implemented. Not linked in the main route config.
