import React from "react";
import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useUIStore } from "../store/uiStore";

/**
 * Header Component
 * Now serves as the dynamic Page Header, showing the title and description
 * for the current route, as well as the sidebar toggle when hidden.
 */
const Header = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  // Map of routes to their titles and descriptions
  const routeContent: Record<string, { title: string; description: string }> = {
    "/": {
      title: "Command Center",
      description:
        "Welcome back, Kandy Treks. Here's your AI's performance today.",
    },
    "/conversations": {
      title: "Conversations",
      description:
        "Review call records and AI-generated transcripts from your leads.",
    },
    "/knowledge": {
      title: "Knowledge Base",
      description:
        "Upload tour guides and trek info for the AI's intelligence pipeline.",
    },
    "/persona": {
      title: "AI Persona",
      description:
        "Define your AI's personality, knowledge constraints, and vocal style.",
    },
    "/tours": {
      title: "Tours & Treks",
      description:
        "Manage your inventory and tour data for the AI to reference.",
    },
    "/widget": {
      title: "Widget Config",
      description:
        "Customize the appearance and behavior of your customer-facing lobby.",
    },
  };

  const currentPath = location.pathname;
  const content = routeContent[currentPath] || {
    title: "Dashboard",
    description: "TrekDesk AI Admin Portal",
  };

  return (
    <header style={headerStyle}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "1.5rem" }}>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={menuButtonStyle}
            title="Open Sidebar"
          >
            <Menu size={20} color="var(--primary)" />
          </button>
        )}

        <div>
          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: 700,
              margin: 0,
              marginBottom: "8px",
              color: "white",
            }}
          >
            {content.title}
          </h1>
          <p
            style={{
              margin: 0,
              color: "var(--muted-foreground)",
              fontSize: "0.95rem",
            }}
          >
            {content.description}
          </p>
        </div>
      </div>
    </header>
  );
};

const headerStyle: React.CSSProperties = {
  position: "sticky",
  top: 0,
  zIndex: 40,
  padding: "1.5rem 2rem",
  margin: "0 -2rem", // Negative margin to counteract the Layout padding
  marginBottom: "1.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  backgroundColor: "rgba(10, 10, 12, 0.8)",
  backdropFilter: "blur(12px)",
  borderBottom: "5px solid rgba(255, 255, 255, 0.05)",
};

const menuButtonStyle: React.CSSProperties = {
  background: "rgba(16, 185, 129, 0.1)",
  border: "1px solid rgba(16, 185, 129, 0.2)",
  cursor: "pointer",
  padding: "0.6rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  marginTop: "4px",
  transition: "all 0.2s ease",
};

export default Header;
