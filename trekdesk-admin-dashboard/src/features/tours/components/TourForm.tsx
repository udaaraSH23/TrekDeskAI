/**
 * @file TourForm.tsx
 * @description Integrated form for creating and editing tour records.
 * Manages complex nested state for 'Pricing Tiers' and ensures data alignment
 * with the backend's TrekSchema.
 */

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import type {
  Trek,
  DifficultyLevel,
  PricingTier,
  CreateTrekPayload,
} from "../types/tour.types";
import styles from "../pages/Tours.module.css";

/**
 * Props for the TourForm component.
 */
interface TourFormProps {
  /** Optional initial data for 'Edit' mode. If omitted, the form starts blank. */
  initialData?: Partial<Trek>;
  /**
   * Unified submission handler.
   * Returns a promise to allow the component to handle post-submission transitions.
   */
  onSubmit: (data: CreateTrekPayload) => Promise<void>;
  /** Cancellation handler to close the form/modal. */
  onCancel: () => void;
  /** Label for the primary action button (e.g., 'Save', 'Update'). */
  submitLabel: string;
  /** Global pending state to show loading indicators. */
  isPending: boolean;
}

/**
 * TourForm Component
 *
 * A controlled form that manages individual trek fields and a dynamic array
 * of pricing tiers.
 */
export const TourForm: React.FC<TourFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  submitLabel,
  isPending,
}) => {
  // --- Local Form State ---
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    base_price_per_person: initialData?.base_price_per_person || 0,
    transport_fee: initialData?.transport_fee || 0,
    difficulty_level: (initialData?.difficulty_level ||
      "moderate") as DifficultyLevel,
    pricing_tiers: (initialData?.pricing_tiers || []) as PricingTier[],
  });

  /**
   * Prevents default form submission and triggers the provided callback.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  /**
   * Appends a new default pricing tier to the array.
   */
  const addTier = () => {
    const newTier: PricingTier = {
      pax_range: "1",
      min_price: 15,
      max_price: 25,
    };
    setFormData({
      ...formData,
      pricing_tiers: [...formData.pricing_tiers, newTier],
    });
  };

  /**
   * Removes a pricing tier by its index in the array.
   */
  const removeTier = (index: number) => {
    setFormData({
      ...formData,
      pricing_tiers: formData.pricing_tiers.filter((_, i) => i !== index),
    });
  };

  /**
   * Updates a specific field within a specific pricing tier.
   *
   * @param index - Index of the tier to modify.
   * @param field - The specific field (pax_range, min_price, etc).
   * @param value - The new value (type-checked based on field).
   */
  const updateTier = (
    index: number,
    field: keyof PricingTier,
    value: string | number,
  ) => {
    const updated = [...formData.pricing_tiers];
    updated[index] = { ...updated[index], [field]: value } as PricingTier;
    setFormData({ ...formData, pricing_tiers: updated });
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* --- Basic Information --- */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Tour Name</label>
        <Input
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="e.g. Knuckles Forest Reserve"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>Description</label>
        <textarea
          className={styles.textarea}
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Provide details for the AI..."
        />
      </div>

      {/* --- Financials --- */}
      <div className={styles.formRow}>
        <div className="flex-1">
          <label className={styles.label}>Base Price ($)</label>
          <Input
            type="number"
            value={formData.base_price_per_person}
            onChange={(e) =>
              setFormData({
                ...formData,
                base_price_per_person: Number(e.target.value),
              })
            }
          />
        </div>
        <div className="flex-1">
          <label className={styles.label}>Transport Fee ($)</label>
          <Input
            type="number"
            value={formData.transport_fee}
            onChange={(e) =>
              setFormData({
                ...formData,
                transport_fee: Number(e.target.value),
              })
            }
          />
        </div>
      </div>

      {/* --- Complexity Metrics --- */}
      <div className={styles.inputGroup}>
        <label className={styles.label}>Difficulty</label>
        <select
          className={styles.select}
          value={formData.difficulty_level}
          onChange={(e) =>
            setFormData({
              ...formData,
              difficulty_level: e.target.value as DifficultyLevel,
            })
          }
        >
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="challenging">Challenging</option>
          <option value="extreme">Extreme</option>
        </select>
      </div>

      {/* --- Dynamic Pricing Tiers --- */}
      <div className={styles.tiersSection}>
        <div className={styles.tierHeader}>
          <label className={styles.label}>Pricing Tiers (Pax Based)</label>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={addTier}
            className="flex items-center gap-xs"
          >
            <Plus size={14} /> Add Tier
          </Button>
        </div>

        {formData.pricing_tiers.map((tier, index) => (
          <div key={index} className={styles.tierRow}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Pax Range</label>
              <Input
                placeholder="e.g. 1, 2-3, 4+"
                value={tier.pax_range}
                onChange={(e) => updateTier(index, "pax_range", e.target.value)}
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Min ($)</label>
              <Input
                type="number"
                value={tier.min_price}
                onChange={(e) =>
                  updateTier(index, "min_price", Number(e.target.value))
                }
              />
            </div>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Max ($)</label>
              <Input
                type="number"
                value={tier.max_price}
                onChange={(e) =>
                  updateTier(index, "max_price", Number(e.target.value))
                }
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeTier(index)}
              className="text-muted hover:text-destructive"
              title="Remove Tier"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
      </div>

      {/* --- Form Footers --- */}
      <div className={styles.formActions}>
        <Button variant="ghost" type="button" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isPending}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};
