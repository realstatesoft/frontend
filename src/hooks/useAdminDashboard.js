import { useQuery } from '@tanstack/react-query';
import adminService from '../services/adminService';

export default function useAdminDashboard() {
  return useQuery({
    queryKey: ['adminDashboard'],
    queryFn: adminService.getDashboardOverview,
    staleTime: 1000 * 60 * 2,
  });
}
