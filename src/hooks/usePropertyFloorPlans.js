import { useState, useEffect, useCallback, useRef } from "react";
import floorPlanApi from "../services/properties/floorPlanApi";

/**
 * Hook para cargar y gestionar los planos de piso de una propiedad.
 * Uses a request token to prevent stale responses from overwriting newer ones.
 * Clears state when propertyId becomes falsy.
 * @param {string|number} propertyId - ID de la propiedad
 */
export function usePropertyFloorPlans(propertyId) {
  const [floorPlans, setFloorPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Incrementing token to track the latest request
  const latestRequestRef = useRef(0);

  const fetchFloorPlans = useCallback(async () => {
    if (!propertyId) return;

    // Increment and capture the token for this request
    const requestToken = ++latestRequestRef.current;

    setLoading(true);
    setError(null);

    try {
      const response = await floorPlanApi.getFloorPlans(propertyId);

      // Only update state if this is still the latest request
      if (requestToken !== latestRequestRef.current) return;

      // El backend devuelve ApiResponse<List<...>>:
      // Axios expone el body JSON como response.data  →  { success, data: [...], timestamp }
      // Por lo tanto la lista real está en response.data.data
      const plans = response.data?.data ?? [];
      setFloorPlans(plans);
      setSelectedPlan(plans.length > 0 ? plans[0] : null);
    } catch (err) {
      // Only update state if this is still the latest request
      if (requestToken !== latestRequestRef.current) return;

      console.error("Error al cargar los planos:", err);
      setError("No se pudieron cargar los planos de la propiedad.");
      setFloorPlans([]);
      setSelectedPlan(null);
    } finally {
      // Only clear loading if this is still the latest request
      if (requestToken === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [propertyId]);

  useEffect(() => {
    if (!propertyId) {
      // Clear state when propertyId becomes falsy
      setFloorPlans([]);
      setSelectedPlan(null);
      setLoading(false);
      setError(null);
      return;
    }

    fetchFloorPlans();

    // Cleanup: invalidate in-flight requests when propertyId changes or unmounts
    return () => {
      latestRequestRef.current++;
    };
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
