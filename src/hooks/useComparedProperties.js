import { useCallback, useEffect, useRef, useState } from "react";
import propertyApi from "../services/properties/propertyApi";

export default function useComparedProperties(propertyIds = []) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const latestRequestRef = useRef(0);
  const key = propertyIds.join(",");

  const fetchComparedProperties = useCallback(async () => {
    if (propertyIds.length === 0) {
      setProperties([]);
      setError(null);
      setLoading(false);
      return;
    }

    const requestId = ++latestRequestRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await propertyApi.compare(propertyIds);
      if (requestId !== latestRequestRef.current) return;

      const payload = response?.data?.data ?? response?.data ?? [];
      setProperties(Array.isArray(payload) ? payload : []);
    } catch (err) {
      if (requestId !== latestRequestRef.current) return;

      console.error("Error al cargar propiedades para comparar:", err);
      setProperties([]);
      setError(err?.response?.data?.message ?? "No se pudo cargar el comparador");
    } finally {
      if (requestId === latestRequestRef.current) {
        setLoading(false);
      }
    }
  }, [propertyIds]);

  useEffect(() => {
    fetchComparedProperties();
  }, [fetchComparedProperties, key]);

  return { properties, loading, error, refetch: fetchComparedProperties };
}
