# 01 System Architecture

## Overview

The TrekDesk AI backend is built on Node.js using Express and TypeScript. The system is designed following the **Dependency Inversion Principle (DIP)** and strict layered architecture to ensure modularity, testability, and clear separation of concerns.

## The Layered Architecture

The application is structured into four distinct layers following the Dependency Inversion Principle:

1.  **Controllers (`src/controllers`):** Handle incoming HTTP requests, extract parameters, and validate them using Zod schemas. They delegate all business logic to Services.
2.  **Services (`src/services`):** The Business Logic Layer (BLL). Services handle the core application logic, orchestration of multiple repositories, and external integrations (like Gemini or Google Calendar).
3.  **Interfaces (`src/interfaces`):** Define the contracts for Services and Repositories. This layer allows for decoupling, as components depend on abstractions rather than concrete implementations.
4.  **Repositories (`src/repositories`):** The Data Access Layer (DAL). Repositories are responsible for database interactions using parameterized SQL queries.

```mermaid
flowchart TD
    Client(["Frontend Client (React)"]) --> Router

    subgraph Express Application
        Router["Express Router"] --> Controller["Controllers (HTTP/Validation)"]
        Controller --> IService["IService (Contract)"]
        IService --> Service["Services (Business Logic)"]
        Service --> IRepo["IRepository (Contract)"]
        IRepo --> Repository["Repositories (Data Access)"]
    end

    Repository --> Database[("PostgreSQL Database")]
```

## Dependency Injection (DI)

To avoid tight coupling, we do not use static methods or hard-coded instantiations inside classes. Instead, we use Constructor-based Dependency Injection.

### Interfaces

Each Service and Repository defines an interface in `src/interfaces/services` and `src/interfaces/repositories`. Classes depend on these abstractions rather than concrete implementations.

### The DI Container (`src/config/di.ts`)

The `di.ts` file acts as a central manual wiring hub.

```mermaid
flowchart LR
    subgraph di.ts [DI Container]
        TR[TourRepository]
        TS[TourService]
        TC[TourController]

        TR -- inverts via ITourRepository --> TS
        TS -- inverts via ITourService --> TC
    end

    TC -. exported to .-> Routes
```

1. It instantiates all repositories.
2. It instantiates services by injecting the required repository instances into their constructors.
3. It instantiates controllers by injecting the required service instances into their constructors.

**Example Wiring Flow:**

```typescript
// 1. Instantiate Repository
export const knowledgeRepository = new KnowledgeRepository();

// 2. Instantiate Service (Injecting Repository)
export const knowledgeService = new KnowledgeService(knowledgeRepository);

// 3. Instantiate Controller (Injecting Service)
export const knowledgeController = new KnowledgeController(knowledgeService);
```

### Express Routes Integration

The Express routing files (`src/routes/*.ts`) import the pre-wired controller singletons directly from the `di.ts` container, ensuring the entire application uses the correctly initialized instances.

## Tenancy Isolation

Currently, the system is designed to handle multiple tenants (e.g., different tour operator clients). While we default to an `MVP_TENANT_ID` for the initial Kandy Treks pilot, nearly all service and repository methods require a `tenantId` parameter to ensure strict data scoping.

---

## AI Service Organization

AI-related services are organized to isolate LLM-specific logic from generic business operations.

### Key AI Services

- **`GeminiService`**: Low-level integration with Google Gemini Multimodal Live API via WebSockets.
- **`ChatService`**: Orchestrates multi-turn conversations and tool execution.
- **`ToolDispatcher`**: Maps AI model function calls to backend service methods.
- **`BookingService`**: Reservation/availability/quote logic.

---

## Developer Tools & Diagnostics

Developer diagnostics provide a sandbox for testing AI behavior and system health.

- **AI Debugger**: `POST /api/v1/dev/test-prompt`
- **Calendar Diagnostics**: `GET /api/v1/dev/calendar`
- **Tool Catalog**: `GET /api/v1/dev/tools`

See `features/FEATURE_DIAGNOSTICS.md` for the traced execution flow diagrams.

---

## Security & Multi-Tenancy

- Service methods require `tenantId` to ensure data isolation.
- Widget interactions validate the `Origin` header against tenant `allowed_origins`.

---

## Related Docs

- `AUTHENTICATION.md`
- `API_REFERENCE.md`
- `DATABASE_SCHEMA.md`
- `REALTIME_VOICE_AI.md`
- `RAG_PIPELINE.md`
- `features/FEATURE_PERSONA.md`
- `features/FEATURE_TOURS.md`
- `features/FEATURE_WIDGET.md`
- `features/FEATURE_KNOWLEDGE_BASE.md`
- `features/FEATURE_CONVERSATIONS.md`
- `features/FEATURE_DIAGNOSTICS.md`
