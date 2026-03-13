import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  MessageSquare,
  Database,
  Map as MapIcon,
  Code2,
  UserCircle,
  ChevronLeft,
} from "lucide-react";
import { useUIStore } from "../store/uiStore";

const Sidebar: React.FC = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

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

  return (
    <aside
      style={{
        ...sidebarStyle,
        transform: isSidebarOpen ? "translateX(0)" : "translateX(-100%)",
      }}
      className="glass"
    >
      <div style={{ ...logoContainerStyle, justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <div style={logoIconStyle}>TA</div>
          <h2 style={logoTextStyle}>
            TrekDesk <span style={{ color: "var(--primary)" }}>AI</span>
          </h2>
        </div>
        {isSidebarOpen && (
          <button
            onClick={toggleSidebar}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--muted-foreground)",
            }}
          >
            <ChevronLeft size={20} />
          </button>
        )}
      </div>

      <nav style={navStyle}>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              ...navItemStyle,
              backgroundColor: isActive
                ? "rgba(16, 185, 129, 0.1)"
                : "transparent",
              color: isActive ? "var(--primary)" : "var(--muted-foreground)",
              borderRight: isActive ? "2px solid var(--primary)" : "none",
            })}
          >
            {item.icon}
            <span style={{ marginLeft: "12px", fontWeight: 500 }}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / Upgrade Card removed as redundant for MVP */}
    </aside>
  );
};

const sidebarStyle: React.CSSProperties = {
  width: "260px",
  height: "100vh",
  position: "fixed",
  left: 0,
  top: 0,
  display: "flex",
  flexDirection: "column",
  padding: "1.5rem 0",
  zIndex: 100,
  transition: "transform 0.3s ease",
};

const logoContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "0 1.5rem",
  marginBottom: "2.5rem",
};

const logoIconStyle: React.CSSProperties = {
  width: "32px",
  height: "32px",
  borderRadius: "8px",
  backgroundColor: "var(--primary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "white",
  fontWeight: "bold",
  fontSize: "0.8rem",
  marginRight: "12px",
};

const logoTextStyle: React.CSSProperties = {
  fontSize: "1.25rem",
  fontWeight: 700,
  margin: 0,
};

const navStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  flex: 1,
};

const navItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "1rem 1.5rem",
  transition: "all 0.2s ease",
  fontSize: "0.95rem",
};

export default Sidebar;
