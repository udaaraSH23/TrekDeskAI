/**
 * @file Modal.tsx
 * @description A high-order dialog component used for overlays, task-focused flows, and complex secondary interactions.
 *
 * @module UIComponents
 * @category Components
 */

import React, { useEffect } from "react";
import { X } from "lucide-react";
import styles from "./Modal.module.css";

/**
 * Props for the Modal component.
 */
interface ModalProps {
  /** If true, the modal is rendered into the DOM. */
  isOpen: boolean;

  /** Callback triggered when the modal requests to close (via overlay click or 'X' button). */
  onClose: () => void;

  /** The semantic header title displayed at the top of the modal. */
  title: string;

  /** The main payload content of the dialog. */
  children: React.ReactNode;
}

/**
 * Modal Component
 *
 * Provides a focus-trapped overlay environment.
 * Automatically handles body scroll-locking and keyboard 'Escape' listeners
 * for optimal accessibility.
 *
 * @component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      // Prevent background scrolling while the modal is active
      document.body.style.overflow = "hidden";
      // Listen for the escape key to facilitate easy closing
      window.addEventListener("keydown", handleEscape);
    }

    return () => {
      // Re-enable scrolling and cleanup listeners on unmount
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={(e) => e.stopPropagation()}>
        <header className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};
