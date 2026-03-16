# TrekDesk Backend Docs

Docs are split into **system guides** (root) and **feature guides** (`features/`). Existing diagrams are preserved as-is; new diagrams are added only when a topic lacks one.

## System Guides

- `ARCHITECTURE.md` — layered architecture (controller/service/repo), DI wiring, tenancy.
- `AUTHENTICATION.md` — Google OAuth + JWT flow (sequence diagrams).
- `API_REFERENCE.md` — REST endpoints by domain.
- `DATABASE_SCHEMA.md` — PostgreSQL + pgvector ERD and tables.
- `RAG_PIPELINE.md` — ingestion → retrieval → live tool-calling integration.
- `REALTIME_VOICE_AI.md` — Gemini Multimodal Live API WebSocket proxying + tool calling.
- `DEVELOPMENT_WORKFLOW.md` — lint/format/hooks conventions.
- `CLOUD_SQL_SETUP.md` — Cloud SQL Proxy + pgvector setup.
- `typedoc/` — generated reference output (do not edit by hand).

## Feature Guides (`features/`)

- `FEATURE_PERSONA.md` — AI settings persistence + session injection.
- `FEATURE_TOURS.md` — tour CRUD and tenant scoping.
- `FEATURE_WIDGET.md` — widget settings + origin validation + public chat.
- `FEATURE_KNOWLEDGE_BASE.md` — knowledge ingest/search internals + pgvector queries.
- `FEATURE_CONVERSATIONS.md` — voice session → call log persistence → analytics endpoints.
- `FEATURE_DIAGNOSTICS.md` — dev tooling, tool trace capture, registry endpoints.
