import { useState, useEffect, useCallback, useRef } from "react";
import propertyApi from "../services/properties/propertyApi";

/**
 * Hook que obtiene las propiedades del usuario actual (owner o agente).
 * Usa GET /properties/me con el token de autenticación.
 *
 * @param {object} opts
 * @param {number} opts.page - Página (1-indexed)
 * @param {number} opts.size - Cantidad por página
 * @returns {{ properties, loading, error, totalPages, totalElements, refetch }}
 */
export default function useMyProperties({ page = 1, size = 12 } = {}) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    const latestRequestIdRef = useRef(0);

    const fetchProperties = useCallback(async () => {
        const requestId = ++latestRequestIdRef.current;

        setLoading(true);
        setError(null);
        try {
            const springPage = Math.max(page - 1, 0);
            const params = { page: springPage, size };

            const res = await propertyApi.getMe(params);

            if (requestId !== latestRequestIdRef.current) return;

            const pageData = res?.data
                ? (res.data.data ?? res.data)
                : { content: [], totalPages: 0, totalElements: 0 };

            setProperties(pageData.content ?? []);
            setTotalPages(Number(pageData.totalPages ?? 0));
            setTotalElements(Number(pageData.totalElements ?? 0));
        } catch (err) {
            if (requestId !== latestRequestIdRef.current) return;

            console.error("Error al cargar mis propiedades:", err);
            setError(err?.response?.data?.message ?? "Error al cargar propiedades");
            setProperties([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            if (requestId === latestRequestIdRef.current) {
                setLoading(false);
            }
        }
    }, [page, size]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    return { properties, loading, error, totalPages, totalElements, refetch: fetchProperties };
}
