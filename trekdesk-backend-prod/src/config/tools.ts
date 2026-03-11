/**
 * @file tools.ts
 * @description Gemini Multimodal Live API tool and function declarations.
 */
/**
 * TrekDesk AI - Gemini Tool Declarations
 *
 * This file defines the function declarations (tools) that the Google Gemini
 * Multimodal Live API can invoke. These tools extend the AI's capabilities,
 * allowing it to perform real-world actions like checking calendars,
 * generating quotes, and searching the RAG-enabled knowledge base.
 *
 * Each function defined here must have a corresponding handler implementation
 * in the ToolDispatcher service.
 */

export const tools = [
  {
    functionDeclarations: [
      /**
       * Tool: check_guide_calendar
       * Purpose: Enables the AI to verify tour guide availability in real-time.
       * Logic: Queries the backend calendar service (Mocked for MVP, integrates with Google Calendar).
       */
      {
        name: "check_guide_calendar",
        description: "Check if a guide is available on a specific date.",
        parameters: {
          type: "OBJECT",
          properties: {
            date: {
              type: "STRING",
              description: "The requested date in YYYY-MM-DD format.",
            },
          },
          required: ["date"],
        },
      },

      /**
       * Tool: generate_quote
       * Purpose: Provides immediate pricing estimates for trekking packages.
       * Logic: Calculates costs based on group size (pax) and logistics (transport).
       */
      {
        name: "generate_quote",
        description:
          "Generate a quote for a trek based on number of people and transport needs.",
        parameters: {
          type: "OBJECT",
          properties: {
            pax: {
              type: "INTEGER",
              description: "The total number of hikers in the group.",
            },
            transport: {
              type: "BOOLEAN",
              description:
                "Whether private transport from the hotel is required.",
            },
          },
          required: ["pax", "transport"],
        },
      },

      /**
       * Tool: generate_weather_itinerary
       * Purpose: Generates rich multimodal artifacts for the user.
       * Logic: Can lead to the creation of downloadable PDFs or dynamic weather data displays.
       */
      {
        name: "generate_weather_itinerary",
        description:
          "Generates a downloadable weather report or itinerary. Ask the user's permission first.",
        parameters: {
          type: "OBJECT",
          properties: {
            type: {
              type: "STRING",
              enum: ["weather", "itinerary"],
              description: "The type of document to generate.",
            },
            trek_name: {
              type: "STRING",
              description:
                "The name of the trek (e.g., 'Knuckles Highland', 'Adam's Peak').",
            },
          },
          required: ["type", "trek_name"],
        },
      },

      /**
       * Tool: query_knowledge_base
       * Purpose: Connects the AI to the RAG (Retrieval Augmented Generation) pipeline.
       * Logic: Performs a semantic vector search across ingested tour PDFs and guides.
       */
      {
        name: "query_knowledge_base",
        description:
          "Search the knowledge base for specific tour details, gear lists, safety info, or FAQs.",
        parameters: {
          type: "OBJECT",
          properties: {
            query: {
              type: "STRING",
              description:
                "The natural language query or keywords to search for in the vector database.",
            },
          },
          required: ["query"],
        },
      },

      /**
       * Tool: book_trek
       * Purpose: Formalizes a reservation and commits it to the database.
       * Logic: Strictly requires customer details including a mobile/WhatsApp number to ensure the operator can follow up.
       */
      {
        name: "book_trek",
        description:
          "Create a formal booking reservation for a trek. You MUST explicitly ask the user for their Mobile or WhatsApp number before calling this tool. Do not guess it.",
        parameters: {
          type: "OBJECT",
          properties: {
            trek_id: {
              type: "STRING",
              description: "The UUID of the trek being booked.",
            },
            date: {
              type: "STRING",
              description: "The target date of the trek in YYYY-MM-DD format.",
            },
            pax: {
              type: "INTEGER",
              description: "The total number of hikers.",
            },
            customer_name: {
              type: "STRING",
              description: "The name of the customer making the booking.",
            },
            customer_phone: {
              type: "STRING",
              description:
                "The customer's mobile or WhatsApp number. This is strictly required.",
            },
            customer_email: {
              type: "STRING",
              description: "The customer's email address (Optional).",
            },
          },
          required: [
            "trek_id",
            "date",
            "pax",
            "customer_name",
            "customer_phone",
          ],
        },
      },
    ],
  },
];
