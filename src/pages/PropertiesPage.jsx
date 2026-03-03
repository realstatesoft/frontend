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
 */
export default function PropertiesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [tagFilter, setTagFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);

    // Traer propiedades del backend (usa search para el endpoint /search)
    const { properties, loading, error, totalPages, refetch } = useProperties({
        page: 1,
        size: 200, // Traemos un batch grande para filtrar client-side
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

    // Filtrado client-side sobre los datos del API
    const filtered = useMemo(() => {
        return properties.filter((p) => {
            const pType = PROPERTY_TYPE_LABELS[p.propertyType] ?? p.propertyType ?? "";
            const pTag = STATUS_LABELS[p.status] ?? p.status ?? "";

            const matchType = typeFilter === "Todos" || pType === typeFilter;
            const matchTag = tagFilter === "Todos" || pTag === tagFilter;
            return matchType && matchTag;
        });
    }, [properties, typeFilter, tagFilter]);

    return (
        <>
            <CustomNavbar />

            <PropertiesHero
                search={search}
                typeFilter={typeFilter}
                tagFilter={tagFilter}
                totalResults={filtered.length}
                onSearch={handleSearch}
                onTypeChange={handleType}
                onTagChange={handleTag}
                onClear={handleClear}
            />

            <div style={{ backgroundColor: "#f8f9fa", minHeight: "60vh" }}>
                <PropertiesGrid
                    properties={filtered}
                    onClear={handleClear}
                    currentPage={currentPage}
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
