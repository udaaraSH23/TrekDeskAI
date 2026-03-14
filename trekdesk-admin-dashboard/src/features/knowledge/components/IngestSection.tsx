import React, { useState } from "react";
import { UploadCloud, Database, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../../components/ui/Card";
import { Button } from "../../../components/ui/Button";
import { Badge } from "../../../components/ui/Badge";
import { useIngestKnowledge } from "../hooks/useKnowledge";
import styles from "../pages/KnowledgeBase.module.css";

interface IngestSectionProps {
  allChunksCount: number;
  onSuccess: (msg: string) => void;
}

/**
 * IngestSection
 * Handles pasting of text content and vector ingestion.
 * Includes sidebar stats for the knowledge base.
 */
export const IngestSection: React.FC<IngestSectionProps> = ({
  allChunksCount,
  onSuccess,
}) => {
  const [ingestContent, setIngestContent] = useState("");
  const ingestMutation = useIngestKnowledge();

  const handleIngest = async () => {
    if (!ingestContent.trim()) return;
    ingestMutation.mutate(
      { content: ingestContent },
      {
        onSuccess: () => {
          setIngestContent("");
          onSuccess("Content ingested and vectorized successfully!");
        },
      },
    );
  };

  return (
    <div className={styles.layoutGrid}>
      <Card style={{ flex: 1 }}>
        <CardHeader style={{ border: "none" }}>
          <div className="flex items-center gap-sm">
            <UploadCloud size={20} color="var(--primary)" />
            <CardTitle>Add New Knowledge</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className={styles.label}>
            Text Content (Paste guide books or tour details)
          </p>
          <textarea
            className={styles.textarea}
            placeholder="Example: The Knuckles Mountain Range is a UNESCO World Heritage site... "
            value={ingestContent}
            onChange={(e) => setIngestContent(e.target.value)}
          />
          <div className="flex justify-end" style={{ marginTop: "1.5rem" }}>
            <Button
              onClick={handleIngest}
              isLoading={ingestMutation.isPending}
              disabled={!ingestContent.trim()}
              className="flex items-center gap-sm"
            >
              <Database size={18} /> Ingest & Embed
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className={styles.sidebar}>
        <Card>
          <CardContent className={styles.statMiniCard}>
            <FileText size={24} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: "1.2rem", margin: 0 }}>RAG Ready</h3>
              <p
                className="text-muted"
                style={{ fontSize: "0.8rem", marginTop: "4px", margin: 0 }}
              >
                Using Gemini Embeddings
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
            <div className="flex-between">
              <span className="text-muted" style={{ fontSize: "0.85rem" }}>
                Total Chunks:
              </span>
              <Badge variant="outline">{allChunksCount}</Badge>
            </div>
            <p
              className="text-muted"
              style={{ fontSize: "0.8rem", marginTop: "1rem" }}
            >
              Vectors are stored in PostgreSQL with 768 dimensions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
