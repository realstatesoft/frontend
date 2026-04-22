import { useQuery } from '@tanstack/react-query';
import propertyApi from '../services/properties/propertyApi';
import { useAuth } from './useAuth';

export default function useHasPublishedProperties() {
  const { isAuthenticated, user } = useAuth();
  const role = user?.role?.toUpperCase();
  const enabled = isAuthenticated && (role === 'USER' || role === 'AGENT');

  const { data } = useQuery({
    queryKey: ['hasPublishedProperties', user?.id],
    queryFn: () => propertyApi.getMe({ status: 'PUBLISHED', size: 1, page: 0 }),
    enabled,
    staleTime: 1000 * 60 * 5,
    select: (res) => (res?.data?.data?.page?.totalElements ?? 0) > 0,
  });

  return enabled ? (data ?? false) : false;
}
