import React, { useState } from "react";
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
import { Button } from "../components/ui/Button";
import { VoicePlayground } from "../components/VoicePlayground";

const Overview: React.FC = () => {
  const [isPlaygroundOpen, setIsPlaygroundOpen] = useState(false);
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
        <Card style={{ flex: 1 }}>
          <CardHeader style={{ border: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Activity size={20} color="var(--primary)" />
              <CardTitle>Voice Playground</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p
              style={{
                color: "var(--muted-foreground)",
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
            >
              Test your AI persona in real-time. This live sandbox uses your
              current system instructions and voice configuration to simulate
              authentic customer interactions.
            </p>
            <div style={playgroundPreviewStyle}>
              <div style={promoIconStyle}>
                <Play size={24} fill="white" />
              </div>
              <Button
                variant="primary"
                style={{ width: "200px" }}
                onClick={() => setIsPlaygroundOpen(true)}
              >
                Start Testing
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Voice Playground Modal */}
        <VoicePlayground
          isOpen={isPlaygroundOpen}
          onClose={() => setIsPlaygroundOpen(false)}
        />
      </div>
    </div>
  );
};

const containerStyle: React.CSSProperties = {
  animation: "fadeIn 0.5s ease-out",
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

const playgroundPreviewStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "2rem",
  backgroundColor: "rgba(0,0,0,0.2)",
  borderRadius: "16px",
  border: "1px dashed var(--border)",
};

const promoIconStyle: React.CSSProperties = {
  width: "48px",
  height: "48px",
  borderRadius: "12px",
  backgroundColor: "rgba(255, 255, 255, 0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "1rem",
};

export default Overview;
