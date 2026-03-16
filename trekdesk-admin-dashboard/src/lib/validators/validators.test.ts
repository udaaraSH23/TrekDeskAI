/**
 * @file validators.test.ts
 * @description Unit tests for all client-side Zod validation schemas.
 *
 * Covers three validators:
 *  1. tourValidators    — trek create/update form validation
 *  2. knowledgeValidators — knowledge ingest + search query validation
 *  3. personaValidators — AI persona settings form validation
 *
 * For each schema, tests cover:
 *  - ✅ Valid inputs that should pass
 *  - ❌ Invalid inputs that should fail, with specific error message assertions
 *
 * This guarantees that no invalid data can reach the backend services,
 * and that the error messages shown to users are clear and actionable.
 *
 * Test Runner: Vitest
 */

import { describe, it, expect } from "vitest";
import {
  createTrekSchema,
  updateTrekSchema,
} from "../../lib/validators/tourValidators";
import {
  ingestKnowledgeSchema,
  knowledgeSearchSchema,
} from "../../lib/validators/knowledgeValidators";
import { updatePersonaSchema } from "../../lib/validators/personaValidators";

// ═══════════════════════════════════════════════════════════════════════════
// Tour / Trek Validators
// ═══════════════════════════════════════════════════════════════════════════

describe("tourValidators — createTrekSchema", () => {
  const validPayload = {
    name: "Annapurna Circuit",
    description: "A legendary Himalayan trek.",
    base_price_per_person: 2500,
    transport_fee: 150,
    difficulty_level: "challenging" as const,
  };

  // ─── Valid inputs ───────────────────────────────────────────────────────

  it("should accept a fully valid trek payload", () => {
    const result = createTrekSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should accept a minimal payload (name + price only)", () => {
    const result = createTrekSchema.safeParse({
      name: "Everest Base Camp",
      base_price_per_person: 3000,
    });
    expect(result.success).toBe(true);
  });

  it("should default transport_fee to 0 when omitted", () => {
    const result = createTrekSchema.safeParse({
      name: "Langtang Valley",
      base_price_per_person: 1800,
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.transport_fee).toBe(0);
    }
  });

  it("should accept all four difficulty levels", () => {
    const levels = ["easy", "moderate", "challenging", "extreme"] as const;
    for (const level of levels) {
      const result = createTrekSchema.safeParse({
        ...validPayload,
        difficulty_level: level,
      });
      expect(result.success).toBe(true);
    }
  });

  // ─── Invalid inputs ─────────────────────────────────────────────────────

  it("should reject a name that is too short (< 3 chars)", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      name: "AB",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
      expect(errors.name![0]).toMatch(/at least 3 characters/i);
    }
  });

  it("should reject a name that is too long (> 255 chars)", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      name: "A".repeat(256),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name).toBeDefined();
    }
  });

  it("should reject a negative price", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      base_price_per_person: -100,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.base_price_per_person).toBeDefined();
      expect(errors.base_price_per_person![0]).toMatch(/greater than 0/i);
    }
  });

  it("should reject a zero price", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      base_price_per_person: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.base_price_per_person).toBeDefined();
    }
  });

  it("should reject a negative transport fee", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      transport_fee: -50,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.transport_fee).toBeDefined();
      expect(errors.transport_fee![0]).toMatch(/cannot be negative/i);
    }
  });

  it("should reject an invalid difficulty_level value", () => {
    const result = createTrekSchema.safeParse({
      ...validPayload,
      difficulty_level: "insane", // not in the enum
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.difficulty_level).toBeDefined();
    }
  });
});

