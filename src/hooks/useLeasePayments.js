import { useState, useEffect, useCallback } from 'react';
import rentService from '../services/rentService';

export function useLeasePayments(leaseId) {
  const [installments, setInstallments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!leaseId) {
      setIsLoading(false);
      setInstallments([]);
      setPayments([]);
      setError(null);
      return;
    }
    setIsLoading(true);
    try {
      const [instRes, payRes] = await Promise.all([
        rentService.getLeaseInstallments(leaseId),
        rentService.getLeasePayments(leaseId)
      ]);
      // Assuming backend returns an array or an object with content
      setInstallments(Array.isArray(instRes) ? instRes : (instRes?.content || []));
      setPayments(Array.isArray(payRes) ? payRes : (payRes?.content || []));
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [leaseId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const registerPayment = async (installmentId, payload) => {
    try {
      const res = await rentService.registerManualPayment(installmentId, payload);
      await fetchData(); // Refresh data
      return res;
    } catch (err) {
      throw err;
    }
  };

  return {
    installments,
    payments,
    isLoading,
    error,
    refresh: fetchData,
    registerPayment,
  };
}
