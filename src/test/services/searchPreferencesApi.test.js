import { describe, it, expect, vi } from 'vitest';
import api from '../../services/api';
import { searchPreferencesApi } from '../../services/search/searchPreferencesApi';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

describe('searchPreferencesApi', () => {
  it('create sends POST to /search-preferences', async () => {
    const data = { name: 'Test', filters: {}, notificationsEnabled: false };
    api.post.mockResolvedValueOnce({ data: { id: 1, ...data } });

    const result = await searchPreferencesApi.create(data);

    expect(api.post).toHaveBeenCalledWith('/search-preferences', data);
    expect(result.data).toEqual({ id: 1, ...data });
  });

  it('getMine returns page from /search-preferences/me', async () => {
    api.get.mockResolvedValueOnce({ data: { content: [], totalElements: 0 } });

    const result = await searchPreferencesApi.getMine();

    expect(api.get).toHaveBeenCalledWith('/search-preferences/me', { params: undefined });
  });

  it('delete calls correct endpoint', async () => {
    api.delete.mockResolvedValueOnce({});

    await searchPreferencesApi.delete(1);

    expect(api.delete).toHaveBeenCalledWith('/search-preferences/1');
  });
});