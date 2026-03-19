import { useState, useCallback, useEffect } from "react";
import clientApi from "../services/clients/clientApi";

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [filters, setFilters] = useState({
    q: "",
    status: "",
    clientType: "",
    createdAtFrom: "",
    createdAtTo: "",
    sort: "createdAt,desc",
  });

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== "")
      );
      
      const response = await clientApi.searchClients({
        ...activeFilters,
        page,
        size,
      });
      
      setClients(response.content || []);
      setTotalPages(response.totalPages || 1);
      setTotalElements(response.totalElements || 0);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }, [page, size, filters]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < totalPages) {
      setPage(newPage);
    }
  };

  const updateFilters = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(0); // Reset page on filter change
  };

  const removeClient = async (id) => {
    await clientApi.deleteClient(id);
    await fetchClients(); // refresh after delete
  };

  const exportCsv = async () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );
    return await clientApi.exportClients(activeFilters);
  };

  return {
    clients,
    loading,
    error,
    page,
    size,
    totalPages,
    totalElements,
    filters,
    fetchClients,
    handlePageChange,
    updateFilters,
    removeClient,
    exportCsv,
  };
}
