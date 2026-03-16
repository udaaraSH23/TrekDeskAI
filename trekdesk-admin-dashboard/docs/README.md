# TrekDesk Admin Dashboard Docs

Docs are split into **system guides** (root) and **feature guides** (`features/`). Diagrams stay with their topics.

## System Guides

- `ARCHITECTURE.md` — app shell, routing map, provider tree, directory guide.
- `STATE_MANAGEMENT.md` — server/UI/auth state model and query key conventions.
- `VALIDATION.md` — Zod patterns and backend alignment.
- `TESTING.md` — test stack, commands, conventions.
- `VOICE_ARCHITECTURE.md` — VAD + WebSocket flow (voice subsystem).
- `ERROR_HANDLING.md`, `services/`, `components/` — focused deep-dives.
  - `components/UI_COMPONENTS.md` — design-system primitives.
  - `services/SERVICES.md` — API services overview.

## Feature Guides (`features/`)

- `FEATURE_AUTH.md` — Google OAuth + dev secret flows.
- `FEATURE_PERSONA.md` — persona editor + preview bridge.
- `FEATURE_KNOWLEDGE.md` — RAG ingestion and semantic search.
- `FEATURE_TOURS.md` — tour management, pricing tiers.
- `FEATURE_WIDGET.md` — embed config, iframe delivery, voice lifecycle.
- `FEATURE_CONVERSATIONS.md` — call logs + transcript viewer.
- `FEATURE_DIAGNOSTICS.md` — AI debugger and tool tracing.
- `FEATURE_OVERVIEW.md` — dashboard KPIs + Voice Playground launcher.
- `FEATURE_VOICE.md` — Voice Playground internals (hooks/services) + link to voice architecture.
- `FEATURE_SHARED.md` — placeholder page used for stub routes.

## Authoring Template

Use this outline for any new `FEATURE_*.md`:

1. Overview
2. Flows (Mermaid sequence/flow)
3. Data contracts (endpoints, types, validators, query keys)
4. State ownership (Query vs Context vs Zustand)
5. UI composition (page + key components)
6. Edge cases/constraints
7. Testing notes (critical scenarios)
