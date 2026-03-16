import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Map as MapIcon,
  Code2,
  UserCircle,
  ChevronLeft,
  Wrench,
} from "lucide-react";
import { useUIStore } from "../../../store/uiStore";

import styles from "./Sidebar.module.css";

const Sidebar: React.FC = () => {
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: "Overview", path: "/" },
    {
      icon: <MessageSquare size={20} />,
      label: "Conversations",
      path: "/conversations",
    },
    {
      icon: <Database size={20} />,
      label: "Knowledge Base",
      path: "/knowledge",
    },
    { icon: <UserCircle size={20} />, label: "AI Persona", path: "/persona" },
    { icon: <MapIcon size={20} />, label: "Tours & Treks", path: "/tours" },
    { icon: <Code2 size={20} />, label: "Widget Config", path: "/widget" },
  ];

  // Only show Diagnostic Tools if dev features are enabled
  if (import.meta.env.VITE_ENABLE_DEV_LOGIN === "true") {
    navItems.push({
      icon: <Wrench size={20} />,
      label: "Diagnostic Tools",
      path: "/debugger",
    });
  }

  return (
    <aside
      className={styles.sidebar}
      style={{
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
      }}
    >
      <div
        className={styles.logoContainer}
        style={{ justifyContent: "space-between" }}
      >
        <div className="flex items-center">
          <div className={styles.logoIcon}>TA</div>
          <h2 className={styles.logoText}>
            TrekDesk <span style={{ color: "var(--primary)" }}>AI</span>
          </h2>
        </div>
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            className={styles.closeButton}
            title="Close Sidebar"
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      <nav className={styles.nav}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.activeNavItem : ""}`
            }
          >
            {item.icon}
            <span className={styles.navLabel}>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
