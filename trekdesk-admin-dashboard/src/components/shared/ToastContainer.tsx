import React from "react";
import { useUIStore } from "../../store/uiStore";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import styles from "./ToastContainer.module.css";

const icons = {
  success: <CheckCircle size={20} className={styles.successIcon} />,
  error: <AlertCircle size={20} className={styles.errorIcon} />,
  info: <Info size={20} className={styles.infoIcon} />,
  warning: <AlertTriangle size={20} className={styles.warningIcon} />,
};

export const ToastContainer: React.FC = () => {
  const notifications = useUIStore((state) => state.notifications);
  const removeNotification = useUIStore((state) => state.removeNotification);

  if (notifications.length === 0) return null;

  return (
    <div className={styles.container}>
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${styles.toast} ${styles[notification.type]}`}
        >
          <div className={styles.icon}>{icons[notification.type]}</div>
          <div className={styles.message}>{notification.message}</div>
          <button
            className={styles.closeButton}
            onClick={() => removeNotification(notification.id)}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
};
