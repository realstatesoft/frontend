import { useQuery } from '@tanstack/react-query';
import salesService from '../services/salesService';

export function useSales(params = {}) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => salesService.getAll(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useSalesSummary() {
  return useQuery({
    queryKey: ['salesSummary'],
    queryFn: salesService.getSummary,
    staleTime: 1000 * 60 * 5,
  });
}
