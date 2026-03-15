/**
 * @file Conversations.tsx
 * @description The primary management interface for AI call logs and session transcripts.
 *
 * This feature allows administrators to:
 * 1. Browse historical AI-customer interactions (sessions).
 * 2. View rich analytical data (sentiment scores, durations, summaries).
 * 3. Review full conversation transcripts with role-based formatting.
 * 4. Permanently delete session records via a secure global confirmation flow.
 *
 * It utilizes TanStack Query for server-state caching and synchronization,
 * and the global UI store for standardized modal/loader overlays.
 */

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
import { useUIStore } from "../../../store/uiStore";
import type { TranscriptMessage } from "../../overview/types/analytics.types";

import styles from "./Conversations.module.css";

/**
 * Conversations Component
 *
 * Implements a "Split-Pane" layout pattern:
 * - Left: Scrollable list of summary cards.
 * - Right: Detailed detail/transcript view for the selected record.
 *
 * Handles complex loading states, empty session scenarios, and error boundaries.
 */
const Conversations: React.FC = () => {
  /**
   * Data Source: Call Logs List
   * Fetches summary-level data for the sidebar list.
   */
  const { data: logs = [], isLoading: loading, error } = useCallLogs();

  /** State: Currently selected session for detailed view. */
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  /**
   * Action Hooks: Global UI Overlays
   * We use individual selectors here to ensure the core page doesn't re-render
   * if unrelated UI state (e.g. notifications) changes.
   */
  const confirm = useUIStore((state) => state.confirm);
  const setLoading = useUIStore((state) => state.setLoading);

  /**
   * Data Source: Call Details
   * Fetches full transcript and insights for the active selection.
   * `enabled: !!selectedLogId` prevents unnecessary network calls.
   */
  const { data: detailLog, isLoading: detailLoading } = useCallLogDetails(
    selectedLogId || "",
  );

  /** Mutation Hook: Handles log deletion and cache invalidation. */
  const deleteMutation = useDeleteCallLog();

  /**
   * handleDelete
   * Orchestrates the deletion workflow:
   * 1. Shows global confirmation modal.
   * 2. Triggers full-screen loader on confirmation.
   * 3. Executes API call and cleans up state.
   *
   * @param id - The unique identifier of the call log to remove.
   */
  const handleDelete = (id: string) => {
    confirm({
      title: "Delete Conversation",
      message:
        "Are you sure you want to delete this conversation? This action cannot be undone and will remove the record from analytics.",
      confirmLabel: "Delete",
      type: "danger",
      onConfirm: async () => {
        setLoading(true);
        try {
          // Reset selection before deletion to avoid 404 details lookups
          setSelectedLogId(null);
          await deleteMutation.mutateAsync(id);
        } finally {
          // Ensure loader is hidden even if the request fails
          setLoading(false);
        }
      },
    });
  };

  return (
    <div className={styles.container}>
      {/* Global API Error Alert */}
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
            : "Failed to connect to the analytics service."}
        </Badge>
      )}

      <div className={styles.layout}>
        {/* Left Side: Session List Panel */}
        <Card className={styles.listPanel}>
          <div className={styles.list}>
            {loading && logs.length === 0 ? (
              <div className={styles.emptyState}>Loading conversations...</div>
            ) : logs.length === 0 ? (
              <div className={styles.emptyState}>No session records found.</div>
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
                    {/* Summary Snippet */}
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
                    {/* Metadata Badges */}
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

        {/* Right Side: Detailed session drill-down */}
        <Card className={styles.detailPanel}>
          {selectedLogId ? (
            detailLoading ? (
              <div className={styles.emptyState}>Syncing transcript...</div>
            ) : detailLog ? (
              <>
                {/* Header: Session ID & Quick Actions */}
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
                        Recorded on{" "}
                        {new Date(detailLog.created_at).toLocaleDateString()} •
                        Internal ID: #{detailLog.id.substring(0, 5)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-sm">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Delete Session"
                      onClick={() => detailLog && handleDelete(detailLog.id)}
                    >
                      <Trash2 size={18} color="#ef4444" />
                    </Button>
                  </div>
                </div>

                {/* Analytical Insights Grid */}
                <div className={styles.insightsPanel}>
                  <div className={styles.insightItemFull}>
                    <div className={styles.insightLabel}>AI Summary</div>
                    <p className={styles.insightValue}>
                      {detailLog.summary ||
                        "No summary available for this session."}
                    </p>
                  </div>

                  <div className={styles.insightGrid}>
                    <div className={styles.insightItem}>
                      <div className={styles.insightLabel}>Sentiment Score</div>
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
                            ? "Positive/Hot"
                            : "Neutral/Inquiry"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.insightItem}>
                      <div className={styles.insightLabel}>Call Duration</div>
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

                {/* Live Transcript Thread */}
                <div className={styles.transcriptSection}>
                  <div className={styles.sectionHeader}>
                    <h3 className={styles.sectionTitle}>
                      Conversation Transcript
                    </h3>
                    <div className={styles.badgeLine}></div>
                  </div>

                  <div className={styles.transcriptContainer}>
                    {(() => {
                      // Attempt to normalize transcript data (handle potential stringified JSON)
                      let messages = detailLog.transcript;
                      if (typeof messages === "string") {
                        try {
                          messages = JSON.parse(messages);
                        } catch {
                          messages = [];
                        }
                      }

                      if (Array.isArray(messages) && messages.length > 0) {
                        return messages.map(
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
                        );
                      }

                      // Fallback for legacy format (object with full_text instead of array)
                      if (
                        messages &&
                        typeof messages === "object" &&
                        !Array.isArray(messages)
                      ) {
                        const legacyMap = messages as Record<string, unknown>;
                        if (typeof legacyMap.full_text === "string") {
                          return (
                            <div className={`${styles.message} ${styles.ai}`}>
                              <div className={styles.messageHeader}>
                                <span
                                  className={`${styles.roleLabel} ${styles.aiRole}`}
                                >
                                  Assistant
                                </span>
                              </div>
                              <p
                                className={`${styles.messageContent} ${styles.aiContent}`}
                              >
                                {legacyMap.full_text}
                              </p>
                            </div>
                          );
                        }
                      }

                      return (
                        <div className={styles.emptyState}>
                          <MessageSquare size={32} opacity={0.3} />
                          <p>
                            No transcript dialogue was captured for this
                            session.
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                Failed to reconstruct session details.
              </div>
            )
          ) : (
            <div className={styles.emptyState}>
              Select a session from the list to review the transcript.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Conversations;
