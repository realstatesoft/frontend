import { useState, useEffect, useCallback } from 'react';
import tenantService from '../services/tenantService';

export function useTenantMaintenance() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaintenance = useCallback(async (page = 0, size = 10) => {
    setIsLoading(true);
    try {
      const response = await tenantService.getMaintenance(page, size);
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
      await fetchMaintenance();
      return response;
    } catch (err) {
      throw err;
    }
  };

  const rateRequest = async (id, rating) => {
    try {
      await tenantService.rateMaintenanceRequest(id, rating);
      await fetchMaintenance();
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
