import { useState, useMemo } from "react";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import useProperties from "../hooks/useProperties";
import { PROPERTY_TYPE_LABELS } from "../constants/propertyEnums";
import { STATUS_LABELS } from "../data/propertiesData";

const PAGE_SIZE = 12;

/**
 * PropertiesPage
 * Gestiona filtros y paginación de propiedades conectada a la API.
 *
 * Cuando hay filtros de tipo/estado activos, se traen todas las propiedades
 * para filtrar client-side. Sin filtros, se usa paginación server-side.
 */
export default function PropertiesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [tagFilter, setTagFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);

    const hasClientFilters = typeFilter !== "Todos" || tagFilter !== "Todos";

    // Si hay filtros client-side, traemos todo; sino paginamos en el servidor
    const { properties, loading, error, totalPages: serverTotalPages, totalElements, refetch } = useProperties({
        page: hasClientFilters ? 1 : currentPage,
        size: hasClientFilters ? 500 : PAGE_SIZE,
        search,
    });

    // Al cambiar cualquier filtro volvemos a la página 1
    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };
    const handleType = (val) => { setTypeFilter(val); setCurrentPage(1); };
    const handleTag = (val) => { setTagFilter(val); setCurrentPage(1); };

    const handleClear = () => {
        setSearch("");
        setTypeFilter("Todos");
        setTagFilter("Todos");
        setCurrentPage(1);
    };

    // Filtrado client-side (solo tiene efecto cuando hay filtros activos)
    const filtered = useMemo(() => {
        if (!hasClientFilters) return properties;

        return properties.filter((p) => {
            const pType = PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType ?? "";
            const pTag = STATUS_LABELS[p.status] ?? p.status ?? "";

            const matchType = typeFilter === "Todos" || pType === typeFilter;
            const matchTag = tagFilter === "Todos" || pTag === tagFilter;
            return matchType && matchTag;
        });
    }, [properties, typeFilter, tagFilter, hasClientFilters]);

    // Paginación client-side sobre los resultados filtrados
    const clientTotalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const paginatedFiltered = hasClientFilters
        ? filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
        : filtered;

    const displayTotalPages = hasClientFilters ? clientTotalPages : serverTotalPages;

    return (
        <>
            <CustomNavbar />

            <PropertiesHero
                search={search}
                typeFilter={typeFilter}
                tagFilter={tagFilter}
                totalResults={hasClientFilters ? filtered.length : totalElements}
                onSearch={handleSearch}
                onTypeChange={handleType}
                onTagChange={handleTag}
                onClear={handleClear}
            />

            <div style={{ backgroundColor: "#f8f9fa", minHeight: "60vh" }}>
                <PropertiesGrid
                    properties={paginatedFiltered}
                    onClear={handleClear}
                    onRetry={refetch}
                    currentPage={currentPage}
                    totalPages={displayTotalPages}
                    loading={loading}
                    error={error}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />
            </div>

            <Footer />
        </>
    );
}
