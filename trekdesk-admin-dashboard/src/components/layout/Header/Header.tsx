import { useLocation } from "react-router-dom";
import { Menu } from "lucide-react";
import { useUIStore } from "../../../store/uiStore";

import styles from "./Header.module.css";

/**
 * Header Component
 * Now serves as the dynamic Page Header, showing the title and description
 * for the current route, as well as the sidebar toggle when hidden.
 */
const Header = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);
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
    "/debugger": {
      title: "AI Debugger",
      description: "Test and troubleshoot AI interactions with live traces.",
    },
  };

  const currentPath = location.pathname;
  const content = routeContent[currentPath] || {
    title: "Dashboard",
    description: "TrekDesk AI Admin Portal",
  };

  return (
    <header className={styles.header}>
      <div className={styles.contentWrapper}>
        {!isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className={styles.menuButton}
            title="Open Sidebar"
          >
            <Menu size={20} color="var(--primary)" />
          </button>
        )}

        <div>
          <h1 className={styles.title}>{content.title}</h1>
          <p className={styles.description}>{content.description}</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
