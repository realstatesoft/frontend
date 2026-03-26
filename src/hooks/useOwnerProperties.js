import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';

export default function useOwnerProperties() {
  return useQuery({
    queryKey: ['ownerProperties'],
    queryFn: ownerService.getMyProperties,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
