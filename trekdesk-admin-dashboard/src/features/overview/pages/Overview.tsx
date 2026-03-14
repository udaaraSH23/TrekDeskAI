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
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { VoicePlayground } from "../../../features/voice/components/VoicePlayground";

import styles from "./Overview.module.css";

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
      <div className="flex-center" style={{ height: "100%" }}>
        <Loader2 className="animate-spin" size={48} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {error && (
        <div className={styles.errorBanner}>
          Error loading dashboard stats:{" "}
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      <section className={styles.statsGrid}>
        {statsConfig.map((stat, i) => (
          <Card key={i} hoverable>
            <CardContent style={{ padding: "1.5rem" }}>
              <div className="flex-between" style={{ marginBottom: "1rem" }}>
                <div className={styles.iconBox}>{stat.icon}</div>
                <div className={styles.changeBadge}>
                  <ArrowUpRight size={14} />
                  {stat.change}
                </div>
              </div>
              <p
                className="text-muted"
                style={{ fontSize: "0.9rem", marginBottom: "4px", margin: 0 }}
              >
                {stat.label}
              </p>
              <h3 style={{ fontSize: "1.5rem", margin: 0 }}>{stat.value}</h3>
            </CardContent>
          </Card>
        ))}
      </section>

      <div className={styles.mainGrid}>
        <Card style={{ flex: 1 }}>
          <CardHeader style={{ border: "none" }}>
            <div className="flex items-center gap-sm">
              <Activity size={20} color="var(--primary)" />
              <CardTitle>Voice Playground</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <p
              className="text-muted"
              style={{
                marginBottom: "1.5rem",
                fontSize: "0.9rem",
                lineHeight: "1.6",
              }}
            >
              Test your AI persona in real-time. This live sandbox uses your
              current system instructions and voice configuration to simulate
              authentic customer interactions.
            </p>
            <div className={styles.playgroundPreview}>
              <div className={styles.promoIcon}>
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
      </div>

      {/* Voice Playground Modal */}
      <VoicePlayground
        isOpen={isPlaygroundOpen}
        onClose={() => setIsPlaygroundOpen(false)}
      />
    </div>
  );
};

export default Overview;
