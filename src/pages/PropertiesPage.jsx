import { useState } from "react";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import { allProperties } from "../data/propertiesData";

/**
 * PropertiesPage
 * Gestiona filtros y paginación de propiedades.
 */
export default function PropertiesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("Todos");
    const [tagFilter, setTagFilter] = useState("Todos");
    const [currentPage, setCurrentPage] = useState(1);

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

    const filtered = allProperties.filter((p) => {
        const matchSearch =
            p.location.toLowerCase().includes(search.toLowerCase()) ||
            p.type.toLowerCase().includes(search.toLowerCase());
        const matchType = typeFilter === "Todos" || p.type === typeFilter;
        const matchTag = tagFilter === "Todos" || p.tag === tagFilter;
        return matchSearch && matchType && matchTag;
    });

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
