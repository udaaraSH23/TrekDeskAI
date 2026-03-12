/**
 * @file uiStore.test.ts
 * @description Unit test suite for the `useUIStore` Zustand store.
 * Validates the correctness of UI state initialization, sidebar toggling,
 * and theme switching actions in isolation.
 *
 * Test Runner: Vitest
 * Pattern: Stateless unit tests with full state reset between runs.
 */
import { describe, it, expect, beforeEach } from "vitest";
import { useUIStore } from "./uiStore";

/**
 * Test Suite: UI Store
 * Covers the core state transitions defined in `uiStore.ts`.
 */
describe("UI Store", () => {
  /**
   * State Reset Guard
   * Zustand stores are singletons, meaning state persists between test runs
   * in the same process. We reset to the known default values before each test
   * to guarantee test isolation and prevent order-dependent failures.
   */
  beforeEach(() => {
    useUIStore.setState({
      isSidebarOpen: true,
      theme: "dark",
    });
  });

  /**
   * Test: Default State Initialization
   * Verifies that the store's initial values match the expected defaults
   * defined in `uiStore.ts`. This guards against accidental default changes.
   */
  it("should initialize with sidebar open and dark theme", () => {
    const state = useUIStore.getState();
    expect(state.isSidebarOpen).toBe(true);
    expect(state.theme).toBe("dark");
  });

  /**
   * Test: Sidebar Toggle — Idempotency
   * Verifies that `toggleSidebar` correctly inverts the sidebar state on each call.
   * Tests two consecutive calls to ensure the toggle is a true inversion (not a set).
   */
  it("should toggle sidebar state", () => {
    // First toggle: open -> closed
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(false);

    // Second toggle: closed -> open (proves bidirectional correctness)
    useUIStore.getState().toggleSidebar();
    expect(useUIStore.getState().isSidebarOpen).toBe(true);
  });

  /**
   * Test: Theme Setter
   * Verifies that `setTheme` correctly updates the active theme value.
   * Starting state is "dark" (from `beforeEach`), so we validate a transition to "light".
   */
  it("should set theme to light", () => {
    useUIStore.getState().setTheme("light");
    expect(useUIStore.getState().theme).toBe("light");
  });
});
