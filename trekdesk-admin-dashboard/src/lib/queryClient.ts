/**
 * @file queryClient.ts
 * @description Singleton TanStack Query (React Query) client configuration.
 * This is the central cache and request manager for all server-state in the app.
 * It is instantiated once and injected at the root via `<QueryClientProvider>` in `main.tsx`.
 *
 * Architecture Note:
 * TanStack Query separates "server state" (API data) from "client state" (Zustand).
 * - API data (conversations, persona settings, etc.) → managed here via queries/mutations.
 * - Ephemeral UI state (sidebar open, theme) → managed in `uiStore.ts`.
 *
 * @see https://tanstack.com/query/latest
 */
import { QueryClient } from "@tanstack/react-query";

/**
 * Global QueryClient Instance
 * Configured with sensible production defaults that balance UX freshness
 * against unnecessary API traffic for a dashboard-style application.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * `refetchOnWindowFocus: false`
       * Disables the default behavior of re-fetching data when the browser
       * tab regains focus. In a dashboard context, this prevents jarring
       * UI refreshes mid-workflow. Data is kept fresh via `staleTime` instead.
       */
      refetchOnWindowFocus: false,

      /**
       * `retry: 1`
       * Limits automatic retries on failed requests to a single attempt.
       * This prevents a cascading loop of API calls when the backend is down
       * (e.g., during a deployment or network outage), while still handling
       * transient network blips gracefully.
       */
      retry: 1,

      /**
       * `staleTime: 5 minutes`
       * Data fetched from the API is considered "fresh" for 5 minutes.
       * Within this window, navigating between dashboard pages will use the
       * cached response rather than triggering a new network request.
       * After 5 minutes, the next component mount or focus event will
       * silently refetch in the background.
       */
      staleTime: 5 * 60 * 1000, // 300,000ms = 5 minutes
    },
  },
});
