/**
 * @file uiStore.ts
 * @description Global UI state store for the TrekDesk AI Admin Dashboard.
 * Manages ephemeral interface state such as sidebar visibility and theming.
 * Built with Zustand — a lightweight, hook-based state management library.
 *
 * @see https://github.com/pmndrs/zustand
 */
import { create } from "zustand";

/**
 * Defined shape of the global UI state and its mutating actions.
 */
interface UIState {
  /** Whether the navigation sidebar is currently expanded (visible). */
  isSidebarOpen: boolean;

  /** The active color theme mode. Defaults to "dark". */
  theme: "light" | "dark";

  /**
   * Toggles the sidebar between open and closed states.
   */
  toggleSidebar: () => void;

  /**
   * Sets the active application theme.
   * @param theme - The target theme: "light" or "dark".
   */
  setTheme: (theme: "light" | "dark") => void;
}

/**
 * Zustand store hook for global UI state management.
 * Can be consumed directly in any component without wrapping in a Provider.
 *
 * @example
 * ```ts
 * const { isSidebarOpen, toggleSidebar } = useUIStore();
 * ```
 */
export const useUIStore = create<UIState>((set) => ({
  // Default: sidebar open for immediate navigation visibility on load
  isSidebarOpen: true,

  // Default: dark mode — the TrekDesk AI dashboard is a native dark-mode interface
  theme: "dark",

  /**
   * Inverts the current sidebar visibility state.
   * Uses the functional form of `set` to safely access the latest state
   * without stale closure risks.
   */
  toggleSidebar: () =>
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),

  /**
   * Replaces the theme value directly.
   * Direct assignment is safe here since there is no dependency on prior state.
   */
  setTheme: (theme) => set({ theme }),
}));
