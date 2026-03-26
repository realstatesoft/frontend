import { useQuery } from '@tanstack/react-query';
import reportService from '../services/reportService';

export default function useReports() {
  return useQuery({
    queryKey: ['reportsSummary'],
    queryFn: reportService.getSummary,
    staleTime: 1000 * 60 * 10,
  });
}
