# 09 API Reference

## Authentication

| Method | Endpoint                 | Description                                 | Auth Required |
| ------ | ------------------------ | ------------------------------------------- | ------------- |
| `POST` | `/api/v1/auth/google`    | Exchange Google ID Token for Backend JWT    | No            |
| `POST` | `/api/v1/auth/dev-login` | Developer bypass login using secret         | No            |
| `GET`  | `/api/v1/auth/verify`    | Verify current session and return user data | Yes           |

## Tours (/api/v1/tours)

| Method   | Endpoint | Description                     | Auth Required |
| -------- | -------- | ------------------------------- | ------------- |
| `GET`    | `/`      | List all treks for the tenant   | Yes           |
| `POST`   | `/`      | Create a new trek offering      | Yes           |
| `GET`    | `/:id`   | Get details for a specific trek | Yes           |
| `PUT`    | `/:id`   | Update trek details             | Yes           |
| `DELETE` | `/:id`   | Remove a trek                   | Yes           |

## Knowledge Base (/api/v1/knowledge)

| Method   | Endpoint            | Description                              | Auth Required |
| -------- | ------------------- | ---------------------------------------- | ------------- |
| `GET`    | `/`                 | List all knowledge chunks                | Yes           |
| `POST`   | `/ingest`           | Vectorize and store a new document chunk | Yes           |
| `GET`    | `/search?query=...` | Perform semantic search (pgvector)       | Yes           |
| `PATCH`  | `/:chunkId`         | Update an existing chunk content         | Yes           |
| `DELETE` | `/:chunkId`         | Remove a knowledge chunk                 | Yes           |

## AI Persona (/api/v1/persona)

| Method  | Endpoint | Description                                    | Auth Required |
| ------- | -------- | ---------------------------------------------- | ------------- |
| `GET`   | `/`      | Get AI behavior settings (instructions, voice) | Yes           |
| `PATCH` | `/`      | Update AI persona and instructions             | Yes           |

### PATCH Payload Specification

```json
{
  "voice_name": "Aoede",
  "assistant_name": "TrekDesk AI",
  "system_instruction": "You are a helpful trekking guide...",
  "temperature": 1.0
}
```

| Field                | Type   | Description                           |
| :------------------- | :----- | :------------------------------------ |
| `voice_name`         | string | Gemini Voice ID (Aoede, Puck, etc.)   |
| `assistant_name`     | string | Custom display name for the assistant |
| `system_instruction` | string | Detailed behavioral prompt            |
| `temperature`        | number | Creativity setting (0.0 to 2.0)       |

## Widget Settings (/api/v1/widget)

| Method  | Endpoint    | Description                                 | Auth Required    |
| ------- | ----------- | ------------------------------------------- | ---------------- |
| `GET`   | `/settings` | Get widget customization (colors, position) | Yes (or session) |
| `PATCH` | `/settings` | Update widget customization                 | Yes              |

## Chat & Configuration (/api/v1/chat)

| Method | Endpoint         | Description                                        | Auth Required |
| ------ | ---------------- | -------------------------------------------------- | ------------- |
| `GET`  | `/widget/config` | Returns merged configuration (Widget + AI Persona) | No            |

## Analytics (/api/v1/analytics)

| Method | Endpoint       | Description                          | Auth Required |
| ------ | -------------- | ------------------------------------ | ------------- |
| `GET`  | `/calls`       | List call logs with summaries        | Yes           |
| `GET`  | `/calls/stats` | Get aggregate dashboard statistics   | Yes           |
| `GET`  | `/calls/:id`   | Get full call transcript and details | Yes           |

## Developer Tools (/api/v1/dev)

| Method | Endpoint           | Description                                   | Auth Required |
| ------ | ------------------ | --------------------------------------------- | ------------- |
| `POST` | `/test-chat`       | Simulate a chat turn with the tool-enabled AI | Yes           |
| `GET`  | `/persona`         | Direct access to AI settings table            | Yes           |
| `GET`  | `/google-calendar` | Test connectivity with Google Calendar API    | Yes           |
