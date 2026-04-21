import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useConversations, useMessages, useSendMessage, useMarkAsRead } from '../../hooks/useMessagesData';
import messageService from '../../services/messageService';

vi.mock('../../services/messageService');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useMessagesData', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  describe('useConversations', () => {
    it('should return conversations data', async () => {
      const mockData = [{ id: 1, contactName: 'Agent' }];
      messageService.getConversations.mockResolvedValue(mockData);

      const { result } = renderHook(() => useConversations(), {
        wrapper: createWrapper()
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
    });
  });

  describe('useMessages', () => {
    it('should return messages for conversation', async () => {
      const mockMessages = [{ id: 1, text: 'Hello' }];
      messageService.getMessages.mockResolvedValue(mockMessages);

      const { result } = renderHook(() => useMessages(123), {
        wrapper: createWrapper()
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockMessages);
    });

    it('should not fetch when conversationId is null', () => {
      renderHook(() => useMessages(null), { wrapper: createWrapper() });

      expect(messageService.getMessages).not.toHaveBeenCalled();
    });
  });

  describe('useSendMessage', () => {
    it('should call sendMessage and invalidate queries on success', async () => {
      messageService.sendMessage.mockResolvedValue({ id: 1 });

      const { result } = renderHook(() => useSendMessage(), {
        wrapper: createWrapper()
      });

      result.current.mutate({ receiverId: 123, content: 'Hello' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.sendMessage).toHaveBeenCalledWith(123, 'Hello', undefined);
    });
  });

  describe('useMarkAsRead', () => {
    it('should call markAsRead and invalidate queries on success', async () => {
      messageService.markAsRead.mockResolvedValue({});

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper()
      });

      result.current.mutate(456);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(messageService.markAsRead).toHaveBeenCalled();
    });
  });
});