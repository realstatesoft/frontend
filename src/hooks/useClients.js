import { useState, useCallback, useEffect } from "react";
import Swal from "sweetalert2";
import clientApi from "../services/clients/clientApi";

const getErrorMessage = (err) =>
  err.response?.data?.message ??
  err.response?.data?.errors?.[0] ??
  "No se pudo conectar con el servidor.";

export default function useClients() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Pagination & Filters State
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Batch selection
  const [selectedIds, setSelectedIds] = useState(new Set());

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
      setSelectedIds(new Set()); // clear selection on new data
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
    setPage(0);
  };

  // ── Delete with toast ─────────────────────────────────────────────────────
  const removeClient = async (id) => {
    try {
      await clientApi.deleteClient(id);
      await Swal.fire({
        icon: "success",
        title: "Cliente eliminado",
        text: "El cliente fue archivado correctamente.",
        timer: 2000,
        showConfirmButton: false,
      });
      await fetchClients();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    }
  };

  // ── Export CSV with toast ─────────────────────────────────────────────────
  const exportCsv = async () => {
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== "")
    );
    const blob = await clientApi.exportClients(activeFilters);
    return blob;
  };

  // ── Batch selection helpers ───────────────────────────────────────────────
  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selectedIds.size === clients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(clients.map((c) => c.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ── Batch mark inactive ───────────────────────────────────────────────────
  const batchMarkInactive = async (ids) => {
    try {
      await Promise.all(
        [...ids].map((id) => clientApi.updateClientStatus(id, "INACTIVE"))
      );
      await Swal.fire({
        icon: "success",
        title: "Clientes actualizados",
        text: `${ids.size} cliente(s) marcado(s) como inactivo(s).`,
        timer: 2000,
        showConfirmButton: false,
      });
      await fetchClients();
    } catch (err) {
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: getErrorMessage(err),
      });
    }
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
    selectedIds,
    fetchClients,
    handlePageChange,
    updateFilters,
    removeClient,
    exportCsv,
    toggleSelect,
    selectAll,
    clearSelection,
    batchMarkInactive,
  };
}
