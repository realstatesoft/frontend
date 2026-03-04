import { useState } from "react";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import useProperties from "../hooks/useProperties";
import { PROPERTY_TYPE } from "../constants/propertyEnums";

const PAGE_SIZE = 12;

/**
 * PropertiesPage
 * Gestiona filtros y paginación de propiedades con filtros server-side.
 */
export default function PropertiesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);

    // Convertir label del filtro de tipo a valor de enum del backend
    const backendType = typeFilter !== "Todos" ? PROPERTY_TYPE[typeFilter] : undefined;

    // Filtros server-side: type, search y paginación real
    const { properties, loading, error, totalPages, totalElements, refetch } = useProperties({
        page: currentPage,
        size: PAGE_SIZE,
        search,
        propertyType: backendType,
    });

    // Al cambiar cualquier filtro volvemos a la página 1
    const handleSearch = (val) => { setSearch(val); setCurrentPage(1); };
    const handleType = (val) => { setTypeFilter(val); setCurrentPage(1); };

    const handleClear = () => {
        setSearch("");
        setTypeFilter("Todos");
        setCurrentPage(1);
    };

    return (
        <>
            <CustomNavbar />

            <PropertiesHero
                search={search}
                typeFilter={typeFilter}
                totalResults={totalElements}
                onSearch={handleSearch}
                onTypeChange={handleType}
                onClear={handleClear}
            />

            <div style={{ backgroundColor: "#f8f9fa", minHeight: "60vh" }}>
                <PropertiesGrid
                    properties={properties}
                    onClear={handleClear}
                    onRetry={refetch}
                    currentPage={currentPage}
                    totalPages={totalPages}
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
