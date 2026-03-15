/**
 * @file tools.ts
 * @description Gemini Multimodal Live API tool and function declarations.
 * This file serves as the manifest for all local capabilities exposed to the AI model,
 * enabling it to interact with the backend services, databases, and external APIs.
 *
 * @module Config/Tools
 * @category AI
 */

import { ToolDeclaration } from "../types/gemini";

/**
 * TrekDesk AI - Gemini Tool Declarations
 *
 * This constant defines the set of tools (functions) that the Google Gemini
 * Multimodal Live API is authorized to invoke during a session.
 * These declarations follow the Google AI function calling schema.
 *
 * Each tool corresponds to a specific service operation handled by the ToolDispatcher.
 */
export const tools: ToolDeclaration[] = [
  {
    functionDeclarations: [
      /**
       * Tool: check_guide_calendar
       * Purpose: Enables the AI to verify tour guide availability in real-time.
       * Logic: Queries the Google Calendar API via the BookingService.
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
       * Purpose: Provides immediate pricing estimates for trekking packages based on tiered data.
       * Negotiation Strategy: Controlled via the 'negotiation_stage' parameter to model realistic sales behavior.
       */
      {
        name: "generate_quote",
        description:
          "Generate a price quote for a specific trek. IMPORTANT: Do not offer discounts immediately. Wait for the client to express concern about the price before moving to the 'discount' or 'final' negotiation stages.",
        parameters: {
          type: "OBJECT",
          properties: {
            trek_id: {
              type: "STRING",
              description: "The UUID of the trek to quote.",
            },
            pax: {
              type: "INTEGER",
              description: "The total number of hikers in the group.",
            },
            transport: {
              type: "BOOLEAN",
              description:
                "Whether private transport from the hotel is required.",
            },
            negotiation_stage: {
              type: "STRING",
              enum: ["initial", "discount", "final"],
              description:
                "The current stage of price negotiation. Use 'initial' first. Move to 'discount' only if the user asks for a better price. Use 'final' as the last resort.",
            },
          },
          required: ["trek_id", "pax", "transport"],
        },
      },

      /**
       * Tool: query_knowledge_base
       * Purpose: Connects the AI to the vector database (RAG pipeline) for semantic factual retrieval.
       * Logic: Triggers a pgvector semantic search via KnowledgeService.
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
       * Purpose: Formalizes a reservation and commits it to the PostgreSQL database.
       * Requirement: This tool is sensitive; it requires prior collection of customer contact details.
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
       * Utility: Prevents hallucination of package names and ensures valid IDs are used in follow-up calls.
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
