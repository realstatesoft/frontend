import { useState } from "react";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import useProperties from "../hooks/useProperties";
import { PROPERTY_TYPE, AVAILABILITY } from "../constants/propertyEnums";

const PAGE_SIZE = 12;

/**
 * PropertiesPage
 * Gestiona filtros avanzados y paginación de propiedades con filtros server-side.
 */
export default function PropertiesPage() {
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [availability, setAvailability] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [minBedrooms, setMinBedrooms] = useState("");
    const [minBathrooms, setMinBathrooms] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Convertir labels a valores enum del backend
    const backendType = typeFilter ? PROPERTY_TYPE[typeFilter] : undefined;
    const backendAvailability = availability ? AVAILABILITY[availability] : undefined;

    const { properties, loading, error, totalPages, totalElements, refetch } = useProperties({
        page: currentPage,
        size: PAGE_SIZE,
        search,
        propertyType: backendType,
        availability: backendAvailability,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
        minBathrooms: minBathrooms ? Number(minBathrooms) : undefined,
    });

    // Al cambiar cualquier filtro volvemos a la página 1
    const resetPage = () => setCurrentPage(1);

    const handleSearch = (val) => { setSearch(val); resetPage(); };
    const handleType = (val) => { setTypeFilter(val); resetPage(); };
    const handleAvailability = (val) => { setAvailability(val); resetPage(); };
    const handleMinPrice = (val) => { setMinPrice(val); resetPage(); };
    const handleMaxPrice = (val) => { setMaxPrice(val); resetPage(); };
    const handleMinBedrooms = (val) => { setMinBedrooms(val); resetPage(); };
    const handleMinBathrooms = (val) => { setMinBathrooms(val); resetPage(); };

    const handleClear = () => {
        setSearch("");
        setTypeFilter("");
        setAvailability("");
        setMinPrice("");
        setMaxPrice("");
        setMinBedrooms("");
        setMinBathrooms("");
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
                availability={availability}
                minPrice={minPrice}
                maxPrice={maxPrice}
                minBedrooms={minBedrooms}
                minBathrooms={minBathrooms}
                totalResults={totalElements}
                onSearch={handleSearch}
                onTypeChange={handleType}
                onAvailabilityChange={handleAvailability}
                onMinPriceChange={handleMinPrice}
                onMaxPriceChange={handleMaxPrice}
                onMinBedroomsChange={handleMinBedrooms}
                onMinBathroomsChange={handleMinBathrooms}
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
