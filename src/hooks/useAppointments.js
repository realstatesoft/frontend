import { useQuery } from '@tanstack/react-query';
import appointmentService from '../services/appointmentService';

export default function useAppointments(params = {}) {
  return useQuery({
    queryKey: ['agent-agenda', params],
    queryFn: () => appointmentService.getAll(params),
    staleTime: 1000 * 60 * 2,
    select: (response) => {
      const items = response?.data;
      if (Array.isArray(items)) {
        return {
          ...response,
          data: items.map((e) => ({
            id: e.id,
            title: e.title || e.name || '',
            clientName: e.clientName || '',
            date: e.startsAt ?? e.date ?? null,
            type: (e.eventType || e.type || 'OTHER').toLowerCase(),
          })),
        };
      }
      return response;
    },
  });
}
