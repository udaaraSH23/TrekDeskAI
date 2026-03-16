# Knowledge Base Technical Flow

This document details the internal request lifecycle for the Knowledge Base (RAG) feature, tracing a request from the public API endpoint down to the specialized vector database operations.

## 1. Architectural Layers

The Knowledge Base follows the standard layered architecture of TrekDesk AI, with specialized handling for vector embeddings and pgvector.

```mermaid
graph TD
    Client[Admin Dashboard / AI Tool] -- HTTP Request --> Routes[KnowledgeRoutes]
    Routes -- Parse / Validate --> Controller[KnowledgeController]
    Controller -- Orchestrate --> Service[KnowledgeService]
    Service -- Business Logic --> Repo[KnowledgeRepository]
    Repo -- SQL / pgvector --> DB[(PostgreSQL)]

    subgraph "External AI"
        Service -- Text --> Gemini[Gemini Embedding Model]
        Gemini -- 768d Vector --> Service
    end
```

---

## 2. Component Breakdown

### 2.1 API Routes (`knowledgeRoutes.ts`)

Defines the REST structure and attaches Swagger documentation.

- **Security:** Requires `AuthMiddleware.protect` to ensure only authenticated tenant admins can manage knowledge.
- **Endpoints:**
  - `POST /ingest`: Inbound raw text processing.
  - `GET /search`: Diagnostic semantic search.
  - `GET /`: List all stored chunks.
  - `PATCH /:chunkId`: Content updates.
  - `DELETE /:chunkId`: Content removal.

### 2.2 Controller (`KnowledgeController.ts`)

The entry point for HTTP requests.

- **Mapping:** Extracts data from `req.body` or `req.query` and maps it to domain DTOs.
- **Response Handling:** Uses `ApiResponse` to send standardized JSON envelopes and `next(error)` for specialized error handling.

### 2.3 Service (`KnowledgeService.ts`)

The core processing engine.

- **Transformation:** Coordinates with `AIService` or direct Google SDK calls to transform strings into 768-dimensional vectors.
- **Chunking:** Implements logic to split large documents into optimized segments (standard approx. 1000 characters).
- **Tenant Isolation:** Ensures all operations are scoped to the `MVP_TENANT_ID`.

### 2.4 Repository (`KnowledgeRepository.ts`)

The specialized persistence layer.

- **pgvector Integration:** Uses raw SQL or Knex/TypeORM helpers to handle the `vector` data type.
- **Semantic Search Logic:** Uses the `<=>` (cosine distance) operator for similarity matching.
- **Query Example:**
  ```sql
  SELECT content, similarity
  FROM knowledge_chunks
  WHERE tenant_id = :tenantId
  ORDER BY embedding <=> :queryVector
  LIMIT 5;
  ```

---

## 3. Detailed Sequence: Content Ingestion

```mermaid
sequenceDiagram
    participant AD as Admin Dashboard
    participant KC as KnowledgeController
    participant KS as KnowledgeService
    participant AI as Gemini API
    participant KR as KnowledgeRepository
    participant DB as PostgreSQL (pgvector)

    AD->>KC: POST /ingest { content }
    KC->>KS: ingestDocument(dto)
    KS->>AI: generateEmbeddings(text)
    AI-->>KS: float[] (768 dimensions)
    KS->>KR: insertDocumentChunk(text, vector)
    KR->>DB: INSERT INTO knowledge_entries (embedding) VALUES ('[0.1, 0.2...]')
    DB-->>KR: Success
    KR-->>KS: Success
    KS-->>KC: Success
    KC-->>AD: 200 OK
```

## 4. Error Handling & Validation

- **Global Interceptor:** Front-end errors are caught and formatted for user-friendly display.
- **Backend Validation:** Request bodies are strictly typed via DTOs and validated before reaching the service layer.
- **Vector Dimensions:** Safeguards in place to ensure embeddings always match the database column constraints (768d).

---

## Related Docs

- `../API_REFERENCE.md`
- `../DATABASE_SCHEMA.md`
- `../RAG_PIPELINE.md`
- `../REALTIME_VOICE_AI.md`
