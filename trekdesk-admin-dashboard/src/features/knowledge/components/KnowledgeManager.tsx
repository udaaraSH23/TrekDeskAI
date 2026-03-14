import React, { useState } from "react";
import { Database, Save, X, Edit2, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { useDeleteKnowledge, useUpdateKnowledge } from "../hooks/useKnowledge";
import type { KnowledgeSearchResult } from "../types/knowledge.types";
import styles from "../pages/KnowledgeBase.module.css";

interface KnowledgeManagerProps {
  chunks: KnowledgeSearchResult[];
  isLoading: boolean;
}

/**
 * KnowledgeManager
 * Allows viewing, editing, and deleting knowledge chunks.
 */
export const KnowledgeManager: React.FC<KnowledgeManagerProps> = ({
  chunks,
  isLoading,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const deleteMutation = useDeleteKnowledge();
  const updateMutation = useUpdateKnowledge();

  const handleDelete = async (chunkId: string) => {
    if (
      window.confirm("Are you sure you want to delete this knowledge chunk?")
    ) {
      await deleteMutation.mutateAsync(chunkId);
    }
  };

  const startEdit = (chunk: KnowledgeSearchResult) => {
    setEditingId(chunk.id);
    setEditContent(chunk.content);
  };

  const handleUpdate = async (chunkId: string) => {
    await updateMutation.mutateAsync({
      chunkId,
      payload: { content: editContent },
    });
    setEditingId(null);
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
            <p className={styles.emptyState}>Loading items...</p>
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
