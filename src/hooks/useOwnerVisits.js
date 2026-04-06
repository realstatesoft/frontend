import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';

export default function useOwnerVisits() {
  return useQuery({
    queryKey: ['ownerVisits'],
    queryFn: ownerService.getVisitRequests,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
