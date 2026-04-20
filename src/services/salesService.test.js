import { describe, it, expect, vi } from 'vitest';
import salesService from './salesService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('salesService', () => {
  it('getAll calls correct endpoint with params', async () => {
    const mockData = { data: [] };
    api.get.mockResolvedValue({ data: mockData });
    
    const params = { year: 2023 };
    const result = await salesService.getAll(params);
    
    expect(api.get).toHaveBeenCalledWith('/dashboard/sales', { params });
    expect(result).toEqual(mockData);
  });

  it('getSummary calls correct summary endpoint', async () => {
    const mockSummary = { totalSales: 100 };
    api.get.mockResolvedValue({ data: mockSummary });
    
    const result = await salesService.getSummary();
    
    expect(api.get).toHaveBeenCalledWith('/dashboard/sales/summary');
    expect(result).toEqual(mockSummary);
  });
});
