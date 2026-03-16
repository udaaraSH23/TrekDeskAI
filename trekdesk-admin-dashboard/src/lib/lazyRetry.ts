import { type ComponentType, lazy } from "react";

/**
 * Wraps React.lazy to add a retry mechanism for dynamic imports.
 * This is useful for handling "Failed to fetch dynamically imported module" errors,
 * which often occur after a new deployment when old chunk hashes no longer exist.
 *
 * @param importFn - The dynamic import function (e.g., () => import('./MyComponent'))
 * @returns A lazy-loaded component with automatic retry/refresh logic.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const lazyRetry = <T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
) => {
  return lazy(async () => {
    try {
      return await importFn();
    } catch (error) {
      console.error("Dynamic import failed:", error);

      // Check if we already tried to refresh in this session to avoid infinite loops
      const hasRefreshed = sessionStorage.getItem("lazy-retry-refreshed");

      if (!hasRefreshed) {
        sessionStorage.setItem("lazy-retry-refreshed", "true");
        // Force a page reload to get the latest index.html and asset hashes
        window.location.reload();
        // Return a promise that never resolves while the page is reloading
        return new Promise(() => {}) as Promise<{ default: T }>;
      }

      // If we already refreshed and it still fails, bubble up the error
      throw error;
    }
  });
};
