import React from "react";
import { useUIStore } from "../../store/uiStore";
import styles from "./GlobalLoading.module.css";

/**
 * Global Loading Overlay
 * Shows a premium, full-screen spinner when isLoading is true in the UI store.
 */
export const GlobalLoading: React.FC = () => {
  const isLoading = useUIStore((state) => state.isLoading);

  if (!isLoading) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.loader}>
        <div className={styles.spinner}></div>
        <p className={styles.text}>Processing...</p>
      </div>
    </div>
  );
};
