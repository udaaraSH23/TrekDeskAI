import swaggerJsdoc from "swagger-jsdoc";

import path from "path";

/**
 * @file swagger.ts
 * @description Swagger/OpenAPI documentation configuration and specification generation.
 */
/**
 * Swagger API documentation configuration.
 * Generates an OpenAPI 3.0 compliant JSON schema for the entire backend application,
 * used to render the `/api-docs` UI.
 */
const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrekDesk AI Backend API",
      version: "1.0.0",
      description:
        "The RESTful APIS powering the TrekDesk AI Administration Dashboard and Core Services.",
      contact: {
        name: "TrekDesk API Support",
      },
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3001}`,
        description: "Local Development Server",
      },
      {
        url: "https://api.trekdesk.ai",
        description: "Production Server",
      },
      {
        url: "https://trekdesk-backend-1525120942.us-central1.run.app",
        description: "Google Cloud Run (Staging/Production Instance)",
      },
    ],
    components: {
      /**
       * Enables the 'Authorize' button in Swagger UI.
       * Requires standard Bearer Authentication globally.
       */
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Enter your JWT Bearer token in the format **Bearer &lt;token&gt;**",
        },
      },
    },
  },
  // Tells Swagger where to look for JSDoc documentation decorators.
  // We look in both .ts and .js files to support both development (ts-node)
  // and production (compiled dist/ folder) environments.
  apis: [path.join(__dirname, "../routes/*.{ts,js}")],
};

export const swaggerSpec = swaggerJsdoc(options);
