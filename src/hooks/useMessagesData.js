import { useQuery } from '@tanstack/react-query';
import messageService from '../services/messageService';

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: messageService.getConversations,
    staleTime: 1000 * 30,
    refetchInterval: 30000,
  });
}

export function useMessages(conversationId) {
  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: () => messageService.getMessages(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 15,
    refetchInterval: 30000,
  });
}
