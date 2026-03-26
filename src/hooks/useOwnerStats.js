import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';

export default function useOwnerStats() {
  return useQuery({
    queryKey: ['ownerStats'],
    queryFn: ownerService.getStats,
    staleTime: 1000 * 60 * 5,
  });
}
