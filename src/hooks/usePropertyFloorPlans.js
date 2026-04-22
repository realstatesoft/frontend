import { useState, useEffect, useCallback } from "react";
import floorPlanApi from "../services/properties/floorPlanApi";

/**
 * Hook para cargar y gestionar los planos de piso de una propiedad.
 * @param {string|number} propertyId - ID de la propiedad
 */
export function usePropertyFloorPlans(propertyId) {
  const [floorPlans, setFloorPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFloorPlans = useCallback(async () => {
    if (!propertyId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await floorPlanApi.getFloorPlans(propertyId);
      // El backend devuelve ApiResponse<List<...>>:
      // Axios expone el body JSON como response.data  →  { success, data: [...], timestamp }
      // Por lo tanto la lista real está en response.data.data
      const plans = response.data?.data ?? [];
      setFloorPlans(plans);
      setSelectedPlan(plans.length > 0 ? plans[0] : null);
    } catch (err) {
      console.error("Error al cargar los planos:", err);
      setError("No se pudieron cargar los planos de la propiedad.");
      setFloorPlans([]);
      setSelectedPlan(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    fetchFloorPlans();
  }, [fetchFloorPlans]);

  return {
    floorPlans,
    selectedPlan,
    setSelectedPlan,
    loading,
    error,
    refetch: fetchFloorPlans,
  };
}
