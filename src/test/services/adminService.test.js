import { describe, it, expect, vi } from 'vitest';
import api from '../../services/api';
import adminService from '../../services/adminService';

vi.mock('../../services/api', () => ({
  default: {
    get: vi.fn(),
  }
}));

describe('adminService', () => {
  it('getDashboardOverview returns data from /admin/dashboard', async () => {
    const mockData = { totalUsers: 10, totalAgents: 2, totalProperties: 5 };
    api.get.mockResolvedValueOnce({ data: mockData });

    const result = await adminService.getDashboardOverview();

    expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
    expect(result).toEqual(mockData);
  });
});
