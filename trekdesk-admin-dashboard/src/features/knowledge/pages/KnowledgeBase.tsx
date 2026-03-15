/**
 * @file KnowledgeBase.tsx
 * @description Root orchestration page for the Knowledge Base feature.
 * Manages tab-based navigation between Ingestion, Management, and Semantic Search testing.
 *
 * @module KnowledgePages
 * @category Pages
 */

import React, { useState } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useAllKnowledge } from "../hooks/useKnowledge";
import { Badge } from "../../../components/ui/Badge";

import { IngestSection } from "../components/IngestSection";
import { KnowledgeManager } from "../components/KnowledgeManager";
import { SemanticSearch } from "../components/SemanticSearch";

import styles from "./KnowledgeBase.module.css";

/**
 * KnowledgeBase Page Component
 *
 * This is the primary control center for the RAG (Retrieval Augmented Generation)
 * system. It allows administrators to feed information to the AI, curate
 * existing indices, and verify retrieval logic via a semantic playground.
 *
 * @component
 */
const KnowledgeBase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"documents" | "search" | "manage">(
    "documents",
  );
  const [successMessage, setSuccessMessage] = useState("");

  /**
   * Data fetching hook for the dashboard-wide knowledge statistics.
   */
  const {
    data: allChunks = [],
    isLoading: listLoading,
    error: listError,
  } = useAllKnowledge();

  const error = listError;

  return (
    <div className={styles.container}>
      {/* Dynamic Error Banner for Backend Connectivity Issues */}
      {error && (
        <div className={styles.errorBanner}>
          <AlertCircle size={18} style={{ marginRight: "8px" }} />
          {error instanceof Error ? error.message : String(error)}
        </div>
      )}

      {/* Ephemeral Success Notifications */}
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

      {/* Feature Navigation Tabs */}
      <div className={styles.tabContainer}>
        <button
          className={`${styles.tab} ${activeTab === "documents" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("documents")}
        >
          Ingest Content
        </button>
        <button
          className={`${styles.tab} ${activeTab === "manage" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("manage")}
        >
          Manage Knowledge
        </button>
        <button
          className={`${styles.tab} ${activeTab === "search" ? styles.activeTab : ""}`}
          onClick={() => setActiveTab("search")}
        >
          Semantic Search Test
        </button>
      </div>

      {/* Atomized Feature Rendering */}
      <main style={{ marginTop: "2rem" }}>
        {activeTab === "documents" && (
          <IngestSection
            allChunksCount={allChunks.length}
            onSuccess={(msg) => {
              setSuccessMessage(msg);
              setTimeout(() => setSuccessMessage(""), 3000);
            }}
          />
        )}
        {activeTab === "manage" && (
          <KnowledgeManager chunks={allChunks} isLoading={listLoading} />
        )}
        {activeTab === "search" && <SemanticSearch />}
      </main>
    </div>
  );
};

export default KnowledgeBase;
