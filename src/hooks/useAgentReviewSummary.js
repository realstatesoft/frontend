import { useQuery } from "@tanstack/react-query";
import agentReviewsService from "../services/agents/agentReviewsService";

/**
 * Obtiene el resumen de ratings de un agente (avgRating, totalReviews, distribución).
 * Query key: ["summary", agentId] — compatible con las invalidaciones de ReviewForm y ReviewList.
 */
export default function useAgentReviewSummary(agentId) {
  return useQuery({
    queryKey: ["summary", agentId],
    queryFn: () => agentReviewsService.getSummary(agentId),
    enabled: Boolean(agentId),
    staleTime: 1000 * 60 * 3,
    retry: 1,
  });
}
