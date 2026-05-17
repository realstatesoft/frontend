import { useInfiniteQuery } from "@tanstack/react-query";
import agentReviewsService from "../services/agents/agentReviewsService";

const PAGE_SIZE = 5;

/**
 * Hook de paginación infinita para las reseñas de un agente.
 *
 * @param {number|string} agentId
 * @param {{ sort?: string, size?: number }} options
 *   sort — parámetro de ordenamiento compatible con Spring Boot Pageable
 *          p. ej. "createdAt,desc" | "createdAt,asc" | "rating,desc" | "rating,asc"
 */
export default function useAgentReviews(
  agentId,
  { sort = "createdAt,desc", size = PAGE_SIZE } = {}
) {
  return useInfiniteQuery({
    queryKey: ["reviews", agentId, sort],
    queryFn: ({ pageParam = 0 }) =>
      agentReviewsService.getReviews(agentId, { page: pageParam, size, sort }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      // Soporta { data: { data: { content, number, last } } } y { data: { content, number, last } }
      const pageData = lastPage?.data?.data ?? lastPage?.data;
      if (!pageData || pageData.last) return undefined;
      return (pageData.number ?? 0) + 1;
    },
    enabled: Boolean(agentId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}
