/**
 * @file tools.ts
 * @description Gemini Multimodal Live API tool and function declarations.
 */
import { ToolDeclaration } from "../types/gemini";

/**
 * TrekDesk AI - Gemini Tool Declarations
 *
 * This file defines the function declarations (tools) that the Google Gemini
 * Multimodal Live API can invoke. These tools extend the AI's capabilities,
 * allowing it to perform real-world actions like checking calendars,
 * generating quotes, and searching the RAG-enabled knowledge base.
 */
export const tools: ToolDeclaration[] = [
  {
    functionDeclarations: [
      /**
       * Tool: check_guide_calendar
       * Purpose: Enables the AI to verify tour guide availability in real-time.
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
       * Purpose: Connects the AI to the RAG pipeline.
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
       */
      {
        name: "book_trek",
        description:
          "Create a formal booking reservation for a trek. You MUST explicitly ask the user for their Mobile or WhatsApp number before calling this tool.",
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
              description: "The customer's mobile or WhatsApp number.",
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

      /**
       * Tool: get_available_treks
       * Purpose: Provides the AI with the list of treks offered by the operator.
       */
      {
        name: "get_available_treks",
        description:
          "Fetch the list of all available trek packages including their IDs. Use this to find the correct trek_id when a user wants to book.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
    ],
  },
];
