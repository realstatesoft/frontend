import { useQuery } from '@tanstack/react-query';
import clientService from '../services/clientService';

export default function useAgentClients(params = {}) {
  return useQuery({
    queryKey: ['agentClients', params],
    queryFn: () => clientService.getAll(params),
    staleTime: 1000 * 60 * 3,
    select: (response) => {
      const payload = response?.data;
      if (payload && payload.content) {
        const mapped = payload.content.map((c) => ({
          ...c,
          name: c.userName,
          email: c.userEmail,
          phone: c.userPhone,
          registeredAt: c.createdAt,
        }));
        return { ...response, data: mapped };
      }
      return response;
    },
  });
}
