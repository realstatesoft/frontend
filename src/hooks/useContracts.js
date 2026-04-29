import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import contractApi from '../services/contracts/contractApi';

export function useContractsAsListingAgent(enabled = true) {
  return useQuery({
    queryKey: ['contracts', 'listing-agent'],
    queryFn: contractApi.getAsListingAgent,
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}

export function useContractsAsBuyerAgent() {
  return useQuery({
    queryKey: ['contracts', 'buyer-agent'],
    queryFn: contractApi.getAsBuyerAgent,
    staleTime: 1000 * 60 * 3,
  });
}

export function useContractsAsSeller(enabled = true) {
  return useQuery({
    queryKey: ['contracts', 'as-seller'],
    queryFn: contractApi.getAsSeller,
    enabled,
    staleTime: 1000 * 60 * 3,
  });
}

export function useContractsAsBuyer() {
  return useQuery({
    queryKey: ['contracts', 'as-buyer'],
    queryFn: contractApi.getAsBuyer,
    staleTime: 1000 * 60 * 3,
  });
}

export function useContractDetail(id) {
  return useQuery({
    queryKey: ['contracts', 'detail', id],
    queryFn: () => contractApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useContractSignatures(id) {
  return useQuery({
    queryKey: ['contracts', 'signatures', id],
    queryFn: () => contractApi.getSignatures(id),
    enabled: !!id,
    staleTime: 1000 * 30,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload) => contractApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => contractApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useUpdateContractStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }) => contractApi.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
    },
  });
}

export function useSignContract() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }) => contractApi.sign(id, payload),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] });
      queryClient.invalidateQueries({ queryKey: ['contracts', 'signatures', id] });
      queryClient.invalidateQueries({ queryKey: ['properties'] });
    },
  });
}

export function useDownloadContract() {
  return useMutation({
    mutationFn: ({ id, filename }) => contractApi.downloadPdf(id, filename),
    onSuccess: ({ url, filename }) => {
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      URL.revokeObjectURL(url);
    },
  });
}

