import { useCallback, useEffect, useState } from "react";
import favoriteApi from "../services/favorites/favoriteApi";

/**
 * Carga propiedades favoritas del usuario autenticado.
 */
export default function useMyFavoriteProperties({ page = 1, size = 20 } = {}) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [removingIds, setRemovingIds] = useState([]);

  const fetchFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page: Math.max(page - 1, 0),
        size,
      };
      const res = await favoriteApi.getMy(params);
      const pageData = res?.data?.data ?? {};
      setProperties(pageData.content ?? []);
      setTotalPages(Number(pageData.totalPages ?? 0));
      setTotalElements(Number(pageData.totalElements ?? 0));
    } catch (err) {
      console.error("Error al cargar favoritos:", err);
      setError(err?.response?.data?.message ?? "Error al cargar favoritos");
      setProperties([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  const removeFavorite = useCallback(async (propertyId) => {
    if (!propertyId) return;

    let removedProperty = null;
    setRemovingIds((prev) => (prev.includes(propertyId) ? prev : [...prev, propertyId]));
    setProperties((prev) => {
      removedProperty = prev.find((item) => item.id === propertyId) ?? null;
      return prev.filter((item) => item.id !== propertyId);
    });
    setTotalElements((prev) => Math.max(0, prev - 1));

    try {
      await favoriteApi.remove(propertyId);
    } catch (err) {
      console.error("Error al quitar favorito:", err);
      // rollback simple
      if (removedProperty) {
        setProperties((prev) => [removedProperty, ...prev]);
        setTotalElements((prev) => prev + 1);
      }
    } finally {
      setRemovingIds((prev) => prev.filter((id) => id !== propertyId));
    }
  }, []);

  return {
    properties,
    loading,
    error,
    totalPages,
    totalElements,
    removingIds,
    removeFavorite,
    refetch: fetchFavorites,
  };
}
