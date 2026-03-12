# Hooks Reference

Custom hooks in `src/hooks/` are thin wrappers around **TanStack Query** (`useQuery` / `useMutation`). They bridge the service layer and the component layer — components never call services directly.

Each hook:

- Defines a stable **query key** for caching
- Delegates to a service function for the actual HTTP call
- Returns the full TanStack Query result object (data, isLoading, error, mutate, etc.)

---

## useAnalytics.ts

### `useAnalyticsStats()`

Fetches aggregate call statistics for the dashboard Overview card.

|               |                               |
| ------------- | ----------------------------- |
| **Query key** | `["analytics", "stats"]`      |
| **Service**   | `AnalyticsService.getStats()` |
| **Returns**   | `UseQueryResult<CallStats>`   |

```tsx
const { data: stats, isLoading, error } = useAnalyticsStats();
// data: { total_calls, avg_duration_seconds, avg_sentiment_score, calls_today, calls_this_week }
```

---

### `useCallLogs()`

Fetches the full list of call logs for the Conversations page.

|               |                                  |
| ------------- | -------------------------------- |
| **Query key** | `["analytics", "logs"]`          |
| **Service**   | `AnalyticsService.getCallLogs()` |
| **Returns**   | `UseQueryResult<CallLog[]>`      |

```tsx
const { data: logs, isLoading } = useCallLogs();
```

---

### `useCallLogDetails(id)`

Fetches a single call log with its full conversation transcript.

|               |                                                       |
| ------------- | ----------------------------------------------------- |
| **Query key** | `["analytics", "logs", id]`                           |
| **Service**   | `AnalyticsService.getCallDetail(id)`                  |
| **Returns**   | `UseQueryResult<CallLog>`                             |
| **Note**      | Disabled (`enabled: false`) when `id` is empty string |

```tsx
const { data: log } = useCallLogDetails(selectedId);
// data.transcript → TranscriptMessage[]
```

---

## usePersona.ts

### `usePersonaSettings()`

Fetches the current AI persona configuration.

|               |                                   |
| ------------- | --------------------------------- |
| **Query key** | `["persona", "settings"]`         |
| **Service**   | `PersonaService.getSettings()`    |
| **Returns**   | `UseQueryResult<PersonaSettings>` |

```tsx
const { data: settings, isLoading } = usePersonaSettings();
```

---

### `useUpdatePersonaSettings()`

Sends a PATCH request to update persona settings. On success, updates the query cache directly (no refetch needed).

|                 |                                                                      |
| --------------- | -------------------------------------------------------------------- |
| **Mutation fn** | `PersonaService.updateSettings(settings)`                            |
| **On success**  | `queryClient.setQueryData(["persona", "settings"], updatedSettings)` |
| **Returns**     | `UseMutationResult<PersonaSettings, Error, PersonaSettings>`         |

```tsx
const updatePersona = useUpdatePersonaSettings();

const handleSave = (formValues: PersonaSettings) => {
  updatePersona.mutate(formValues, {
    onError: (err) => setError(err.message),
  });
};
```

---

## useKnowledge.ts

### `useKnowledgeSearch(query)`

Performs a semantic search over the knowledge base.

|               |                                           |
| ------------- | ----------------------------------------- |
| **Query key** | `["knowledge", "search", query]`          |
| **Service**   | `KnowledgeService.search(query)`          |
| **Returns**   | `UseQueryResult<KnowledgeSearchResult[]>` |
| **Note**      | Disabled when `query` is empty string     |

```tsx
const { data: results } = useKnowledgeSearch(searchTerm);
// Only fires when searchTerm is non-empty
```

---

### `useIngestKnowledge()`

Ingests a document chunk into the knowledge base. Invalidates search queries on success so future searches reflect new content.

|                 |                                                                        |
| --------------- | ---------------------------------------------------------------------- |
| **Mutation fn** | `KnowledgeService.ingest(data)`                                        |
| **On success**  | `queryClient.invalidateQueries({ queryKey: ["knowledge", "search"] })` |
| **Returns**     | `UseMutationResult<{ message: string }, Error, KnowledgeDocument>`     |

```tsx
const ingest = useIngestKnowledge();

ingest.mutate({
  content: "Knuckles Forest Trail is a Grade 3 trail...",
  trek_id: "some-uuid",
  metadata: { source: "brochure" },
});
```

---

## useTours.ts

### `useTours()`

Fetches all tours for the authenticated tenant.

|               |                          |
| ------------- | ------------------------ |
| **Query key** | `["tours"]`              |
| **Service**   | `TourService.getTours()` |
| **Returns**   | `UseQueryResult<Trek[]>` |

---

### `useTour(id)`

Fetches a single tour by ID.

|               |                               |
| ------------- | ----------------------------- |
| **Query key** | `["tours", id]`               |
| **Service**   | `TourService.getTourById(id)` |
| **Returns**   | `UseQueryResult<Trek>`        |
| **Note**      | Disabled when `id` is empty   |

---

### `useCreateTour()`

Creates a new tour. Invalidates the tours list cache on success.

|                 |                                                          |
| --------------- | -------------------------------------------------------- |
| **Mutation fn** | `TourService.createTour(payload)`                        |
| **On success**  | `queryClient.invalidateQueries({ queryKey: ["tours"] })` |
| **Returns**     | `UseMutationResult<Trek, Error, CreateTrekPayload>`      |

---

### `useUpdateTour()`

Updates an existing tour. Invalidates the list and updates the individual tour in cache.

|                 |                                                                       |
| --------------- | --------------------------------------------------------------------- |
| **Mutation fn** | `TourService.updateTour(id, tour)`                                    |
| **On success**  | Invalidates `["tours"]`; sets `["tours", id]` directly                |
| **Input shape** | `{ id: string; tour: Partial<Trek> }`                                 |
| **Returns**     | `UseMutationResult<Trek, Error, { id: string; tour: Partial<Trek> }>` |

---

### `useDeleteTour()`

Deletes a tour. Invalidates the tours list cache.

|                 |                                                          |
| --------------- | -------------------------------------------------------- |
| **Mutation fn** | `TourService.deleteTour(id)`                             |
| **On success**  | `queryClient.invalidateQueries({ queryKey: ["tours"] })` |
| **Returns**     | `UseMutationResult<void, Error, string>`                 |
