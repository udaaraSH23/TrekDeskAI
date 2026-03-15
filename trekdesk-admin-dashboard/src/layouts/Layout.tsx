/**
 * @file Layout.tsx
 * @description Root layout shell for the administrative dashboard.
 * Orchestrates the relationship between global navigation (Sidebar/Header) and the main viewport.
 *
 * @module Layout
 * @category Containers
 */

import React from "react";
import Header from "../components/layout/Header/Header";
import Sidebar from "../components/layout/Sidebar/Sidebar";
import { useUIStore } from "../store/uiStore";

import styles from "./Layout.module.css";

/**
 * Props for the main Layout component.
 */
interface LayoutProps {
  /** The specific page content to be wrapped by the global Navigation elements. */
  children: React.ReactNode;
}

/**
 * Layout Component
 *
 * Provides the core structural grid of the application.
 * It dynamically adjusts the main content offset based on the 'collapsible'
 * state of the sidebar to maintain a fluid, responsive user experience.
 *
 * @component
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  /**
   * Tracks the global sidebar visibility from the UI store.
   * This is used to adjust the left margin of the main content area.
   */
  const isSidebarOpen = useUIStore((state) => state.isSidebarOpen);

  return (
    <div className={styles.layoutContainer}>
      <Sidebar />
      <div
        className={styles.mainContent}
        style={{
          // Dynamic calculation for sidebar space allocation
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
