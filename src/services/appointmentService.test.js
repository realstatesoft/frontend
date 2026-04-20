import { describe, it, expect, vi } from 'vitest';
import appointmentService from './appointmentService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('appointmentService', () => {
  it('getAll calls correct endpoint with params', async () => {
    const mockData = { data: [{ id: 1 }] };
    api.get.mockResolvedValue({ data: mockData });
    
    const params = { month: 10 };
    const result = await appointmentService.getAll(params);
    
    expect(api.get).toHaveBeenCalledWith('/agent-agenda', { params });
    expect(result).toEqual(mockData);
  });

  it('getById calls correct endpoint', async () => {
    const mockDetail = { id: 5, title: 'Meeting' };
    api.get.mockResolvedValue({ data: mockDetail });
    
    const result = await appointmentService.getById(5);
    
    expect(api.get).toHaveBeenCalledWith('/agent-agenda/5');
    expect(result).toEqual(mockDetail);
  });
});
