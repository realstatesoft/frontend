import { useQuery } from '@tanstack/react-query';
import conversionFunnelService from '../services/conversionFunnelService';

export default function useConversionFunnel(filters) {
  const enabled = Boolean(filters?.from && filters?.to);

  const summaryQuery = useQuery({
    queryKey: ['conversionFunnel', 'summary', filters],
    queryFn: () => conversionFunnelService.getSummary(filters),
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  const topQuery = useQuery({
    queryKey: ['conversionFunnel', 'topProperties', filters, filters?.topPage ?? 0],
    queryFn: () =>
      conversionFunnelService.getTopProperties(filters, filters.topPage ?? 0, filters.topSize ?? 10),
    enabled,
    staleTime: 1000 * 60 * 2,
  });

  return { summaryQuery, topQuery, enabled };
}
