import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAgents, searchAgents, getClients } from '../services/api';
import { useAuth } from './useAuth';

export function useAgents(search = '') {
  return useQuery({
    queryKey: ['agents', search],
    queryFn: () => search ? searchAgents(search) : getAgents(0, 20),
    staleTime: 1000 * 60 * 5,
  });
}

export function useClients() {
  return useQuery({
    queryKey: ['clients'],
    queryFn: () => getClients(0, 50),
    staleTime: 1000 * 60 * 5,
    enabled: false,
  });
}

export function useContacts() {
  const { user } = useAuth();
  const role = user?.role;
  
  const isAgent = role === 'AGENT';
  const isAdmin = role === 'ADMIN';
  const isUser = role === 'USER';
  
  return useMemo(() => ({
    isAgent,
    isAdmin,
    isUser,
    canSeeAgents: isUser || isAdmin,
    canSeeClients: isAgent,
  }), [role]);
}