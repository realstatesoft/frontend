import { describe, it, expect, vi } from 'vitest';
import adminService from './adminService';
import api from './api';

vi.mock('./api', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn(),
  }
}));

describe('adminService', () => {
  it('getDashboardOverview calls correct endpoint', async () => {
    api.get.mockResolvedValue({ data: { count: 10 } });
    const result = await adminService.getDashboardOverview();
    expect(api.get).toHaveBeenCalledWith('/admin/dashboard');
    expect(result).toEqual({ count: 10 });
  });

  it('getAuditLogs calls with params', async () => {
    api.get.mockResolvedValue({ data: [] });
    const params = { page: 1 };
    await adminService.getAuditLogs(params);
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs', { params });
  });

  it('getAuditLogEntityOptions handles query trimming', async () => {
    api.get.mockResolvedValue({ data: [] });
    await adminService.getAuditLogEntityOptions({ entityType: 'PROPERTY', q: ' 123 ', limit: 10 });
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs/entity-options', {
      params: { entityType: 'PROPERTY', q: '123', limit: 10 }
    });
  });

  it('getAuditLogEntityOptions handles null query', async () => {
    api.get.mockResolvedValue({ data: [] });
    await adminService.getAuditLogEntityOptions({ entityType: 'USER' });
    expect(api.get).toHaveBeenCalledWith('/admin/audit-logs/entity-options', {
      params: { entityType: 'USER', limit: 40 }
    });
  });

  it('suspendUser calls put with data', async () => {
    api.put.mockResolvedValue({ data: { success: true } });
    const data = { suspendedUntil: '2025-01-01', suspensionReason: 'Test' };
    const result = await adminService.suspendUser(123, data);
    expect(api.put).toHaveBeenCalledWith('/users/123/suspend', data);
    expect(result).toEqual({ success: true });
  });

  it('unsuspendUser calls put', async () => {
    api.put.mockResolvedValue({ data: { success: true } });
    await adminService.unsuspendUser(456);
    expect(api.put).toHaveBeenCalledWith('/users/456/unsuspend');
  });
});
