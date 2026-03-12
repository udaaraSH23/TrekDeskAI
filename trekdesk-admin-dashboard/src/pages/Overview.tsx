import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Play,
  ArrowUpRight,
  Activity,
  Loader2,
} from "lucide-react";
import { useAnalyticsStats } from "../hooks/useAnalytics";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import type { CallLog } from "../types/analytics.types";

const Overview: React.FC = () => {
  const navigate = useNavigate();
  const { data: stats, isLoading: loading, error } = useAnalyticsStats();

  const statsConfig = [
    {
      label: "Total AI Calls",
      value: stats?.total_calls ?? "0",
      change: "+0%",
      icon: <MessageSquare color="#3b82f6" />,
      color: "#3b82f6",
    },
    {
      label: "Qualified Leads",
      value: stats?.leads_count ?? "0",
      change: "+0%",
      icon: <Users color="#10b981" />,
      color: "#10b981",
    },
    {
      label: "Conversion Rate",
      value: stats?.conversion_rate ?? "N/A",
      change: "0%",
      icon: <TrendingUp color="#f59e0b" />,
      color: "#f59e0b",
    },
    {
      label: "Est. Revenue",
      value: stats?.revenue ?? "N/A",
      change: "0%",
      icon: <DollarSign color="#8b5cf6" />,
      color: "#8b5cf6",
    },
  ];

  if (loading && !stats) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div>
          <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>
            Command Center
          </h1>
          <p style={{ color: "var(--muted-foreground)" }}>
            Welcome back, Kandy Treks. Here's your AI's performance today.
          </p>
        </div>
        <div style={statusBadgeStyle}>
          <div style={pulseStyle}></div>
          <Badge variant="success">AI Agent Active</Badge>
        </div>
      </header>

      {error && (
        <div
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            color: "#ef4444",
            padding: "1rem",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            border: "1px solid rgba(239, 68, 68, 0.2)",
          }}
        >
          Error loading dashboard stats:{" "}
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <section style={statsGridStyle}>
        {statsConfig.map((stat, i) => (
          <Card key={i} hoverable>
            <CardContent style={{ padding: "1.5rem" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div style={iconBoxStyle}>{stat.icon}</div>
                <div style={changeBadgeStyle}>
                  <ArrowUpRight size={14} />
                  {stat.change}
                </div>
              </div>
              <p
                style={{
                  fontSize: "0.9rem",
                  color: "var(--muted-foreground)",
                  marginBottom: "4px",
                }}
              >
                {stat.label}
              </p>
              <h3 style={{ fontSize: "1.5rem" }}>{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </section>

      <div style={mainGridStyle}>
        <Card style={{ flex: 2 }}>
          <CardHeader
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              paddingBottom: 0,
              border: "none",
            }}
          >
            <CardTitle>Conversation Volume</CardTitle>
            <select style={selectStyle}>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
            </select>
          </CardHeader>
          <CardContent>
            <div style={chartPlaceholderStyle}>
              {/* Simulated Chart - Implementation pending real time-series data */}
              <Activity size={48} color="rgba(16, 185, 129, 0.2)" />
              <p
                style={{ color: "var(--muted-foreground)", marginTop: "1rem" }}
              >
                Volume visualization live
              </p>
            </div>
          </CardContent>
        </Card>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
          }}
        >
          <Card style={promoCardStyle}>
            <CardContent style={{ padding: "1.5rem" }}>
              <div style={promoIconStyle}>
                <Play size={24} fill="white" />
              </div>
              <CardTitle style={{ color: "white" }}>Quick Test</CardTitle>
              <p
                style={{
                  fontSize: "0.85rem",
                  color: "rgba(255,255,255,0.7)",
                  margin: "8px 0 16px",
                }}
              >
                Test your current AI persona and tools in the live sandbox.
              </p>
              <Button
                variant="secondary"
                style={{ width: "100%" }}
                onClick={() => navigate("/widget")}
              >
                Launch Simulator
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader style={{ paddingBottom: "0.5rem", border: "none" }}>
              <CardTitle>Recent Hot Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ marginTop: "0.5rem" }}>
                {stats?.hot_leads && stats.hot_leads.length > 0 ? (
                  stats.hot_leads.map((lead: CallLog, i: number) => (
                    <div key={i} style={leadItemStyle}>
                      <div style={avatarSmallStyle}>
                        <Users size={14} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: "0.9rem", fontWeight: 600 }}>
                          {lead.session_id.substring(0, 8)}...
                        </p>
                        <p
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--muted-foreground)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "180px",
                          }}
                        >
                          {lead.summary || "Lead Inquiry"}
                        </p>
                      </div>
                      <Badge variant="destructive">Hot</Badge>
                    </div>
                  ))
                ) : (
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--muted-foreground)",
                      textAlign: "center",
                      padding: "1rem",
                    }}
                  >
                    No hot leads yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: "2.5rem",
};

const statusBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  padding: "0.6rem 1rem",
  borderRadius: "20px",
  border: "1px solid rgba(16, 185, 129, 0.2)",
};

const pulseStyle: React.CSSProperties = {
  width: "8px",
  height: "8px",
  borderRadius: "50%",
  backgroundColor: "var(--primary)",
  boxShadow: "0 0 10px var(--primary)",
  animation: "pulse 2s infinite",
};

const statsGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "1.5rem",
  marginBottom: "2.5rem",
};

const iconBoxStyle: React.CSSProperties = {
  width: "40px",
  height: "40px",
  borderRadius: "10px",
  backgroundColor: "rgba(255, 255, 255, 0.05)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const changeBadgeStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "4px 8px",
  borderRadius: "6px",
  backgroundColor: "rgba(16, 185, 129, 0.1)",
  color: "var(--primary)",
  fontSize: "0.75rem",
  fontWeight: 600,
  height: "fit-content",
};

const mainGridStyle: React.CSSProperties = {
  display: "flex",
  gap: "1.5rem",
};

const chartPlaceholderStyle: React.CSSProperties = {
  height: "300px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  border: "1px dashed var(--border)",
  borderRadius: "12px",
};

const selectStyle: React.CSSProperties = {
  padding: "0.4rem 0.8rem",
  borderRadius: "8px",
  backgroundColor: "var(--secondary)",
  color: "white",
  border: "1px solid var(--border)",
};

const promoCardStyle: React.CSSProperties = {
  background: "linear-gradient(135deg, #10b981 0%, #3b82f6 100%)",
  color: "white",
  border: "none",
};

const promoIconStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
};

const leadItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  padding: "12px 0",
  borderBottom: "1px solid var(--border)",
};

const avatarSmallStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "50%",
  backgroundColor: "var(--secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "0.75rem",
  fontWeight: 600,
};

export default Overview;
