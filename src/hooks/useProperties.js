import { useQuery, keepPreviousData } from "@tanstack/react-query";
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
 * @param {number} opts.minPrice       - Precio mínimo en PYG
 * @param {number} opts.maxPrice       - Precio máximo en PYG
 * @param {number} opts.minBedrooms    - Cantidad mínima de dormitorios
 * @param {object} opts.minBathrooms   - Cantidad mínima de baños
 * @param {object} [opts.geoFilter]     - Filtro geoespacial { type: 'polygon', polygon } | { type: 'circle', circleLat, circleLng, circleRadiusMeters }
 * @returns {{ properties, loading, error, totalPages, totalElements, refetch }}
 */
export default function useProperties({
    page = 1,
    size = 12,
    search = "",
    propertyType,
    category,
    status,
    availability,
    minPrice,
    maxPrice,
    minBedrooms,
    minBathrooms,
    geoFilter,
} = {}) {
    const { data, isLoading: loading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: [
            "properties",
            { page, size, search, propertyType, category, status, availability, minPrice, maxPrice, minBedrooms, minBathrooms, geoFilter }
        ],
        queryFn: async () => {
            const springPage = Math.max(page - 1, 0);
            const params = { page: springPage, size };

            if (propertyType) params.propertyType = propertyType;
            if (category) params.category = category;
            if (status) params.status = status;
            if (availability) params.availability = availability;
            if (minPrice !== undefined && minPrice !== null) params.minPrice = minPrice;
            if (maxPrice !== undefined && maxPrice !== null) params.maxPrice = maxPrice;
            if (minBedrooms !== undefined && minBedrooms !== null) params.minBedrooms = minBedrooms;
            if (minBathrooms !== undefined && minBathrooms !== null) params.minBathrooms = minBathrooms;

            if (geoFilter?.type === 'polygon' && geoFilter.polygon) {
                params.polygon = JSON.stringify(geoFilter.polygon);
            } else if (geoFilter?.type === 'circle' && geoFilter.circleLat != null) {
                params.circleLat = geoFilter.circleLat;
                params.circleLng = geoFilter.circleLng;
                params.circleRadius = geoFilter.circleRadiusMeters;
            }

            let res;
            if (search.trim()) {
                res = await propertyApi.search(search.trim(), params);
            } else {
                res = await propertyApi.getAll(params);
            }

            const pageData = res?.data
                ? (res.data.data ?? res.data)
                : { content: [], page: { totalPages: 0, totalElements: 0 } };

            return {
                properties: pageData.content ?? [],
                totalPages: Number(pageData.page?.totalPages ?? pageData.totalPages ?? (pageData.content ? Math.ceil(pageData.content.length / size) : 0)),
                totalElements: Number(pageData.page?.totalElements ?? pageData.totalElements ?? (pageData.content ? pageData.content.length : 0)),
            };
        },
        staleTime: 5 * 60 * 1000, // 5 minutos de caché para navegación súper rápida
        placeholderData: keepPreviousData, // Evita mostrar spinner al cambiar de página (v5)
    });

    const error = queryError?.response?.data?.message ?? queryError?.message ?? null;

    return {
        properties: data?.properties ?? [],
        loading,
        fetching: isFetching,
        error,
        totalPages: data?.totalPages ?? 0,
        totalElements: data?.totalElements ?? 0,
        refetch,
    };
}
