/**
 * @file KnowledgeManager.tsx
 * @description Component for managing existing knowledge records.
 * Provides a searchable, editable list of vectorized knowledge chunks.
 *
 * @module KnowledgeComponents
 * @category Components
 */

import React, { useState } from "react";
import { Database, Save, X, Edit2, Trash2, Loader2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useUIStore } from "../../../store/uiStore";
import { useDeleteKnowledge, useUpdateKnowledge } from "../hooks/useKnowledge";
import type { KnowledgeSearchResult } from "../types/knowledge.types";
import styles from "../pages/KnowledgeBase.module.css";

/**
 * Properties for the KnowledgeManager component.
 * @interface KnowledgeManagerProps
 */
interface KnowledgeManagerProps {
  /** Array of knowledge chunks to display and manage */
  chunks: KnowledgeSearchResult[];
  /** Loading state flag from the parent data query */
  isLoading: boolean;
}

/**
 * KnowledgeManager Component
 *
 * Allows administrators to review the raw content currently indexed in the
 * RAG system. Supports inline editing of text content (re-triggering vectorization)
 * and deletion of irrelevant records.
 *
 * @component
 */
export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({
  chunks,
  isLoading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { addNotification, confirm } = useUIStore();
  const deleteMutation = useDeleteKnowledge();
  const updateMutation = useUpdateKnowledge();

  /**
   * Triggers the deletion of a specific knowledge chunk with a confirmation guard.
   * @param chunkId The UUID of the record to delete.
   */
  const handleDelete = async (chunkId: string) => {
    confirm({
      title: "Delete Knowledge",
      message:
        "Are you sure you want to delete this knowledge chunk? This information will no longer be available for the AI to reference.",
      confirmLabel: "Delete Chunk",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(chunkId);
          addNotification({
            type: "success",
            message: "Knowledge chunk deleted successfully.",
          });
        } catch {
          // Error handled globally by API interceptor
        }
      },
    });
  };

  /**
   * Initializes the inline editor for a specific record.
   * @param chunk The knowledge record to be edited.
   */
  const startEdit = (chunk: KnowledgeSearchResult) => {
    setEditingId(chunk.id);
    setEditContent(chunk.content);
  };

  /**
   * Persists changes to the knowledge content.
   * Clears the editing state upon successful backend update.
   * @param chunkId The UUID of the record to update.
   */
  const handleUpdate = async (chunkId: string) => {
    try {
      await updateMutation.mutateAsync({
        chunkId,
        payload: { content: editContent },
      });
      addNotification({
        type: "success",
        message: "Knowledge record updated and re-vectorized.",
      });
      setEditingId(null);
    } catch {
      // Error handled globally by API interceptor
    }
  };

  return (
    <Card>
      <CardHeader style={{ border: "none" }}>
        <div className="flex items-center gap-sm">
          <Database size={20} color="var(--primary)" />
          <CardTitle>Injected Knowledge Records</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className={styles.resultsContainer}>
          {isLoading ? (
            <div className={styles.emptyState}>
              <Loader2
                className="animate-spin"
                size={24}
                color="var(--primary)"
              />
              <p>Loading items...</p>
            </div>
          ) : chunks.length > 0 ? (
            chunks.map((chunk) => (
              <div key={chunk.id} className={styles.resultItem}>
                <div className="flex-between" style={{ marginBottom: "8px" }}>
                  <span className={styles.resultBadge}>
                    ID: {chunk.id.split("-")[0]}...
                  </span>
                  <div className="flex gap-xs">
                    {editingId === chunk.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdate(chunk.id)}
                          isLoading={updateMutation.isPending}
                        >
                          <Save size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingId(null)}
                        >
                          <X size={14} />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(chunk)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(chunk.id)}
                          isLoading={deleteMutation.isPending}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                {editingId === chunk.id ? (
                  <textarea
                    className={styles.textarea}
                    style={{ height: "120px", fontSize: "0.85rem" }}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                ) : (
                  <p
                    style={{
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      margin: 0,
                    }}
                  >
                    {chunk.content}
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className={styles.emptyState}>No knowledge records found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
