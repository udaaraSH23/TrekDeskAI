import React, { useState } from "react";
import { Clock, Trash2, MessageSquare } from "lucide-react";
import {
  useCallLogs,
  useCallLogDetails,
  useDeleteCallLog,
} from "../../overview/hooks/useAnalytics";
import { Card } from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import type { TranscriptMessage } from "../../overview/types/analytics.types";

import styles from "./Conversations.module.css";

const Conversations: React.FC = () => {
  const { data: logs = [], isLoading: loading, error } = useCallLogs();
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

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

  return (
    <div className={styles.container}>
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

      <div className={styles.layout}>
        {/* Left List */}
        <Card className={styles.listPanel}>
          <div className={styles.list}>
            {loading && logs.length === 0 ? (
              <div className={styles.emptyState}>Loading...</div>
            ) : logs.length === 0 ? (
              <div className={styles.emptyState}>No sessions found</div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(log.id)}
                  className={`${styles.callItem} ${selectedLogId === log.id ? styles.callItemActive : ""}`}
                >
                  <div className={styles.avatar}>
                    <MessageSquare size={18} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      className="flex-between"
                      style={{ marginBottom: "4px" }}
                    >
                      <p
                        style={{
                          fontWeight: 600,
                          fontSize: "0.95rem",
                          margin: 0,
                        }}
                      >
                        Session {log.session_id.substring(0, 8)}
                      </p>
                      <span
                        className="text-muted"
                        style={{ fontSize: "0.75rem" }}
                      >
                        {new Date(log.created_at).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <p
                      className="text-muted"
                      style={{
                        fontSize: "0.8rem",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        maxWidth: "180px",
                        margin: 0,
                      }}
                    >
                      {log.summary || "AI Inquiry"}
                    </p>
                    <div
                      className="flex items-center gap-sm"
                      style={{ marginTop: "8px" }}
                    >
                      <Badge
                        variant={
                          log.sentiment_score > 0.7 ? "success" : "secondary"
                        }
                      >
                        {log.sentiment_score > 0.7 ? "Hot Lead" : "Inquiry"}
                      </Badge>
                      <div
                        className="flex items-center text-muted"
                        style={{ fontSize: "0.75rem" }}
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
        <Card className={styles.detailPanel}>
          {selectedLogId ? (
            detailLoading ? (
              <div className={styles.emptyState}>Loading details...</div>
            ) : detailLog ? (
              <>
                <div className={styles.detailHeader}>
                  <div className="flex items-center gap-md">
                    <div
                      className={styles.avatar}
                      style={{ width: "48px", height: "48px" }}
                    >
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.4rem", margin: 0 }}>
                        Session {detailLog.session_id.substring(0, 8)}
                      </h2>
                      <p
                        className="text-muted"
                        style={{ fontSize: "0.9rem", margin: 0 }}
                      >
                        Call on{" "}
                        {new Date(detailLog.created_at).toLocaleDateString()} •
                        Ref: #{detailLog.id.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-sm">
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

                <div className={styles.insightsPanel}>
                  <div className={styles.insightItemFull}>
                    <div className={styles.insightLabel}>Summary</div>
                    <p className={styles.insightValue}>
                      {detailLog.summary ||
                        "No summary available for this session."}
                    </p>
                  </div>

                  <div className={styles.insightGrid}>
                    <div className={styles.insightItem}>
                      <div className={styles.insightLabel}>Sentiment</div>
                      <div className="flex items-center gap-sm">
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
                          className="text-muted"
                          style={{ fontSize: "0.75rem" }}
                        >
                          {detailLog.sentiment_score > 0.7
                            ? "Hot Lead"
                            : "Inquiry"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.insightItem}>
                      <div className={styles.insightLabel}>Duration</div>
                      <div
                        className="flex items-center gap-sm"
                        style={{ fontSize: "0.9rem" }}
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

                <div className={styles.transcriptContainer}>
                  {Array.isArray(detailLog.transcript) &&
                  detailLog.transcript.length > 0 ? (
                    detailLog.transcript.map(
                      (turn: TranscriptMessage, i: number) => (
                        <div
                          key={i}
                          className={`${styles.message} ${turn.role === "ai" ? styles.ai : styles.user}`}
                        >
                          <div className={styles.messageHeader}>
                            <span
                              className={`${styles.roleLabel} ${turn.role === "ai" ? styles.aiRole : styles.userRole}`}
                            >
                              {turn.role === "ai" ? "Assistant" : "User"}
                            </span>
                          </div>
                          <p
                            className={`${styles.messageContent} ${turn.role === "ai" ? styles.aiContent : styles.userContent}`}
                          >
                            {turn.text}
                          </p>
                        </div>
                      ),
                    )
                  ) : (
                    <div className={styles.emptyState}>
                      No transcript data available for this session.
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                Failed to load session details.
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              Select a conversation to view details
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Conversations;
