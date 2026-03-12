import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useUIStore } from "../store/uiStore";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div style={layoutContainerStyle}>
      <Sidebar />
      <div
        style={{
          ...mainContentStyle,
          marginLeft: isSidebarOpen ? "260px" : "0",
        }}
      >
        <Header />
        <main style={mainInnerStyle}>{children}</main>
      </div>
    </div>
  );
};

const layoutContainerStyle: React.CSSProperties = {
  display: "flex",
  minHeight: "100vh",
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  transition: "margin-left 0.3s ease",
};

const mainInnerStyle: React.CSSProperties = {
  padding: "2rem",
  flex: 1,
};

export default Layout;
