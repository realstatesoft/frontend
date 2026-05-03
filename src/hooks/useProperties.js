import { useQuery, keepPreviousData } from "@tanstack/react-query";
import propertyApi from "../services/properties/propertyApi";

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
} = {}) {
    const { data, isLoading: loading, isFetching, error: queryError, refetch } = useQuery({
        queryKey: [
            "properties",
            { page, size, search, propertyType, category, status, availability, minPrice, maxPrice, minBedrooms, minBathrooms }
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
                totalPages: Number(pageData.page?.totalPages ?? pageData.totalPages ?? 0),
                totalElements: Number(pageData.page?.totalElements ?? pageData.totalElements ?? 0),
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
