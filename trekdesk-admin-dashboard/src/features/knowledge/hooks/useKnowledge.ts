/**
 * @file useKnowledge.ts
 * @description Centralized React hooks for knowledge base operations.
 * Leverages TanStack Query for caching, state management, and server synchronization.
 *
 * @module KnowledgeHooks
 * @category Hooks
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeService } from "../services/KnowledgeService";
import type {
  KnowledgeDocument,
  UpdateKnowledgePayload,
} from "../types/knowledge.types";

/**
 * Custom hook to perform a semantic similarity search over the knowledge base.
 * Automatically executes as the query parameter changes.
 *
 * @param query - The natural language search query.
 * @returns {UseQueryResult} TanStack Query result containing array of {@link KnowledgeSearchResult}.
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
 * Triggers re-indexing on the backend and invalidates global knowledge caches upon success.
 *
 * @returns {UseMutationResult} Mutation result for ingesting {@link KnowledgeDocument}.
 */
export const useIngestKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: KnowledgeDocument) => KnowledgeService.ingest(data),
    onSuccess: () => {
      // Invalidate all knowledge-related caches
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
};

/**
 * Custom hook to fetch a complete list of all vectorized knowledge chunks for the current tenant.
 *
 * @returns {UseQueryResult} TanStack Query result containing the full list of records.
 */
export const useAllKnowledge = () => {
  return useQuery({
    queryKey: ["knowledge", "all"],
    queryFn: () => KnowledgeService.listAll(),
  });
};

/**
 * Custom hook to update a knowledge chunk.
 * Refetches results to ensure UI reflects the newly embedded content.
 *
 * @returns {UseMutationResult} Mutation result for partial updates via {@link UpdateKnowledgePayload}.
 */
export const useUpdateKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      chunkId,
      payload,
    }: {
      chunkId: string;
      payload: UpdateKnowledgePayload;
    }) => KnowledgeService.updateKnowledge(chunkId, payload),
    onSuccess: () => {
      // Specifically invalidate search results as similarity scores may change
      queryClient.invalidateQueries({ queryKey: ["knowledge", "search"] });
      queryClient.invalidateQueries({ queryKey: ["knowledge", "all"] });
    },
  });
};

/**
 * Custom hook to delete a knowledge chunk from the vector store.
 *
 * @returns {UseMutationResult} Mutation result for removing a record by ID.
 */
export const useDeleteKnowledge = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chunkId: string) => KnowledgeService.deleteKnowledge(chunkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
};
