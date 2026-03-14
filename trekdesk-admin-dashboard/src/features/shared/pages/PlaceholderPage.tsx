import React from "react";
import styles from "./PlaceholderPage.module.css";

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>
        This module is currently being optimized for high-volume lead handling.
      </p>

      <div className={styles.placeholderCard}>
        <p className={styles.placeholderText}>
          Section: {title} - coming soon in Phase 4 build.
        </p>
      </div>
    </div>
  );
};

export default PlaceholderPage;
