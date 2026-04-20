import { describe, it, expect, vi, beforeEach } from 'vitest';
import messageService from '../../services/messageService';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn()
  }
}));

import api from '../../services/api';

describe('messageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getConversations', () => {
    it('should call GET /messages/conversations', async () => {
      const mockData = { data: [{ id: 1, contactName: 'Agent' }] };
      api.get.mockResolvedValue({ data: mockData });

      const result = await messageService.getConversations();

      expect(api.get).toHaveBeenCalledWith('/messages/conversations');
      expect(result).toEqual(mockData);
    });
  });

  describe('getMessages', () => {
    it('should call GET /messages/conversations/:id', async () => {
      const mockData = { data: [{ id: 1, text: 'Hello' }] };
      api.get.mockResolvedValue({ data: mockData });

      const result = await messageService.getMessages(123);

      expect(api.get).toHaveBeenCalledWith('/messages/conversations/123');
      expect(result).toEqual(mockData);
    });
  });

  describe('sendMessage', () => {
    it('should call POST /messages with correct payload', async () => {
      const mockResponse = { data: { id: 1, text: 'Hello' } };
      api.post.mockResolvedValue({ data: mockResponse });

      const result = await messageService.sendMessage(123, 'Hello', 456);

      expect(api.post).toHaveBeenCalledWith('/messages', {
        receiverId: 123,
        content: 'Hello',
        propertyId: 456
      });
      expect(result).toEqual(mockResponse);
    });

    it('should send null propertyId when not provided', async () => {
      const mockResponse = { data: { id: 1 } };
      api.post.mockResolvedValue({ data: mockResponse });

      await messageService.sendMessage(123, 'Hello');

      expect(api.post).toHaveBeenCalledWith('/messages', {
        receiverId: 123,
        content: 'Hello',
        propertyId: null
      });
    });
  });

  describe('markAsRead', () => {
    it('should call PUT /messages/conversations/:id/read', async () => {
      api.put.mockResolvedValue({});

      await messageService.markAsRead(123);

      expect(api.put).toHaveBeenCalledWith('/messages/conversations/123/read');
    });
  });
});