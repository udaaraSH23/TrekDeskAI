import React, { useState, useEffect } from "react";
import {
  Send,
  Search,
  Settings,
  AlertCircle,
  FileCode,
  CheckCircle2,
  Clock,
  Wrench,
  ChevronDown,
  ChevronUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import {
  DevService,
  type DebugResult,
  type ToolInfo,
  type CalendarEvent,
} from "../services/DevService";
import styles from "./AIDebugger.module.css";

const AIDebugger: React.FC = () => {
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DebugResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [availableTools, setAvailableTools] = useState<ToolInfo[]>([]);
  const [expandedTool, setExpandedTool] = useState<string | null>(null);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    fetchTools();
    fetchCalendar();
  }, []);

  const fetchTools = async () => {
    try {
      const allTools = await DevService.getTools();
      setAvailableTools(allTools);
    } catch (err) {
      console.error("Failed to fetch tools", err);
    }
  };

  const fetchCalendar = async () => {
    try {
      const events = await DevService.getCalendar();
      setCalendarEvents(events);
    } catch (err) {
      console.error("Failed to fetch calendar", err);
    }
  };

  const runTest = async () => {
    if (!prompt.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await DevService.testPrompt(prompt);
      setResult(data);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Server connection failed. Is the backend running?";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to check if a date is busy
  const getEventsForDay = (dateStr: string) => {
    return calendarEvents.filter((event) => {
      const start = event.start.dateTime || event.start.date;
      return start?.startsWith(dateStr);
    });
  };

  // Generate a simple 7-day preview from today
  const renderCalendarPreview = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      const dayEvents = getEventsForDay(dateStr);
      days.push({
        date: dateStr,
        label: d.toLocaleDateString("en-US", {
          weekday: "short",
          day: "numeric",
        }),
        isBusy: dayEvents.length > 0,
        events: dayEvents,
      });
    }

    return (
      <div className={styles.calendarGrid}>
        {days.map((day) => (
          <div
            key={day.date}
            className={`${styles.dayCard} ${day.isBusy ? styles.dayCardBusy : ""}`}
          >
            <div className={styles.dayLabel}>{day.label}</div>
            <div
              className={`${styles.dayStatus} ${day.isBusy ? styles.dayStatusBusy : ""}`}
            >
              {day.isBusy ? `${day.events.length} Busy` : "Available"}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainLayout}>
        {/* Left Side: Input & Settings */}
        <div className={styles.inputColumn}>
          <Card>
            <CardHeader>
              <CardTitle style={{ fontSize: "1rem" }}>
                Execution Sandbox
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.inputWrapper}>
                <textarea
                  placeholder="Enter a test prompt (e.g., 'What treks do you have?' or 'Book Ella for me on Friday')"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={styles.textArea}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) runTest();
                  }}
                />
                <div className={styles.inputFooter}>
                  <p className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Press Ctrl+Enter to run
                  </p>
                  <Button
                    variant="primary"
                    onClick={runTest}
                    disabled={isLoading || !prompt.trim()}
                    className="flex items-center gap-sm"
                  >
                    {isLoading ? "Running..." : "Execute Test"}
                    <Send size={16} />
                  </Button>
                </div>
              </div>

              {error && (
                <div className={styles.error}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle
                style={{ fontSize: "1rem" }}
                className="flex items-center gap-sm"
              >
                <CalendarIcon size={16} /> Guide Availability Preview
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchCalendar}
                style={{ fontSize: "0.7rem", height: "24px" }}
              >
                Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {renderCalendarPreview()}
              <p
                className="text-muted"
                style={{
                  fontSize: "0.7rem",
                  marginTop: "10px",
                  fontStyle: "italic",
                }}
              >
                * Previewing next 7 days from Google Calendar (primary).
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle
                style={{ fontSize: "1rem" }}
                className="flex items-center gap-sm"
              >
                <Wrench size={16} /> Registered AI Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={styles.toolsListContainer}>
                {availableTools.map((tool) => (
                  <div key={tool.name} className={styles.toolItem}>
                    <div
                      className={styles.toolHeader}
                      onClick={() =>
                        setExpandedTool(
                          expandedTool === tool.name ? null : tool.name,
                        )
                      }
                    >
                      <span className={styles.toolName}>{tool.name}</span>
                      {expandedTool === tool.name ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )}
                    </div>
                    <p className={styles.toolDesc}>{tool.description}</p>
                    {expandedTool === tool.name && (
                      <div className={styles.toolDetails}>
                        <div className={styles.detailLabel}>Parameters:</div>
                        <pre className={styles.toolsCode}>
                          {JSON.stringify(tool.parameters.properties, null, 2)}
                        </pre>
                        {tool.parameters.required.length > 0 && (
                          <div style={{ marginTop: "8px" }}>
                            <div className={styles.detailLabel}>
                              Required Fields:
                            </div>
                            <div className={styles.requiredTags}>
                              {tool.parameters.required.map((r) => (
                                <span key={r} className={styles.requiredTag}>
                                  {r}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Results & Trace */}
        <div className={styles.resultsColumn}>
          {!result && !isLoading && (
            <div className={styles.emptyState}>
              <Search size={48} color="rgba(255,255,255,0.1)" />
              <p>Execute a prompt to see the tool trace logic</p>
            </div>
          )}

          {isLoading && (
            <div className={styles.loadingState}>
              <div className="animate-spin-slow">
                <Settings size={48} color="var(--primary)" />
              </div>
              <p>Gemini is thinking and dispatching tools...</p>
            </div>
          )}

          {result && (
            <div className="flex-col gap-lg">
              {/* Final AI Output */}
              <Card style={{ borderColor: "rgba(16, 185, 129, 0.3)" }}>
                <CardHeader>
                  <CardTitle
                    style={{ fontSize: "0.9rem", color: "var(--primary)" }}
                    className="flex items-center gap-sm"
                  >
                    <CheckCircle2 size={16} /> Final AI Response
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className={styles.responseText}>{result.response}</p>
                </CardContent>
              </Card>

              {/* Tool Trace Timeline */}
              <div className={styles.timelineContainer}>
                <h3 className={styles.sectionLabel}>Logic Trace Execution</h3>
                {result.trace.length === 0 ? (
                  <p
                    className="text-muted text-center"
                    style={{ fontSize: "0.9rem", padding: "1rem" }}
                  >
                    No tools were triggered for this prompt.
                  </p>
                ) : (
                  result.trace.map((entry, idx) => (
                    <div key={idx} className={styles.timelineEntry}>
                      <div className={styles.timelinePath} />
                      <div
                        className={`${styles.timelineBadge} ${entry.type === "tool_call" ? styles.timelineBadgeCall : styles.timelineBadgeResult}`}
                      >
                        {entry.type === "tool_call" ? (
                          <FileCode size={14} />
                        ) : (
                          <CheckCircle2 size={14} />
                        )}
                      </div>
                      <div className={styles.timelineContent}>
                        <div className={styles.timelineHeader}>
                          <span
                            className={
                              entry.type === "tool_call"
                                ? styles.toolNameTrace
                                : styles.toolResult
                            }
                          >
                            {entry.type === "tool_call"
                              ? `Tool Called: ${entry.name}`
                              : `Response from ${entry.name}`}
                          </span>
                        </div>
                        <pre className={styles.codeBlock}>
                          {JSON.stringify(
                            entry.type === "tool_call"
                              ? entry.args
                              : entry.result,
                            null,
                            2,
                          )}
                        </pre>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Raw Backend Logs */}
              <Card className={styles.logsCard}>
                <CardHeader>
                  <CardTitle
                    style={{ fontSize: "0.9rem" }}
                    className="flex items-center gap-sm"
                  >
                    <Clock size={16} /> Backend Service Logs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={styles.logsContainer}>
                    {result.logs.map((log, i) => (
                      <div key={i} className={styles.logLine}>
                        <span
                          style={{
                            color: "var(--primary)",
                            marginRight: "8px",
                          }}
                        >
                          [DEBUG]
                        </span>
                        {log}
                      </div>
                    ))}
                    {result.logs.length === 0 && (
                      <p style={{ color: "gray", fontSize: "0.8rem" }}>
                        No specific backend logs captured.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDebugger;
