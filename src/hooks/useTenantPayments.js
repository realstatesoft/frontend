import { useState, useEffect, useCallback, useRef } from 'react';
import tenantService from '../services/tenantService';

export function useTenantPayments(initialPage = 0, size = 12) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(initialPage);
  const requestIdRef = useRef(0);

  const fetchPayments = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsLoading(true);
    try {
      const response = await tenantService.getPayments(page, size);
      if (requestId === requestIdRef.current) {
        setData(response);
        setError(null);
      }
    } catch (err) {
      if (requestId === requestIdRef.current) {
        setError(err);
      }
    } finally {
      if (requestId === requestIdRef.current) {
        setIsLoading(false);
      }
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
