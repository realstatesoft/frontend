import { useCallback, useEffect, useMemo, useState } from "react";
import favoriteApi from "../services/favorites/favoriteApi";
import { useAuth } from "./useAuth";

/**
 * Maneja favoritos del usuario autenticado para pintar/togglear corazones.
 */
export default function useFavoriteProperties() {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [loadingIds, setLoadingIds] = useState(false);
  const [togglingIds, setTogglingIds] = useState([]);

  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);

  const fetchFavoriteIds = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }

    setLoadingIds(true);
    try {
      const res = await favoriteApi.getMy({ page: 0, size: 200 });
      const pageData = res?.data?.data ?? {};
      const content = Array.isArray(pageData.content) ? pageData.content : [];
      const ids = content.map((item) => item.id).filter(Boolean);
      setFavoriteIds(ids);
    } catch (error) {
      console.error("Error al cargar favoritos:", error);
      setFavoriteIds([]);
    } finally {
      setLoadingIds(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchFavoriteIds();
  }, [fetchFavoriteIds]);

  const toggleFavorite = useCallback(
    async (propertyId) => {
      if (!isAuthenticated || !propertyId) return;

      setTogglingIds((prev) => (prev.includes(propertyId) ? prev : [...prev, propertyId]));
      const isFavorite = favoriteIdSet.has(propertyId);

      // Optimistic update de UI
      setFavoriteIds((prev) =>
        isFavorite ? prev.filter((id) => id !== propertyId) : [...prev, propertyId]
      );

      try {
        if (isFavorite) {
          await favoriteApi.remove(propertyId);
        } else {
          await favoriteApi.add(propertyId);
        }
      } catch (error) {
        // rollback
        setFavoriteIds((prev) =>
          isFavorite ? [...prev, propertyId] : prev.filter((id) => id !== propertyId)
        );
        console.error("Error al actualizar favorito:", error);
      } finally {
        setTogglingIds((prev) => prev.filter((id) => id !== propertyId));
      }
    },
    [favoriteIdSet, isAuthenticated]
  );

  return {
    favoriteIds,
    loadingIds,
    togglingIds,
    isAuthenticated,
    toggleFavorite,
    refetchFavorites: fetchFavoriteIds,
  };
}
