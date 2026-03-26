import { useQuery } from '@tanstack/react-query';
import appointmentService from '../services/appointmentService';

export default function useAppointments(params = {}) {
  return useQuery({
    queryKey: ['agent-agenda', params],
    queryFn: () => appointmentService.getAll(params),
    staleTime: 1000 * 60 * 2,
    select: (response) => {
      const items = response?.data;
      if (Array.isArray(items) && items.length > 0 && items[0].startsAt) {
        return {
          ...response,
          data: items.map((e) => ({
            id: e.id,
            title: e.title,
            clientName: e.clientName || '',
            date: e.startsAt,
            type: (e.eventType || 'OTHER').toLowerCase(),
          })),
        };
      }
      return response;
    },
  });
}
