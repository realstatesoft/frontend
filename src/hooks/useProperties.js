import { useState, useEffect, useCallback, useRef } from "react";
import propertyApi from "../services/properties/propertyApi";

/**
 * Hook que obtiene propiedades paginadas desde la API.
 *
 * @param {object} opts
 * @param {number} opts.page           - Página actual (1-indexed, se convierte a 0-indexed para Spring)
 * @param {number} opts.size           - Cantidad por página
 * @param {string} opts.search         - Texto de búsqueda libre
 * @param {string} opts.propertyType   - Tipo de propiedad (enum del backend, ej: HOUSE, APARTMENT)
 * @param {string} opts.status         - Estado de la propiedad (enum del backend, ej: PUBLISHED)
 * @param {string} opts.availability   - Disponibilidad (IMMEDIATE, IN_30_DAYS, IN_60_DAYS, TO_NEGOTIATE)
 * @param {number} opts.minPrice       - Precio mínimo
 * @param {number} opts.maxPrice       - Precio máximo
 * @param {number} opts.minBedrooms    - Cantidad mínima de dormitorios
 * @param {number} opts.minBathrooms   - Cantidad mínima de baños
 * @returns {{ properties, loading, error, totalPages, totalElements, refetch }}
 */
export default function useProperties({
    page = 1,
    size = 12,
    search = "",
    propertyType,
    status,
    availability,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
} = {}) {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Ref para descartar respuestas obsoletas (stale)
    const latestRequestIdRef = useRef(0);

    const fetchProperties = useCallback(async () => {
        const requestId = ++latestRequestIdRef.current;

        setLoading(true);
        setError(null);
        try {
            const springPage = Math.max(page - 1, 0); // Spring usa 0-indexed
            const params = { page: springPage, size };

            // Agregar filtros opcionales
            if (propertyType) params.propertyType = propertyType;
            if (status) params.status = status;
            if (availability) params.availability = availability;
            if (minPrice) params.minPrice = minPrice;
            if (maxPrice) params.maxPrice = maxPrice;
            if (minBedrooms) params.minBedrooms = minBedrooms;
            if (minBathrooms) params.minBathrooms = minBathrooms;

            let res;
            if (search.trim()) {
                res = await propertyApi.search(search.trim(), params);
            } else {
                res = await propertyApi.getAll(params);
            }

            // Descartar si ya se lanzó una request más nueva
            if (requestId !== latestRequestIdRef.current) return;

            // ApiResponse → { success, data: Page<PropertySummaryResponse> }
            const pageData = res?.data
                ? (res.data.data ?? res.data)
                : { content: [], totalPages: 0, totalElements: 0 };

            setProperties(pageData.content ?? []);
            setTotalPages(Number(pageData.totalPages ?? 0));
            setTotalElements(Number(pageData.totalElements ?? 0));
        } catch (err) {
            // Descartar errores de requests obsoletas
            if (requestId !== latestRequestIdRef.current) return;

            console.error("Error al cargar propiedades:", err);
            setError(err?.response?.data?.message ?? "Error al cargar propiedades");
            setProperties([]);
            setTotalPages(0);
            setTotalElements(0);
        } finally {
            if (requestId === latestRequestIdRef.current) {
                setLoading(false);
            }
        }
    }, [page, size, search, propertyType, status, availability, minPrice, maxPrice, minBedrooms, minBathrooms]);

    useEffect(() => {
        fetchProperties();
    }, [fetchProperties]);

    return { properties, loading, error, totalPages, totalElements, refetch: fetchProperties };
}
