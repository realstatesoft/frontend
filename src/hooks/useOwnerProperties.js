import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';
import { useAuth } from './useAuth';

export default function useOwnerProperties() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['ownerProperties', user?.id],
    queryFn: ownerService.getMyProperties,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
