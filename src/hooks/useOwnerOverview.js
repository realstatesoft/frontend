import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';

export default function useOwnerOverview() {
  return useQuery({
    queryKey: ['ownerOverview'],
    queryFn: ownerService.getOverview,
    staleTime: 1000 * 60 * 5,
  });
}
