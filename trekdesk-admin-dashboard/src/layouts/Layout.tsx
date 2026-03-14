import React from "react";
import Header from "../components/layout/Header/Header";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import { useUIStore } from "../store/uiStore";

import styles from "./Layout.module.css";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarOpen } = useUIStore();

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div
        className={styles.mainContent}
        style={{
          marginLeft: isSidebarOpen ? "260px" : "0",
        }}
      >
        <Header />
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
};

export default Layout;
