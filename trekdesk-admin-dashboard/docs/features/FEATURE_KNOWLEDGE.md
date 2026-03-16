# Knowledge Base & RAG Feature

## Overview

Provides ingestion, management, and semantic search over trekking content using a RAG pipeline (Gemini embeddings + pgvector). Powers the AI assistant with domain context.

## Flows

### High-Level Architecture

```mermaid
graph TD
    A[Admin Dashboard] -- Paste Text --> B[Ingest Service]
    B -- Call Gemini API --> C[Vector Embeddings - 768d]
    C -- Store in --> D[(pgvector - PostgreSQL)]

    subgraph "Retrieval Phase (Live Call)"
        E[User Query] -- Vectorize --> F[Vector Search]
        F -- Top K Chunks --> G[AI Prompt Augmentation]
        D --> F
    end
```

### Content Ingestion Flow

```mermaid
sequenceDiagram
    participant AD as Admin Dashboard
    participant API as Backend API
    participant GEM as Gemini API
    participant DB as pgvector Database

    AD->>API: POST /knowledge/ingest (Raw Text)
    API->>GEM: Generate Vector Embeddings (768 dimensions)
    GEM-->>API: Vector Buffer
    API->>DB: INSERT INTO knowledge_base (content, embedding)
    DB-->>API: 201 Created
    API-->>AD: 200 OK (Content Indexed)
```

### Semantic Retrieval Flow

```mermaid
sequenceDiagram
    participant UI as Search UI
    participant API as Backend API
    participant DB as pgvector Database

    UI->>API: GET /knowledge/search?q="Knuckles Range"
    API->>API: Convert Query to Vector
    API->>DB: SELECT content (order by embedding <=> query_vector)
    DB-->>API: Top 5 Relevant Chunks
    API-->>UI: Results + Similarity Scores
```

## Data Contracts

- Endpoints: `POST /knowledge/ingest`, `GET /knowledge/search`, `PUT /knowledge/:id`, `DELETE /knowledge/:id`.
- Types: chunks with `id`, `content`, `embedding`, `metadata`; search returns results with similarity.
- Validators: `ingestKnowledgeSchema`, `knowledgeSearchSchema` (see `VALIDATION.md`).
- Query keys: `["knowledge"]` (list), `["knowledge", "search", query]` (search results).
- Embeddings: Gemini text embeddings (768 dimensions), stored in `pgvector`.

## State Ownership

- Server data: TanStack Query hooks in `features/knowledge/hooks` for list/search/mutations.
- UI state: local form state for ingestion + search inputs; modal state for edit/delete confirmations.
- Auth: gated via `ProtectedRoute`.

## UI Composition

- **IngestSection**: paste/upload content, submits to ingest endpoint.
- **KnowledgeManager**: list + inline edit/delete; re-embeds on edit.
- **SemanticSearch**: test retrieval with query and similarity scores.

## Edge Cases & Constraints

- Large text is chunked before embedding; enforce min/max length per validator.
- UUID validation for optional `trek_id`; metadata must be key/value strings.
- Avoid redundant documents to keep retrieval precise; delete stale versions.

## Testing Notes

- Ingestion: valid/invalid payloads, UUID checks, max length handling.
- Search: minimum query length, pagination/top-K handling, cache keys per query.
- Edit/delete: optimistic updates vs invalidation; ensure embeddings refresh on edit.
- Error surfaces: backend failures show toast + inline errors without double submission.
