/**
 * @file TourCard.tsx
 * @description A high-fidelity presentation card for an individual tour.
 * Handles its own 'Edit' state locally to provide an inline editing experience
 * without losing context of the grid.
 */

import React, { useState } from "react";
import { Map, Trash2, Edit2, TrendingUp, DollarSign } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import type { Trek, UpdateTrekPayload } from "../types/tour.types";
import { TourForm } from "./TourForm";
import styles from "../pages/Tours.module.css";

/**
 * Props for the TourCard component.
 */
interface TourCardProps {
  /** The full trek object to display. */
  tour: Trek;
  /** Callback triggered when the child form submits an update. */
  onUpdate: (id: string, data: UpdateTrekPayload) => Promise<void>;
  /** Callback to trigger the deletion sequence. */
  onDelete: (id: string) => Promise<void>;
  /** Global loading state for updates. */
  isUpdating: boolean;
  /** Global loading state for deletions. */
  isDeleting: boolean;
}

/**
 * TourCard Component
 *
 * Switches between a read-only 'Visual' state and an inline 'Form' state.
 */
export const TourCard: React.FC<TourCardProps> = ({
  tour,
  onUpdate,
  onDelete,
  isUpdating,
  isDeleting,
}) => {
  // Local state to track if this specific card is being edited
  const [isEditing, setIsEditing] = useState(false);

  // --- Edit Mode Render ---
  if (isEditing) {
    return (
      <Card className={styles.tourCard}>
        <CardContent className="p-lg">
          <TourForm
            initialData={tour}
            onSubmit={async (data) => {
              await onUpdate(tour.id, data);
              setIsEditing(false); // Close form on success
            }}
            onCancel={() => setIsEditing(false)}
            submitLabel="Update Tour"
            isPending={isUpdating}
          />
        </CardContent>
      </Card>
    );
  }

  // --- View Mode Render ---
  return (
    <Card className={styles.tourCard}>
      {/* Card Header: Title & Actions */}
      <CardHeader className={styles.cardHeader}>
        <div className="flex items-center gap-sm">
          <div className={styles.iconBox}>
            <Map size={18} color="var(--primary)" />
          </div>
          <CardTitle className="text-lg m-0">{tour.name}</CardTitle>
        </div>
        <div className="flex gap-xs">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            title="Edit Tour"
          >
            <Edit2 size={16} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(tour.id)}
            isLoading={isDeleting}
            title="Delete Tour"
          >
            <Trash2 size={16} color="#ef4444" />
          </Button>
        </div>
      </CardHeader>

      {/* Card Body: Info & Stats */}
      <CardContent className="p-card-body">
        <p className={styles.description}>
          {tour.description || "No description provided."}
        </p>

        {/* Technical Specs Row */}
        <div className={styles.statsRow}>
          <div className={styles.statItem}>
            <DollarSign size={14} />
            <span>${tour.base_price_per_person} /pp</span>
          </div>
          <div className={styles.statItem}>
            <TrendingUp size={14} />
            <span className="capitalize">{tour.difficulty_level}</span>
          </div>
        </div>

        {/* Status Footer */}
        <div className={styles.footerRow}>
          <Badge variant={tour.is_active ? "success" : "secondary"}>
            {tour.is_active ? "Live" : "Draft"}
          </Badge>
          <span className="text-muted text-xs">
            Updated {new Date(tour.updated_at).toLocaleDateString()}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
