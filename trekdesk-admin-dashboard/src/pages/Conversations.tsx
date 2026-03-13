import React, { useState } from "react";
import {
  Search,
  Filter,
  Clock,
  Trash2,
  MessageSquare,
  Terminal,
} from "lucide-react";
import {
  useCallLogs,
  useCallLogDetails,
  useDeleteCallLog,
} from "../hooks/useAnalytics";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import type { TranscriptMessage } from "../types/analytics.types";

const Conversations: React.FC = () => {
  const { data: logs = [], isLoading: loading, error } = useCallLogs();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: detailLog, isLoading: detailLoading } = useCallLogDetails(
    selectedLogId || "",
  );

  const deleteMutation = useDeleteCallLog();

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this conversation?")) {
      setSelectedLogId(null);
      await deleteMutation.mutateAsync(id);
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.summary &&
        log.summary.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div style={containerStyle}>
      {error && (
        <Badge
          variant="destructive"
          style={{
            marginBottom: "1.5rem",
            padding: "1rem",
            width: "100%",
            justifyContent: "center",
          }}
        >
          {error instanceof Error
            ? error.message
            : "Failed to load conversations"}
        </Badge>
      )}

      <div style={layoutStyle}>
        {/* Left List */}
        <Card style={listPanelStyle}>
          <div style={searchBoxStyle}>
            <Search size={16} color="var(--muted-foreground)" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ flex: 1, border: "none", background: "transparent" }}
            />
            <Filter
              size={16}
              color="var(--muted-foreground)"
              style={{ cursor: "pointer" }}
            />
          </div>

          <div style={listStyle}>
            {loading && logs.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                Loading...
              </div>
            ) : filteredLogs.length === 0 ? (
              <div
                style={{
                  padding: "2rem",
                  textAlign: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                No sessions found
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  style={{
                    ...callItemStyle,
                    backgroundColor:
                      selectedLogId === log.id
                        ? "rgba(16, 185, 129, 0.1)"
                        : "transparent",
                    borderColor:
                      selectedLogId === log.id
                        ? "rgba(16, 185, 129, 0.3)"
                        : "transparent",
                  }}
                >
                  <div style={avatarStyle}>
                    <MessageSquare size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "4px",
                      }}
                    >
                      <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>
                        Session {log.session_id.substring(0, 8)}
                      </p>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-foreground)",
                        }}
                      >
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      style={{
                        fontSize: "0.8rem",
                        color: "var(--muted-foreground)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                      }}
                    >
                      {log.summary || "AI Inquiry"}
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        marginTop: "8px",
                      }}
                    >
                      <Badge
                        variant={
                          log.sentiment_score > 0.7 ? "success" : "secondary"
                        }
                      >
                        {log.sentiment_score > 0.7 ? "Hot Lead" : "Inquiry"}
                      </Badge>
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted-foreground)",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <Clock size={12} style={{ marginRight: "4px" }} />{" "}
                        {Math.floor(log.duration_seconds / 60)}:
                        {(log.duration_seconds % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Right Detail */}
        <Card style={detailPanelStyle}>
          {selectedLogId ? (
            detailLoading ? (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                Loading details...
              </div>
            ) : detailLog ? (
              <>
                <div style={detailHeaderStyle}>
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        ...avatarStyle,
                        width: "48px",
                        height: "48px",
                        fontSize: "1.2rem",
                      }}
                    >
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.4rem" }}>
                        Session {detailLog.session_id.substring(0, 8)}
                      </h2>
                      <p
                        style={{
                          color: "var(--muted-foreground)",
                          fontSize: "0.9rem",
                        }}
                      >
                        Call on{" "}
                        {new Date(detailLog.created_at).toLocaleDateString()} •
                        Ref: #{detailLog.id.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px" }}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => detailLog && handleDelete(detailLog.id)}
                      isLoading={deleteMutation.isPending}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </Button>
                  </div>
                </div>

                <div style={insightsPanelStyle}>
                  <div style={insightItemStyle}>
                    <div style={insightLabelStyle}>Summary</div>
                    <p style={insightValueStyle}>
                      {detailLog.summary ||
                        "No summary available for this session."}
                    </p>
                  </div>
                  <div
                    style={{ display: "flex", gap: "2rem", marginTop: "1rem" }}
                  >
                    <div>
                      <div style={insightLabelStyle}>Sentiment Score</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        <Badge
                          variant={
                            detailLog.sentiment_score > 0.7
                              ? "success"
                              : "secondary"
                          }
                        >
                          {(detailLog.sentiment_score * 100).toFixed(0)}%
                        </Badge>
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--muted-foreground)",
                          }}
                        >
                          {detailLog.sentiment_score > 0.7
                            ? "Positive / Hot Lead"
                            : "Neutral / Inquiry"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div style={insightLabelStyle}>Duration</div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontSize: "0.9rem",
                        }}
                      >
                        <Clock size={14} color="var(--primary)" />
                        {Math.floor(detailLog.duration_seconds / 60)}:
                        {(detailLog.duration_seconds % 60)
                          .toString()
                          .padStart(2, "0")}
                      </div>
                    </div>
                  </div>
                </div>

                <div style={tabContainerStyle}>
                  <div style={activeTabStyle}>
                    <Terminal size={14} style={{ marginRight: "6px" }} />
                    Full Transcript
                  </div>
                </div>

                <div style={transcriptContainerStyle}>
                  {Array.isArray(detailLog.transcript) &&
                  detailLog.transcript.length > 0 ? (
                    detailLog.transcript.map(
                      (turn: TranscriptMessage, i: number) => (
                        <div key={i} style={{ marginBottom: "1.5rem" }}>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              marginBottom: "6px",
                            }}
                          >
                            <span
                              style={{
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                color:
                                  turn.role === "ai"
                                    ? "var(--primary)"
                                    : "var(--secondary-foreground)",
                                textTransform: "uppercase",
                              }}
                            >
                              {turn.role === "ai" ? "AI" : "USER"}
                            </span>
                          </div>
                          <p
                            style={{
                              fontSize: "0.95rem",
                              lineHeight: "1.5",
                              color:
                                turn.role === "ai"
                                  ? "var(--foreground)"
                                  : "rgba(255,255,255,0.8)",
                              paddingLeft: "12px",
                              borderLeft:
                                turn.role === "ai"
                                  ? "2px solid var(--primary)"
                                  : "2px solid var(--border)",
                            }}
                          >
                            {turn.text}
                          </p>
                        </div>
                      ),
                    )
                  ) : (
                    <div
                      style={{
                        color: "var(--muted-foreground)",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      No transcript data available for this session.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--muted-foreground)",
                }}
              >
                Failed to load session details.
              </div>
            )
          ) : (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--muted-foreground)",
              }}
            >
              Select a conversation to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

