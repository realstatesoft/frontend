import { useQuery } from '@tanstack/react-query';
import propertyService from '../services/propertyService';

export default function useAgentProperties(params = {}) {
  return useQuery({
    queryKey: ['agentProperties', params],
    queryFn: () => propertyService.getAll(params),
    staleTime: 1000 * 60 * 3,
    retry: 1,
    select: (response) => {
      // Handle paginated backend response: { data: { content: [...] } }
      const payload = response?.data;
      if (payload && payload.content) {
        return { ...response, data: payload.content };
      }
      return response;
    },
  });
}
