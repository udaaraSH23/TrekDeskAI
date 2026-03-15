/**
 * @file SemanticSearch.tsx
 * @description Diagnostic UI for testing vector similarity retrieval.
 * Allows administrators to verify how the AI retrieves knowledge for specific queries.
 *
 * @module KnowledgeComponents
 * @category Components
 */

import React, { useState } from "react";
import { Search, Save, X, Edit2, Trash2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { useUIStore } from "../../../store/uiStore";
import {
  useKnowledgeSearch,
  useDeleteKnowledge,
  useUpdateKnowledge,
} from "../hooks/useKnowledge";
import type { KnowledgeSearchResult } from "../types/knowledge.types";
import styles from "../pages/KnowledgeBase.module.css";

/**
 * SemanticSearch Component
 *
 * A research and development tool that simulates the RAG retrieval process.
 * By entering a natural language query, administrators can see exactly which
 * knowledge chunks have the highest similarity score and what the AI
 * will use to augment the conversation.
 *
 * @component
 */
export const SemanticSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeQuery, setActiveQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { addNotification, confirm } = useUIStore();

  /**
   * TanStack Query hook that fetches relevant knowledge based on the current 'activeQuery' state.
   */
  const { data: results = [], isLoading } = useKnowledgeSearch(activeQuery);
  const deleteMutation = useDeleteKnowledge();
  const updateMutation = useUpdateKnowledge();

  /**
   * Triggers the search by updating the active query state used by the hook.
   */
  const handleSearch = () => {
    setActiveQuery(searchTerm);
  };

  /**
   * Deletes a search result record.
   * @param chunkId The UUID of the record to delete.
   */
  const handleDelete = async (chunkId: string) => {
    confirm({
      title: "Delete Knowledge",
      message:
        "Are you sure you want to delete this specific chunk from the knowledge base? This will affect future AI responses.",
      confirmLabel: "Delete Chunk",
      type: "danger",
      onConfirm: async () => {
        try {
          await deleteMutation.mutateAsync(chunkId);
          addNotification({
            type: "success",
            message: "Knowledge record deleted.",
          });
        } catch {
          // Handled globally
        }
      },
    });
  };

  /**
   * Starts editing a search result record.
   * @param chunk The record to edit.
   */
  const startEdit = (chunk: KnowledgeSearchResult) => {
    setEditingId(chunk.id);
    setEditContent(chunk.content);
  };

  /**
   * Persists changes to the edited knowledge chunk.
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
        message: "Knowledge content updated and re-indexed.",
      });
      setEditingId(null);
    } catch {
      // Handled globally
    }
  };

  return (
    <Card>
      <CardHeader style={{ border: "none" }}>
        <div className="flex items-center gap-sm">
          <Search size={20} color="var(--primary)" />
          <CardTitle>Semantic Search Test</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {/* Search Input Controls */}
        <div className={styles.searchHeader}>
          <Input
            placeholder="Ask a question or search for specific text..."
            style={{ flex: 1 }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            isLoading={isLoading}
            disabled={!searchTerm.trim()}
          >
            Search
          </Button>
        </div>

        {/* Results with Similarity Scoring */}
        <div className={styles.resultsContainer}>
          {results.length > 0 ? (
            results.map((result: KnowledgeSearchResult, i: number) => (
              <div key={result.id || i} className={styles.resultItem}>
                <div className="flex-between" style={{ marginBottom: "8px" }}>
                  <div className="flex items-center gap-sm">
                    <span className={styles.resultBadge}>Rank #{i + 1}</span>
                    {result.similarity && (
                      <span
                        title="Cosine similarity score"
                        style={{
                          fontSize: "0.7rem",
                          color: "var(--primary)",
                          opacity: 0.8,
                        }}
                      >
                        Sim: {(result.similarity * 100).toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="flex gap-xs">
                    {editingId === result.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUpdate(result.id)}
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
                          onClick={() => startEdit(result)}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(result.id)}
                          isLoading={deleteMutation.isPending}
                        >
                          <Trash2 size={14} color="#ef4444" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>

                {editingId === result.id ? (
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
                    {result.content}
                  </p>
                )}
              </div>
            ))
          ) : activeQuery && !isLoading ? (
            <p className={styles.emptyState}>
              No relevant knowledge chunks found for this query.
            </p>
          ) : (
            <p className={styles.emptyState}>
              Enter a query to see what the AI will retrieve during live calls.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
