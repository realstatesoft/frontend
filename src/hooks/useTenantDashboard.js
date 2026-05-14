import { useState } from 'react';
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
  const [page, setPage] = useState(0);

  const query = useQuery({
    queryKey: ['tenantLease', page],
    queryFn: () => tenantService.getLease(page),
    staleTime: 1000 * 60 * 5,
  });

  return { ...query, page, setPage };
}

export function useTenantLeaseById(id) {
  return useQuery({
    queryKey: ['tenantLease', id],
    queryFn: () => tenantService.getLeaseById(id),
    staleTime: 1000 * 60 * 5,
    enabled: !!id,
  });
}
