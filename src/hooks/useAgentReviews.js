import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useAuth } from "./useAuth";
import {
  getReviews,
  getReviewSummary,
  getMyReview,
} from "../services/agentReviewsService";

const PAGE_SIZE = 5;

/**
 * Hook de paginacion infinita para las resenas de un agente.
 */
export function useAgentReviews(
  agentId,
  { sort = "createdAt,desc", rating, size = PAGE_SIZE } = {}
) {
  return useInfiniteQuery({
    queryKey: ["agent-reviews", agentId, sort, rating, size],
    queryFn: ({ pageParam = 0 }) => getReviews(agentId, pageParam, size, { sort, rating }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      const hasNoNextPage =
        lastPage?.hasNextPage === false || lastPage?.last === true;
      if (hasNoNextPage) return undefined;
      return (lastPage?.pageNumber ?? lastPage?.number ?? 0) + 1;
    },
    enabled: Boolean(agentId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useAgentReviewSummary(agentId) {
  return useQuery({
    queryKey: ["agent-review-summary", agentId],
    queryFn: () => getReviewSummary(agentId),
    enabled: Boolean(agentId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useMyAgentReview(agentId) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: ["my-agent-review", agentId],
    queryFn: () => getMyReview(agentId),
    enabled: Boolean(agentId && isAuthenticated),
    initialData: null,
    retry: false,
  });
}

export default useAgentReviews;
