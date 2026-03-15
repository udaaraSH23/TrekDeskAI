import React from "react";
import { useUIStore } from "../../store/uiStore";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";
import { AlertTriangle, Info, X } from "lucide-react";
import styles from "./ConfirmModal.module.css";

/**
 * Global Confirmation Modal
 * Consumes state from useUIStore to show standardized 'Are you sure?' prompts.
 */
export const ConfirmModal: React.FC = () => {
  const confirmModal = useUIStore((state) => state.confirmModal);
  const closeConfirm = useUIStore((state) => state.closeConfirm);

  const { isOpen, title, message, confirmLabel, cancelLabel, onConfirm, type } =
    confirmModal;

  if (!isOpen) return null;

  const handleConfirm = async () => {
    await onConfirm();
    closeConfirm();
  };

  return (
    <div className={styles.overlay}>
      <Card className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.titleArea}>
            {type === "danger" ? (
              <AlertTriangle className={styles.dangerIcon} size={20} />
            ) : (
              <Info className={styles.infoIcon} size={20} />
            )}
            <h3 className={styles.title}>{title}</h3>
          </div>
          <button className={styles.closeBtn} onClick={closeConfirm}>
            <X size={18} />
          </button>
        </div>

        <div className={styles.content}>
          <p className={styles.message}>{message}</p>
        </div>

        <div className={styles.footer}>
          <Button variant="ghost" onClick={closeConfirm}>
            {cancelLabel || "Cancel"}
          </Button>
          <Button
            variant={type === "danger" ? "danger" : "primary"}
            onClick={handleConfirm}
          >
            {confirmLabel || "Confirm"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
