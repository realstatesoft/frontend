import { useQuery } from "@tanstack/react-query";
import { getMyAgents } from "../services/myAgentsApi";

export function useMyAgents(params = {}) {
  return useQuery({
    queryKey: ["my-agents", params],
    queryFn: () => getMyAgents(params),
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export default useMyAgents;
