import { useQuery } from '@tanstack/react-query';
import tenantService from '../services/tenantService';

export function useTenantDashboard() {
  return useQuery({
    queryKey: ['tenantDashboard'],
    queryFn: tenantService.getDashboard,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenantLease() {
  return useQuery({
    queryKey: ['tenantLease'],
    queryFn: tenantService.getLease,
    staleTime: 1000 * 60 * 5,
  });
}

export function useTenantLeaseById(id) {
  return useQuery({
    queryKey: ['tenantLease', id],
    queryFn: () => tenantService.getLeaseById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
