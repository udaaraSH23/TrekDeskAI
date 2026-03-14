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
import {
  useKnowledgeSearch,
  useDeleteKnowledge,
  useUpdateKnowledge,
} from "../hooks/useKnowledge";
import type { KnowledgeSearchResult } from "../types/knowledge.types";
import styles from "../pages/KnowledgeBase.module.css";

/**
 * SemanticSearch
 * Testing interface for vector search retrieval.
 */
export const SemanticSearch: React.FC = () => {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const { data: results = [], isLoading } = useKnowledgeSearch(query);
  const deleteMutation = useDeleteKnowledge();
  const updateMutation = useUpdateKnowledge();

  const handleSearch = () => {
    // Search is reactive to query change in the hook
  };

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
          <Search size={20} color="var(--primary)" />
          <CardTitle>Semantic Search Test</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className={styles.searchHeader}>
          <Input
            placeholder="Ask a question or search for specific text..."
            style={{ flex: 1 }}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button
            onClick={handleSearch}
            isLoading={isLoading}
            disabled={!query.trim()}
          >
            Search
          </Button>
        </div>

        <div className={styles.resultsContainer}>
          {results.length > 0 ? (
            results.map((result: KnowledgeSearchResult, i: number) => (
              <div key={result.id || i} className={styles.resultItem}>
                <div className="flex-between" style={{ marginBottom: "8px" }}>
                  <div className="flex items-center gap-sm">
                    <span className={styles.resultBadge}>Rank #{i + 1}</span>
                    {result.similarity && (
                      <span
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
          ) : query && !isLoading ? (
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
