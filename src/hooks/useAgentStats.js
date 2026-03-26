import { useQuery } from '@tanstack/react-query';
import agentService from '../services/agentService';

export default function useAgentStats() {
  return useQuery({
    queryKey: ['agentStats'],
    queryFn: agentService.getStats,
    staleTime: 1000 * 60 * 5,
  });
}
