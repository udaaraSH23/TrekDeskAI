import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { KnowledgeService } from "../services/KnowledgeService";
import type {
  KnowledgeDocument,
  UpdateKnowledgePayload,
} from "../types/knowledge.types";

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
      queryClient.invalidateQueries({ queryKey: ["knowledge"] });
    },
  });
};

export const useAllKnowledge = () => {
  return useQuery({
    queryKey: ["knowledge", "all"],
    queryFn: () => KnowledgeService.listAll(),
  });
};

/**
 * Custom hook to update a knowledge chunk.
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
      queryClient.invalidateQueries({ queryKey: ["knowledge", "search"] });
    },
  });
};

/**
 * Custom hook to delete a knowledge chunk.
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
