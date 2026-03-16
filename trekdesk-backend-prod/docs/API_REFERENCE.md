# API Reference (Swagger)

The REST API reference is maintained as **Swagger/OpenAPI** and is the source of truth for endpoints, payloads, and auth requirements.

## Swagger UI

When the backend is running, open:

- `http://localhost:<PORT>/api-docs`

The UI is served by `swagger-ui-express` and generated via `swagger-jsdoc`.

## Where the spec comes from

- Swagger is mounted in `src/app.ts` at `/api-docs`.
- The OpenAPI spec is assembled in `src/config/swagger.ts`.
- Route annotations live in `src/routes/*.ts` (e.g., `tourRoutes.ts`, `widgetRoutes.ts`, `authRoutes.ts`, `callLogRoutes.ts`).

## Related Docs

- `AUTHENTICATION.md`
- `ARCHITECTURE.md`
- `features/FEATURE_TOURS.md`
- `features/FEATURE_WIDGET.md`
- `features/FEATURE_PERSONA.md`
- `features/FEATURE_KNOWLEDGE_BASE.md`
- `features/FEATURE_CONVERSATIONS.md`
- `features/FEATURE_DIAGNOSTICS.md`
