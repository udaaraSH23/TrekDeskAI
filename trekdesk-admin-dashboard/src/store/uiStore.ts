/**
 * @file uiStore.ts
 * @description Global UI state store for the TrekDesk AI Admin Dashboard.
 * Manages ephemeral interface state such as sidebar visibility, theming, and notifications.
 * Built with Zustand — a lightweight, hook-based state management library.
 *
 * @see https://github.com/pmndrs/zustand
 */
import { create } from "zustand";

/**
 * Severity levels for toast notifications.
 */
export type NotificationType = "success" | "error" | "info" | "warning";

/**
 * Shape of a single toast notification.
 */
export interface Notification {
  /** Unique ID for the notification. */
  id: string;
  /** Human-readable message to display. */
  message: string;
  /** Visual style/urgency of the message. */
  type: NotificationType;
  /** Optional duration in milliseconds after which the toast disappears. */
  duration?: number;
}

/**
 * Defined shape of the global UI state and its mutating actions.
 */
interface UIState {
  /** Whether the navigation sidebar is currently expanded (visible). */
  isSidebarOpen: boolean;

  /** The active color theme mode. Defaults to "dark". */
  theme: "light" | "dark";

  /** Active stack of global notifications/toasts. */
  notifications: Notification[];

  /** Whether a full-screen global loading overlay is visible. */
  isLoading: boolean;

  /** State for the global confirmation dialog. */
  confirmModal: {
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    onConfirm: () => void | Promise<void>;
    type?: "danger" | "info";
  };

  /** Toggles the sidebar between open and closed states. */
  toggleSidebar: () => void;

  /** Sets the active application theme. */
  setTheme: (theme: "light" | "dark") => void;

  /** Controls the global loading overlay. */
  setLoading: (isLoading: boolean) => void;

  /** Opens the global confirmation modal. */
  confirm: (options: Omit<UIState["confirmModal"], "isOpen">) => void;

  /** Closes the global confirmation modal. */
  closeConfirm: () => void;

  /**
   * Pushes a new notification to the global stack.
   * Auto-generates an ID if not provided.
   */
  addNotification: (
    notification: Omit<Notification, "id"> & { id?: string },
  ) => void;

  /** Removes a specific notification by its ID. */
  removeNotification: (id: string) => void;
}

/**
 * Zustand store hook for global UI state management.
 * Can be consumed directly in any component or outside React via `useUIStore.getState()`.
 */
export const useUIStore = create<UIState>((set) => ({
  isSidebarOpen: true,
  theme: "dark",
  notifications: [],
  isLoading: false,
  confirmModal: {
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "info",
  },

  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  setTheme: (theme) => set({ theme }),

  setLoading: (isLoading) => set({ isLoading }),

  confirm: (options) =>
    set({
      confirmModal: {
        ...options,
        isOpen: true,
      },
    }),

  closeConfirm: () =>
    set((state) => ({
      confirmModal: { ...state.confirmModal, isOpen: false },
    })),

  addNotification: (notification) => {
    const id = notification.id || Math.random().toString(36).substring(2, 9);
    const duration = notification.duration || 5000;

    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id, duration },
      ],
    }));

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, duration);
    }
  },

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
