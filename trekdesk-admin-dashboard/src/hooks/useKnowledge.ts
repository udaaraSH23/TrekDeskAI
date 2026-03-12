import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeService } from "../services/KnowledgeService";
import type { KnowledgeDocument } from "../types/knowledge.types";

/**
 * Custom hook to perform a semantic similarity search over the knowledge base.
 * @param query - The natural language search query.
 * @returns {UseQueryResult} TanStack Query result containing the search results.
 */
export const useKnowledgeSearch = (query: string) => {
  return useQuery({
    queryKey: ["knowledge", "search", query],
    queryFn: () => KnowledgeService.search(query),
    enabled: !!query,
  });
};

/**
 * Custom hook to ingest a new document chunk into the knowledge base.
 * Automatically invalidates active search queries on success.
 * @returns {UseMutationResult} TanStack Query mutation result.
 */
export const useIngestKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KnowledgeDocument) => KnowledgeService.ingest(data),
    onSuccess: () => {
      // Invalidate existing search queries to fetch new data
      queryClient.invalidateQueries({ queryKey: ["knowledge", "search"] });
    },
  });
};
