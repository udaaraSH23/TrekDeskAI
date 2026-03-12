import { Bell, Search, User, Menu } from "lucide-react";
import { useUIStore } from "../store/uiStore";

const Header = () => {
  const { isSidebarOpen, toggleSidebar } = useUIStore();

  return (
    <header style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {!isSidebarOpen && (
          <button onClick={toggleSidebar} style={menuButtonStyle}>
            <Menu size={20} color="var(--muted-foreground)" />
          </button>
        )}
        <div style={searchContainerStyle}>
          <Search size={18} color="var(--muted-foreground)" />
          <input
            type="text"
            placeholder="Search for leads, calls..."
            style={inputStyle}
          />
        </div>

        <div style={actionsStyle}>
          <div style={iconButtonStyle}>
            <Bell size={20} />
            <div style={badgeStyle}></div>
          </div>

          <div style={profileStyle}>
            <div style={profileInfoStyle}>
              <p style={{ fontSize: "0.85rem", fontWeight: 600 }}>
                Kandy Treks Admin
              </p>
              <p
                style={{
                  fontSize: "0.75rem",
                  color: "var(--muted-foreground)",
                }}
              >
                Admin Account
              </p>
            </div>
            <div style={avatarStyle}>
              <User size={20} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

const headerStyle: React.CSSProperties = {
  height: "70px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 2rem",
  backgroundColor: "transparent",
  borderBottom: "1px solid var(--border)",
  position: "sticky",
  top: 0,
  zIndex: 90,
  backdropFilter: "blur(8px)",
};

const searchContainerStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  backgroundColor: "var(--card)",
  padding: "0.6rem 1rem",
  borderRadius: "10px",
  border: "1px solid var(--border)",
  width: "320px",
};

const inputStyle: React.CSSProperties = {
  background: "transparent",
  border: "none",
  outline: "none",
  color: "white",
  marginLeft: "10px",
  width: "100%",
  fontSize: "0.9rem",
};

const actionsStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1.5rem",
};

const iconButtonStyle: React.CSSProperties = {
  position: "relative",
  cursor: "pointer",
  color: "var(--muted-foreground)",
};

const badgeStyle: React.CSSProperties = {
  position: "absolute",
  top: "-2px",
  right: "-2px",
  width: "8px",
  height: "8px",
  backgroundColor: "var(--destructive)",
  borderRadius: "50%",
  border: "2px solid var(--background)",
};

const profileStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  cursor: "pointer",
};

const profileInfoStyle: React.CSSProperties = {
  textAlign: "right",
};

const avatarStyle: React.CSSProperties = {
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  backgroundColor: "var(--secondary)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--border)",
};

const menuButtonStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "0.5rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "8px",
};
Menu.displayName = "Menu";

export default Header;
