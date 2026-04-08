import { useQuery } from '@tanstack/react-query';
import ownerService from '../services/ownerService';

export default function useOwnerMessages() {
  return useQuery({
    queryKey: ['ownerMessages'],
    queryFn: ownerService.getMessages,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
