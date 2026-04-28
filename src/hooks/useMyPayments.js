import { useState, useCallback, useEffect } from 'react';
import paymentApi from '../services/payments/paymentApi';

const PAGE_SIZE = 10;

export default function useMyPayments() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const load = useCallback(async (currentPage, currentStatus) => {
    setLoading(true);
    setError(null);
    try {
      const res = await paymentApi.getMyPayments(currentPage, PAGE_SIZE, currentStatus || null);
      const data = res.data?.data ?? {};
      setItems(data.content ?? []);
      setTotalPages(data.totalPages ?? 0);
    } catch {
      setError('No se pudieron cargar tus pagos.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(page, statusFilter); }, [load, page, statusFilter]);

  const handleStatusChange = (value) => {
    setStatusFilter(value);
    setPage(0);
  };

  return {
    items,
    loading,
    error,
    statusFilter,
    handleStatusChange,
    page,
    setPage,
    totalPages,
  };
}
