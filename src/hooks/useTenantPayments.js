import { useState, useEffect, useCallback } from 'react';
import tenantService from '../services/tenantService';

export function useTenantPayments(initialPage = 0, size = 12) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);

  const fetchPayments = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await tenantService.getPayments(page, size);
      setData(response);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  return {
    data,
    isLoading,
    error,
    page,
    setPage,
    refresh: fetchPayments,
  };
}
