import React from "react";

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{ animation: "fadeIn 0.5s ease-out" }}>
      <h1 style={{ fontSize: "1.8rem", marginBottom: "8px" }}>{title}</h1>
      <p style={{ color: "var(--muted-foreground)" }}>
        This module is currently being optimized for high-volume lead handling.
      </p>

      <div
        className="card"
        style={{
          marginTop: "2.5rem",
          height: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "1px dashed var(--border)",
        }}
      >
        <p style={{ color: "var(--muted-foreground)" }}>
          Section: {title} - coming soon in Phase 4 build.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