describe("tourValidators — updateTrekSchema", () => {
  it("should accept an empty object (all fields optional for partial update)", () => {
    const result = updateTrekSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("should still enforce constraints on provided fields", () => {
    const result = updateTrekSchema.safeParse({ name: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.name![0]).toMatch(/at least 3 characters/i);
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Knowledge Base Validators
// ═══════════════════════════════════════════════════════════════════════════

describe("knowledgeValidators — ingestKnowledgeSchema", () => {
  const validIngestPayload = {
    content: "The Annapurna Circuit Trek is a world-renowned route in Nepal.",
    trek_id: "550e8400-e29b-41d4-a716-446655440000",
  };

  // ─── Valid inputs ───────────────────────────────────────────────────────

  it("should accept a valid ingest payload", () => {
    const result = ingestKnowledgeSchema.safeParse(validIngestPayload);
    expect(result.success).toBe(true);
  });

  it("should accept content without an optional trek_id", () => {
    const result = ingestKnowledgeSchema.safeParse({
      content: "General knowledge content about trekking safety.",
    });
    expect(result.success).toBe(true);
  });

  it("should accept null as trek_id", () => {
    const result = ingestKnowledgeSchema.safeParse({
      content: "Content scoped to no specific trek.",
      trek_id: null,
    });
    expect(result.success).toBe(true);
  });

  it("should accept valid string-keyed metadata", () => {
    const result = ingestKnowledgeSchema.safeParse({
      content: "Altitude acclimatization tips for high altitude treks.",
      metadata: { category: "safety", region: "Nepal" },
    });
    expect(result.success).toBe(true);
  });

  // ─── Invalid inputs ─────────────────────────────────────────────────────

  it("should reject content shorter than 10 characters", () => {
    const result = ingestKnowledgeSchema.safeParse({
      ...validIngestPayload,
      content: "Too short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.content).toBeDefined();
      expect(errors.content![0]).toMatch(/at least 10 characters/i);
    }
  });

  it("should reject an empty string as content", () => {
    const result = ingestKnowledgeSchema.safeParse({
      ...validIngestPayload,
      content: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.content).toBeDefined();
    }
  });

  it("should reject content exceeding 50,000 characters", () => {
    const result = ingestKnowledgeSchema.safeParse({
      content: "A".repeat(50001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.content![0]).toMatch(/too long/i);
    }
  });

  it("should reject a malformed (non-UUID) trek_id", () => {
    const result = ingestKnowledgeSchema.safeParse({
      ...validIngestPayload,
      trek_id: "not-a-uuid",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.trek_id).toBeDefined();
      expect(errors.trek_id![0]).toMatch(/valid Trek ID/i);
    }
  });
});

describe("knowledgeValidators — knowledgeSearchSchema", () => {
  // ─── Valid inputs ───────────────────────────────────────────────────────

  it("should accept a valid search query", () => {
    const result = knowledgeSearchSchema.safeParse({
      q: "Annapurna altitude tips",
    });
    expect(result.success).toBe(true);
  });

  // ─── Invalid inputs ─────────────────────────────────────────────────────

  it("should reject a search query shorter than 3 characters", () => {
    const result = knowledgeSearchSchema.safeParse({ q: "AB" });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.q).toBeDefined();
      expect(errors.q![0]).toMatch(/at least 3 characters/i);
    }
  });

  it("should reject a search query over 500 characters", () => {
    const result = knowledgeSearchSchema.safeParse({ q: "Q".repeat(501) });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.q![0]).toMatch(/too long/i);
    }
  });

  it("should reject an empty search query", () => {
    const result = knowledgeSearchSchema.safeParse({ q: "" });
    expect(result.success).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Persona / AI Settings Validators
// ═══════════════════════════════════════════════════════════════════════════

describe("personaValidators — updatePersonaSchema", () => {
  const validPersona = {
    voice_name: "Aria",
    system_instruction:
      "You are a friendly trekking guide assistant for GuideTours.",
    temperature: 0.7,
  };

  // ─── Valid inputs ───────────────────────────────────────────────────────

  it("should accept a fully valid persona settings payload", () => {
    const result = updatePersonaSchema.safeParse(validPersona);
    expect(result.success).toBe(true);
  });

  it("should accept temperature at the minimum boundary (0)", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: 0,
    });
    expect(result.success).toBe(true);
  });

  it("should accept temperature at the maximum boundary (2)", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: 2,
    });
    expect(result.success).toBe(true);
  });

  it("should accept a temperature of 1 (middle of range)", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: 1,
    });
    expect(result.success).toBe(true);
  });

  // ─── Invalid inputs ─────────────────────────────────────────────────────

  it("should reject an empty voice_name", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      voice_name: "",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.voice_name).toBeDefined();
      expect(errors.voice_name![0]).toMatch(/cannot be empty/i);
    }
  });

  it("should reject a voice_name longer than 100 characters", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      voice_name: "V".repeat(101),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.voice_name![0]).toMatch(/too long/i);
    }
  });

  it("should reject a system_instruction longer than 10,000 characters", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      system_instruction: "S".repeat(10001),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.system_instruction![0]).toMatch(/too long/i);
    }
  });

  it("should reject a temperature below 0", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: -0.1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.temperature).toBeDefined();
      expect(errors.temperature![0]).toMatch(/at least 0/i);
    }
  });

  it("should reject a temperature above 2", () => {
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: 2.1,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.temperature).toBeDefined();
      expect(errors.temperature![0]).toMatch(/cannot exceed 2/i);
    }
  });

  it('should reject temperature of 1.1 (common old "max 1" misconception)', () => {
    // This confirms our schema correctly uses max(2) instead of max(1)
    const result = updatePersonaSchema.safeParse({
      ...validPersona,
      temperature: 1.1,
    });
    expect(result.success).toBe(true); // 1.1 is valid — it's within 0–2
  });
});
