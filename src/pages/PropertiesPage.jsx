import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import PropertiesMap from "../components/properties/PropertiesMap";
import CompareFloatingBar from "../components/properties/CompareFloatingBar";
import PreferencesBanner, { shouldShowBanner } from "../components/preferences/PreferencesBanner";
import useProperties from "../hooks/useProperties";
import useFavoriteProperties from "../hooks/useFavoriteProperties";
import { useAuth } from "../hooks/useAuth";
import { PROPERTY_TYPE, AVAILABILITY } from "../constants/propertyEnums";
import usePropertyCompareStore, { MAX_COMPARE_PROPERTIES } from "../store/usePropertyCompareStore";

const PAGE_SIZE = 12;

/**
 * PropertiesPage
 * Gestiona filtros avanzados y paginación de propiedades con filtros server-side.
 */
export default function PropertiesPage() {
    const { isAuthenticated: authCheck, preferencesCompleted } = useAuth();
    const comparedProperties = usePropertyCompareStore((state) => state.comparedProperties);
    const toggleComparedProperty = usePropertyCompareStore((state) => state.toggleProperty);
    const clearComparedProperties = usePropertyCompareStore((state) => state.clearProperties);
    const locationState = useLocation().state || {};

    const [search, setSearch] = useState(locationState.search || "");
    const [typeFilter, setTypeFilter] = useState(locationState.typeFilter || "");
    const [availability, setAvailability] = useState(locationState.availability || "");
    const [minPrice, setMinPrice] = useState(locationState.minPrice || "");
    const [maxPrice, setMaxPrice] = useState(locationState.maxPrice || "");
    const [minBedrooms, setMinBedrooms] = useState(locationState.minBedrooms || "");
    const [minBathrooms, setMinBathrooms] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [bannerDismissed, setBannerDismissed] = useState(false);

    useEffect(() => {
        setSearch(locationState.search || "");
        setTypeFilter(locationState.typeFilter || "");
        setAvailability(locationState.availability || "");
        setMinPrice(locationState.minPrice || "");
        setMaxPrice(locationState.maxPrice || "");
        setMinBedrooms(locationState.minBedrooms || "");
    }, [locationState.search, locationState.typeFilter, locationState.availability, locationState.minPrice, locationState.maxPrice, locationState.minBedrooms]);

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
    const { favoriteIds, togglingIds, isAuthenticated, toggleFavorite } = useFavoriteProperties();

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

    // Determinar si mostrar el banner de preferencias
    const showBanner =
        !bannerDismissed &&
        shouldShowBanner(preferencesCompleted, authCheck);

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
                {/* Banner de preferencias (entre filtros y grilla) */}
                {showBanner && (
                    <div className="container pt-3">
                        <PreferencesBanner
                            onDismiss={() => setBannerDismissed(true)}
                        />
                    </div>
                )}

                {!loading && !error && properties?.length > 0 && (
                    <div className="properties-page__map-wrap">
                        <PropertiesMap properties={properties} />
                    </div>
                )}

                <PropertiesGrid
                    properties={properties}
                    onClear={handleClear}
                    onRetry={refetch}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    loading={loading}
                    error={error}
                    favoriteIds={favoriteIds}
                    togglingIds={togglingIds}
                    canToggleFavorite={isAuthenticated}
                    onToggleFavorite={toggleFavorite}
                    comparedPropertyIds={comparedProperties.map((property) => property.id)}
                    compareLimitReached={comparedProperties.length >= MAX_COMPARE_PROPERTIES}
                    onToggleCompare={toggleComparedProperty}
                    onPageChange={(page) => {
                        setCurrentPage(page);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                />

                <CompareFloatingBar
                    selectedProperties={comparedProperties}
                    maxProperties={MAX_COMPARE_PROPERTIES}
                    onClear={clearComparedProperties}
                />
            </div>

            <Footer />
        </>
    );
}
