# TrekDesk AI - Core Backend Services

TrekDesk AI is an administrative dashboard and real-time voice intelligence proxy for the B2B tour operator space. The backend serves dual purposes:

1. Providing standard RESTful CRUD operations for the React dashboard (Authentication, Treks, Call Logs, Settings).
2. Acting as a bidirectional streaming proxy between frontend WebRTC microphone arrays and the Google Gemini Multimodal Live API.

## Technical Architecture

Built upon enterprise-grade standard technologies, focusing on extreme type safety and injection-based testability over bleeding-edge convenience frameworks.

- **Runtime**: Node.js & Express
- **Language**: Strict TypeScript
- **Database**: PostgreSQL
- **Vector Search (RAG)**: `pgvector`
- **Voice Intelligence**: Google Gemini `gemini-2.0-flash-exp` (WebSockets)
- **Validation**: Zod schema definitions
- **Authentication**: JWT & Google OAuth2

## Project Structure

This repository follows a strict **Dependency Injection** layered architecture:

- `src/controllers`: Pure HTTP validation and Routing. Never touches DTOs directly, relies entirely on validated Zod payloads and Express semantics.
- `src/services`: Business Logic (BLL). Connects discrete pieces of logic, manages API payloads, and orchestrates Database repository requests.
- `src/repositories`: Data Access Layer (DAL). Only area in the codebase that executes raw SQL queries against PostgreSQL.

### API & Technical Documentation

TrekDesk AI generates two distinct streams of documentation for both internal and external consumers:

1. **Swagger / OpenAPI (API Endpoints):** Once the backend is running, navigate to `http://localhost:3000/api-docs` in your browser. This offers a fully interactive UI detailing all REST routes, schemas, and required JWT authorization headers. It dynamically reads the decorators layered on our Controllers.
2. **TypeDoc (Internal Architecture):** We generate a static HTML site detailing every Class, Interface, and Function signature. To generate or view this, run `npx typedoc` and open `docs/typedoc/index.html`. This is vital for onboarding new developers into the Service and Repository layers.

Extensive Markdown documentation charting the theories surrounding WebSockets, Authentication, and the RAG infrastructure can be found in the `/docs` folder.

## Local Development & Configuration

To run the full stack locally, you need a running PostgreSQL cluster (with the `pgvector` extension) and several API keys.

### 1. Prerequisites

- **Google Gemini API Key**: Required for the Realtime Multimodal Voice AI. Get this from Google AI Studio.
- **Google OAuth Client ID**: Required to allow Admin logins via the dashboard. Set this up in Google Cloud Console.

### 2. Setup Steps

1. Install dependencies:
   ```bash
   npm install
   ```
2. Clone securely provisioned credentials:
   ```bash
   cp .env.example .env
   ```
3. Update `.env` with a real `GEMINI_API_KEY`, your `GOOGLE_CLIENT_ID`, and target `DATABASE_URL`.
4. Ensure the `pgvector` extension is active on your target database:
   ```sql
   CREATE EXTENSION IF NOT EXISTS vector;
   ```
5. Run active Database Migrations to scaffold the tables:
   ```bash
   npm run migrate:up
   ```
6. Boot server with hot-reloading:
   ```bash
   npm run dev
   ```

## Production Building

The project forces strict typing before allowing a successful local build output.

```bash
npm run build
npm start
```
