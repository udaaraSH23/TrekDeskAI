# TrekDesk AI Backend Documentation

## Core Architecture

TrekDesk AI follows a layered architecture pattern:

1.  **Controllers**: Handle HTTP/WebSocket requests, validation, and response formatting.
2.  **Services**: Implement business logic and orchestrate domain operations.
3.  **Repositories**: Manage data persistence and retrieval from PostgreSQL/pgvector.

## AI Service Organization

AI-related services are organized under `src/services/ai` to isolate LLM-specific logic from generic business operations.

### Key AI Services

- **`GeminiService`**: Low-level integration with Google Gemini Multimodal Live API via WebSockets.
- **`ChatService`**: Orchestrates multi-turn text conversations and tool execution.
- **`ToolDispatcher`**: Maps AI model function calls to specific backend service methods.
- **`BookingService`**: Handles the logic for trek reservations, availability checks, and quoting (now located in `src/services/ai`).

## Developer Tools & Diagnostics

The `DevController` and `DevService` provide a sandbox for testing AI behavior and system health.

### Workflow: `DevController -> DevService`

1.  **Request**: `POST /api/v1/dev/test-prompt` with a prompt string.
2.  **Controller**: The `DevController` receives the request and delegates to `DevService`.
3.  **Service Trace**:
    - The `DevService` intercepts logger calls to capture tool execution logs.
    - It fetches the current AI Persona settings.
    - It calls the `ChatService` to execute the AI pipeline.
    - It returns a comprehensive `TraceEntry` array and captured logs back to the debugger UI.

### Diagnostic Endpoints

- **AI Debugger**: `POST /api/v1/dev/test-prompt`
- **Calendar Diagnostics**: `GET /api/v1/dev/calendar`
- **Tool Catalog**: `GET /api/v1/dev/tools`

## Security & Multi-Tenancy

- All service methods require a `tenantId` to ensure data isolation.
- The `WidgetChatService` validates the `Origin` header against allowed domains stored in the `WidgetSettings` repository.
