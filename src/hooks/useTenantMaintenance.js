import { useState, useEffect, useCallback } from 'react';
import tenantService from '../services/tenantService';

export function useTenantMaintenance() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const fetchMaintenance = useCallback(async (currentPage = 0, currentSize = 10) => {
    setIsLoading(true);
    setPage(currentPage);
    setSize(currentSize);
    try {
      const response = await tenantService.getMaintenance(currentPage, currentSize);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaintenance();
  }, [fetchMaintenance]);

  const createRequest = async (formData) => {
    try {
      const response = await tenantService.createMaintenanceRequest(formData);
      await fetchMaintenance(page, size);
      return response;
    } catch (err) {
      throw err;
    }
  };

  const rateRequest = async (id, rating) => {
    try {
      await tenantService.rateMaintenanceRequest(id, rating);
      await fetchMaintenance(page, size);
    } catch (err) {
      throw err;
    }
  };

  return {
    data,
    isLoading,
    error,
    refresh: fetchMaintenance,
    createRequest,
    rateRequest,
  };
}
