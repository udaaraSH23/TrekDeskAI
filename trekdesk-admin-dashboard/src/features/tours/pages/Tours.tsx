/**
 * @file Tours.tsx
 * @description Main management page for the tours/treks inventory.
 * Provides a high-level orchestration of tour data fetching, creation via Modal,
 * and delegating individual tour actions to child components.
 */

import React, { useState, useEffect } from "react";
import { Plus, Navigation } from "lucide-react";
import {
  useTours,
  useCreateTour,
  useUpdateTour,
  useDeleteTour,
} from "../hooks/useTours";
import { useUIStore } from "../../../store/uiStore";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { Modal } from "../../../components/ui/Modal";
import { TourCard } from "../components/TourCard";
import { TourForm } from "../components/TourForm";
import type { CreateTrekPayload, UpdateTrekPayload } from "../types/tour.types";

import styles from "./Tours.module.css";

/**
 * Tours Page Component
 *
 * Responsibilities:
 * - Fetches and displays the list of treks.
 * - Manages the 'Create' modal state.
 * - Handles top-level CRUD orchestration including success/error notifications.
 * - Integrates with the global UI store for toasts and confirmation dialogs.
 */
const Tours: React.FC = () => {
  // --- Server State (TanStack Query) ---
  const { data: tours = [], isLoading: loading, error } = useTours();
  const createMutation = useCreateTour();
  const updateMutation = useUpdateTour();
  const deleteMutation = useDeleteTour();

  // --- Global UI State ---
  const { addNotification, confirm } = useUIStore();

  // --- Local UI State ---
  const [isAdding, setIsAdding] = useState(false);

  /**
   * Effect: Monitors query errors and broadcasts them globally via toasts.
   */
  useEffect(() => {
    if (error) {
      addNotification({
        type: "error",
        message:
          error instanceof Error ? error.message : "Failed to load tours",
      });
    }
  }, [error, addNotification]);

  /**
   * Orchestrates the creation of a new tour.
   * @param data - The validated payload from the TourForm.
   */
  const handleCreate = async (data: CreateTrekPayload) => {
    try {
      await createMutation.mutateAsync(data);
      addNotification({
        type: "success",
        message: `Tour "${data.name}" created successfully.`,
      });
      setIsAdding(false);
    } catch {
      addNotification({
        type: "error",
        message: "Failed to create tour. Please try again.",
      });
    }
  };

  /**
   * Handles individual tour updates.
   * @param id - UUID of the trek to modify.
   * @param data - Partial trek data for the PATCH request.
   */
  const handleUpdate = async (id: string, data: UpdateTrekPayload) => {
    try {
      await updateMutation.mutateAsync({ id, tour: data });
      addNotification({
        type: "success",
        message: `Tour updated successfully.`,
      });
    } catch {
      addNotification({
        type: "error",
        message: "Failed to update tour.",
      });
    }
  };

  /**
   * Triggers a global confirmation modal before deleting a tour.
   * @param id - UUID of the trek to remove.
   */
  const handleDelete = async (id: string) => {
    const tour = tours.find((t) => t.id === id);
    confirm({
      title: "Delete Tour",
      message: `Are you sure you want to delete "${tour?.name || "this tour"}"? This action cannot be undone.`,
      confirmLabel: "Delete Tour",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(id);
          addNotification({
            type: "success",
            message: "Tour deleted successfully.",
          });
        } catch {
          addNotification({
            type: "error",
            message: "Failed to delete tour.",
          });
        }
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* Header Row: Stats & Action Trigger */}
      <div className={styles.searchRow}>
        <div className="flex items-center gap-md">
          <Badge variant="secondary">
            {tours.length} {tours.length === 1 ? "Tour" : "Tours"}
          </Badge>
        </div>
        <Button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-xs"
          size="sm"
        >
          <Plus size={18} /> Add New Tour
        </Button>
      </div>

      {/* Creation Modal: Kept separate from grid to avoid layout shifts */}
      <Modal
        isOpen={isAdding}
        onClose={() => setIsAdding(false)}
        title="Create New Tour"
      >
        <TourForm
          onSubmit={handleCreate}
          onCancel={() => setIsAdding(false)}
          submitLabel="Save Tour"
          isPending={createMutation.isPending}
        />
      </Modal>

      {/* Content Grid */}
      <div className={styles.mainGrid}>
        {/* Empty State Illustration */}
        {tours.length === 0 && !loading && (
          <div className={styles.emptyState}>
            <Navigation size={48} className="text-border mb-md" />
            <p className="text-muted">No tours found. Create your first one!</p>
          </div>
        )}

        {/* Skeleton/Loader fallback */}
        {loading && tours.length === 0 ? (
          <div className={styles.emptyState}>Loading tours...</div>
        ) : (
          tours.map((tour) => (
            <TourCard
              key={tour.id}
              tour={tour}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              isUpdating={updateMutation.isPending}
              isDeleting={deleteMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Tours;