// Styles
const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
  height: "100%",
};
const layoutStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
  height: "calc(100vh - 200px)",
};

const listPanelStyle: React.CSSProperties = {
  width: "350px",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  padding: 0,
};

const searchBoxStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const listStyle: React.CSSProperties = {
  flex: 1,
  overflowY: "auto",
  maxHeight: "calc(100vh - 300px)",
};

const callItemStyle: React.CSSProperties = {
  padding: "1.2rem",
  borderBottom: "1px solid var(--border)",
  cursor: "pointer",
  display: "flex",
  gap: "12px",
  transition: "all 0.2s ease",
  borderLeft: "3px solid transparent",
};

const avatarStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: "var(--secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 600,
  fontSize: "0.9rem",
  border: "1px solid var(--border)",
  color: "var(--primary)",
};

const detailPanelStyle: React.CSSProperties = {
  flex: 1,
  padding: "0",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
};

const detailHeaderStyle: React.CSSProperties = {
  padding: "1.5rem 2rem",
  borderBottom: "1px solid var(--border)",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const insightsPanelStyle: React.CSSProperties = {
  padding: "1.5rem 2rem",
  backgroundColor: "rgba(255,255,255,0.02)",
  borderBottom: "1px solid var(--border)",
};

const insightItemStyle: React.CSSProperties = {
  marginBottom: "1rem",
};

const insightLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontWeight: 700,
  color: "var(--muted-foreground)",
  textTransform: "uppercase",
  marginBottom: "4px",
  letterSpacing: "0.05em",
};

const insightValueStyle: React.CSSProperties = {
  fontSize: "0.95rem",
  lineHeight: "1.6",
  color: "var(--foreground)",
  margin: 0,
};

const tabContainerStyle: React.CSSProperties = {
  display: "flex",
  padding: "1.2rem 2rem",
  borderBottom: "1px solid var(--border)",
  gap: "1.5rem",
};

const tabStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  color: "var(--muted-foreground)",
  fontSize: "0.85rem",
  fontWeight: 600,
  paddingBottom: "8px",
  borderBottom: "2px solid transparent",
  display: "flex",
  alignItems: "center",
};

const activeTabStyle: React.CSSProperties = {
  ...tabStyle,
  color: "var(--primary)",
  borderBottom: "2px solid var(--primary)",
};

const transcriptContainerStyle: React.CSSProperties = {
  flex: 1,
  padding: "2rem",
  overflowY: "auto",
  scrollBehavior: "smooth",
};

export default Conversations;
