import React, { useState } from "react";
import {
  Search,
  FileText,
  Database,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import {
  useKnowledgeSearch,
  useIngestKnowledge,
  useDeleteKnowledge,
  useUpdateKnowledge,
  useAllKnowledge,
} from "../hooks/useKnowledge";
import type { KnowledgeSearchResult } from "../types/knowledge.types";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";

const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"documents" | "search" | "manage">(
    "documents",
  );
  const [ingestContent, setIngestContent] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const ingestMutation = useIngestKnowledge();
  const deleteMutation = useDeleteKnowledge();
  const updateMutation = useUpdateKnowledge();

  const {
    data: searchResults = [],
    isLoading: searchLoading,
    error: searchError,
  } = useKnowledgeSearch(searchQuery);

  const {
    data: allChunks = [],
    isLoading: listLoading,
    error: listError,
  } = useAllKnowledge();

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

  const handleIngest = async () => {
    if (!ingestContent.trim()) return;
    setSuccessMessage("");
    ingestMutation.mutate(
      { content: ingestContent },
      {
        onSuccess: () => {
          setIngestContent("");
          setSuccessMessage("Content ingested and vectorized successfully!");
          setTimeout(() => setSuccessMessage(""), 3000);
        },
      },
    );
  };

  const handleSearch = () => {
    // Search is handled automatically by useKnowledgeSearch fetching on query change
  };

  const error = ingestMutation.error || searchError || listError;

  return (
    <div style={containerStyle}>
      {error && (
        <div style={errorBannerStyle}>
          <AlertCircle size={18} style={{ marginRight: "8px" }} />
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {successMessage && (
        <Badge
          variant="success"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            width: "100%",
            justifyContent: "center",
            fontSize: "1rem",
          }}
        >
          <CheckCircle2 size={18} style={{ marginRight: "8px" }} />
          {successMessage}
        </Badge>
      )}

      <div style={tabContainerStyle}>
        <button
          style={activeTab === "documents" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("documents")}
        >
          Ingest Content
        </button>
        <button
          style={activeTab === "manage" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("manage")}
        >
          Manage Knowledge
        </button>
        <button
          style={activeTab === "search" ? activeTabStyle : tabStyle}
          onClick={() => setActiveTab("search")}
        >
          Semantic Search Test
        </button>
      </div>

      <main style={{ marginTop: "2rem" }}>
        {activeTab === "documents" ? (
          <div style={layoutGridStyle}>
            <Card style={{ flex: 1 }}>
              <CardHeader style={{ border: "none" }}>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "10px" }}
                >
                  <UploadCloud size={20} color="var(--primary)" />
                  <CardTitle>Add New Knowledge</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p style={labelStyle}>
                  Text Content (Paste guide books or tour details)
                </p>
                <textarea
                  style={textareaStyle}
                  placeholder="Example: The Knuckles Mountain Range is a UNESCO World Heritage site... "
                  value={ingestContent}
                  onChange={(e) => setIngestContent(e.target.value)}
                />
                <div
                  style={{
                    marginTop: "1.5rem",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <Button
                    onClick={handleIngest}
                    isLoading={ingestMutation.isPending}
                    disabled={!ingestContent.trim()}
                    icon={<Database size={18} />}
                  >
                    Ingest & Embed
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div
              style={{
                width: "300px",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <Card>
                <CardContent style={statMiniCardStyle}>
                  <FileText size={24} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontSize: "1.2rem", margin: 0 }}>RAG Ready</h3>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        marginTop: "4px",
                      }}
                    >
                      Using Google `gemini-embedding-001`
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader style={{ border: "none", paddingBottom: "0.5rem" }}>
                  <CardTitle style={{ fontSize: "1rem" }}>
                    Knowledge Base Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "var(--muted-foreground)",
                      }}
                    >
                      Total Chunks:
                    </span>
                    <Badge variant="outline">{allChunks.length}</Badge>
                  </div>
                  <p
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--muted-foreground)",
                      marginTop: "1rem",
                    }}
                  >
                    Vectors are stored in PostgreSQL with 768 dimensions.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : activeTab === "manage" ? (
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Database size={20} color="var(--primary)" />
                <CardTitle>Injected Knowledge Records</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div style={resultsContainerStyle}>
                {listLoading ? (
                  <p
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    Loading items...
                  </p>
                ) : allChunks.length > 0 ? (
                  allChunks.map((chunk: KnowledgeSearchResult) => (
                    <div key={chunk.id} style={resultItemStyle}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={resultBadgeStyle}>
                          ID: {chunk.id.split("-")[0]}...
                        </span>
                        <div style={{ display: "flex", gap: "5px" }}>
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
                          style={{
                            ...textareaStyle,
                            height: "120px",
                            fontSize: "0.85rem",
                          }}
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
                  <p
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "var(--muted-foreground)",
                    }}
                  >
                    No knowledge records found.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader style={{ border: "none" }}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                <Search size={20} color="var(--primary)" />
                <CardTitle>Semantic Search Test</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div
                style={{ display: "flex", gap: "10px", marginBottom: "2rem" }}
              >
                <Input
                  placeholder="Ask a question or search for specific text..."
                  style={{ flex: 1 }}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button
                  onClick={handleSearch}
                  isLoading={searchLoading}
                  disabled={!searchQuery.trim()}
                >
                  Search
                </Button>
              </div>

              <div style={resultsContainerStyle}>
                {searchResults.length > 0 ? (
                  searchResults.map(
                    (result: KnowledgeSearchResult, i: number) => (
                      <div key={result.id || i} style={resultItemStyle}>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              gap: "8px",
                              alignItems: "center",
                            }}
                          >
                            <span style={resultBadgeStyle}>Rank #{i + 1}</span>
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
                          <div style={{ display: "flex", gap: "5px" }}>
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
                            style={{
                              ...textareaStyle,
                              height: "120px",
                              fontSize: "0.85rem",
                            }}
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
                    ),
                  )
                ) : searchQuery && !searchLoading ? (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--muted-foreground)",
                      padding: "2rem",
                    }}
                  >
                    No relevant knowledge chunks found for this query.
                  </p>
                ) : (
                  <p
                    style={{
                      textAlign: "center",
                      color: "var(--muted-foreground)",
                      padding: "2rem",
                    }}
                  >
                    Enter a query to see what the AI will retrieve during live
                    calls.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
};
const layoutGridStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  alignItems: "start",
};
const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  gap: "2rem",
  borderBottom: "1px solid var(--border)",
};
const tabStyle: React.CSSProperties = {
  padding: "10px 0",
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  color: "var(--muted-foreground)",
  fontWeight: 600,
  fontSize: "1rem",
  cursor: "pointer",
};
const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  borderBottomColor: "var(--primary)",
  color: "var(--primary)",
};
const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  marginBottom: "8px",
  color: "rgba(255,255,255,0.9)",
};
const textareaStyle: React.CSSProperties = {
  width: "100%",
  height: "300px",
  backgroundColor: "rgba(255,255,255,0.03)",
  border: "1px solid var(--border)",
  borderRadius: "10px",
  padding: "1rem",
  color: "white",
  fontSize: "0.95rem",
  lineHeight: "1.6",
  outline: "none",
  resize: "none",
};
const statMiniCardStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "15px",
  padding: "1.2rem",
};
const resultsContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};
const resultItemStyle: React.CSSProperties = {
  padding: "1.2rem",
  backgroundColor: "rgba(255,255,255,0.02)",
  borderRadius: "10px",
  border: "1px solid var(--border)",
};
const resultBadgeStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  color: "var(--primary)",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  padding: "2px 8px",
  borderRadius: "4px",
  textTransform: "uppercase",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "rgba(239, 68, 68, 0.1)",
  color: "#ef4444",
  padding: "1rem",
  borderRadius: "10px",
  marginBottom: "1.5rem",
  border: "1px solid rgba(239, 68, 68, 0.2)",
  display: "flex",
  alignItems: "center",
};

export default KnowledgeBase;
