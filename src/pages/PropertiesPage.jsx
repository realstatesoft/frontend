import { useMemo, useState } from "react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { ArrowUp } from "react-bootstrap-icons";
import CustomNavbar from "../components/Landing/Navbar";
import Footer from "../components/Landing/Footer";
import PropertiesHero from "../components/properties/PropertiesHero";
import PropertiesGrid from "../components/properties/PropertiesGrid";
import LazyPropertiesMap from "../components/properties/LazyPropertiesMap";
import CompareFloatingBar from "../components/properties/CompareFloatingBar";
import PreferencesBanner, { shouldShowBanner } from "../components/preferences/PreferencesBanner";
import useProperties from "../hooks/useProperties";
import useFavoriteProperties from "../hooks/useFavoriteProperties";
import useDebounce from "../hooks/useDebounce";
import { useAuth } from "../hooks/useAuth";
import { PROPERTY_TYPE, AVAILABILITY, CATEGORY } from "../constants/propertyEnums";
import useCurrencyStore from "../store/useCurrencyStore";
import useExchangeRates from "../hooks/useExchangeRates";
import { convertPriceFilterToPyg } from "../utils/propertyPriceFormatter";
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

    const [search, setSearch] = useState(locationState.search ?? "");
    const [typeFilter, setTypeFilter] = useState(locationState.typeFilter ?? "");
    const [saleRent, setSaleRent] = useState(locationState.saleRent ?? locationState.transactionIntent ?? "");
    const [availability, setAvailability] = useState(locationState.availability ?? "");
    const [minPrice, setMinPrice] = useState(locationState.minPrice ?? "");
    const [maxPrice, setMaxPrice] = useState(locationState.maxPrice ?? "");
    const [minBedrooms, setMinBedrooms] = useState(locationState.minBedrooms ?? "");
    const [minBathrooms, setMinBathrooms] = useState(locationState.minBathrooms ?? "");
    const [currentPage, setCurrentPage] = useState(1);
    const [bannerDismissed, setBannerDismissed] = useState(false);
    const [drawnArea, setDrawnArea] = useState(null);
    const selectedCurrency = useCurrencyStore((state) => state.selectedCurrency);
    const { data: exchangeRates } = useExchangeRates({ enabled: true, staleTime: 10 * 60 * 1000, retry: 1 });
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 400) {
                setShowScrollTop(true);
            } else {
                setShowScrollTop(false);
            }
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const debouncedSearch = useDebounce(search, 200);

    useEffect(() => {
        setSearch(locationState.search ?? "");
        setTypeFilter(locationState.typeFilter ?? "");
        setSaleRent(locationState.saleRent ?? locationState.transactionIntent ?? "");
        setAvailability(locationState.availability ?? "");
        setMinPrice(locationState.minPrice ?? "");
        setMaxPrice(locationState.maxPrice ?? "");
        setMinBedrooms(locationState.minBedrooms ?? "");
        setMinBathrooms(locationState.minBathrooms ?? "");
        setCurrentPage(1);
    }, [locationState.search, locationState.typeFilter, locationState.saleRent, locationState.transactionIntent, locationState.availability, locationState.minPrice, locationState.maxPrice, locationState.minBedrooms, locationState.minBathrooms]);

    // Convertir labels a valores enum del backend
    const backendType = typeFilter ? PROPERTY_TYPE[typeFilter] : undefined;
    const backendCategory = saleRent ? CATEGORY[saleRent] : undefined;
    const backendAvailability = availability ? AVAILABILITY[availability] : undefined;

    const convertedPriceFilters = useMemo(() => {
        const minPriceConversion =
            minPrice !== "" ? convertPriceFilterToPyg(minPrice, selectedCurrency, exchangeRates) : null;
        const maxPriceConversion =
            maxPrice !== "" ? convertPriceFilterToPyg(maxPrice, selectedCurrency, exchangeRates) : null;
        const shouldOmitMinPrice =
            minPriceConversion?.fallbackToPyg && selectedCurrency !== "PYG";
        const shouldOmitMaxPrice =
            maxPriceConversion?.fallbackToPyg && selectedCurrency !== "PYG";

        return {
            minPrice: shouldOmitMinPrice ? null : minPriceConversion?.convertedAmount,
            maxPrice: shouldOmitMaxPrice ? null : maxPriceConversion?.convertedAmount,
        };
    }, [minPrice, maxPrice, selectedCurrency, exchangeRates]);

    const priceConversionAvailable = useMemo(() => {
        if (selectedCurrency === "PYG") return true;
        const probe = convertPriceFilterToPyg(1, selectedCurrency, exchangeRates);
        return probe?.convertedAmount != null;
    }, [selectedCurrency, exchangeRates]);

    const { properties, loading, error, totalPages, totalElements, refetch } = useProperties({
        page: currentPage,
        size: PAGE_SIZE,
        search: debouncedSearch,
        propertyType: backendType,
        category: backendCategory,
        availability: backendAvailability,
        minPrice: convertedPriceFilters.minPrice,
        maxPrice: convertedPriceFilters.maxPrice,
        minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
        minBathrooms: minBathrooms ? Number(minBathrooms) : undefined,
        geoFilter: drawnArea,
    });

    // Query separada para el mapa: trae todos los que cumplen el filtro (sin paginar)
    const { properties: mapProperties } = useProperties({
        page: 1,
        size: 500,
        search: debouncedSearch,
        propertyType: backendType,
        category: backendCategory,
        availability: backendAvailability,
        minPrice: convertedPriceFilters.minPrice,
        maxPrice: convertedPriceFilters.maxPrice,
        minBedrooms: minBedrooms ? Number(minBedrooms) : undefined,
        minBathrooms: minBathrooms ? Number(minBathrooms) : undefined,
        geoFilter: drawnArea,
    });
    const { favoriteIds, togglingIds, isAuthenticated, toggleFavorite } = useFavoriteProperties();

    // Al cambiar cualquier filtro volvemos a la página 1
    const resetPage = () => setCurrentPage(1);

    const handleAreaDrawn = (area) => { setDrawnArea(area); setCurrentPage(1); };
    const handleAreaCleared = () => { setDrawnArea(null); setCurrentPage(1); };

    const handleSearch = (val) => { setSearch(val); resetPage(); };
    const handleType = (val) => { setTypeFilter(val); resetPage(); };
    const handleSaleRent = (val) => { setSaleRent(val); resetPage(); };
    const handleAvailability = (val) => { setAvailability(val); resetPage(); };
    const handleMinPrice = (val) => { setMinPrice(val); resetPage(); };
    const handleMaxPrice = (val) => { setMaxPrice(val); resetPage(); };
    const handleMinBedrooms = (val) => { setMinBedrooms(val); resetPage(); };
    const handleMinBathrooms = (val) => { setMinBathrooms(val); resetPage(); };

    const handleClear = () => {
        setSearch("");
        setTypeFilter("");
        setSaleRent("");
        setAvailability("");
        setMinPrice("");
        setMaxPrice("");
        setMinBedrooms("");
        setMinBathrooms("");
        setDrawnArea(null);
        setCurrentPage(1);
    };

    // Determinar si mostrar el banner de preferencias
    const showBanner =
        !bannerDismissed &&
        shouldShowBanner(preferencesCompleted, authCheck);

    return (
        <div className="bg-light min-vh-100 d-flex flex-column">
            <CustomNavbar />

            <PropertiesHero
                search={search}
                category={saleRent}
                typeFilter={typeFilter}
                availability={availability}
                minPrice={minPrice}
                maxPrice={maxPrice}
                priceCurrency={selectedCurrency}
                priceConversionAvailable={priceConversionAvailable}
                minBedrooms={minBedrooms}
                minBathrooms={minBathrooms}
                totalResults={totalElements}
                onSearch={handleSearch}
                onCategoryChange={handleSaleRent}
                onTypeChange={handleType}
                onAvailabilityChange={handleAvailability}
                onMinPriceChange={handleMinPrice}
                onMaxPriceChange={handleMaxPrice}
                onMinBedroomsChange={handleMinBedrooms}
                onMinBathroomsChange={handleMinBathrooms}
                onClear={handleClear}
            />

            <div className="container-fluid px-0 flex-grow-1 row mx-0">
                {/* Lado del Mapa (Izquierda) - Sticky */}
                <div className="d-none d-lg-block col-lg-6 p-3" style={{ position: "sticky", top: 0, height: "100vh" }}>
                    <div className="h-100 w-100 position-relative" style={{ borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 50px rgba(15, 23, 42, 0.1)" }}>
                        <LazyPropertiesMap
                            properties={mapProperties || []}
                            isSplit={true}
                            drawMode={true}
                            onAreaDrawn={handleAreaDrawn}
                            onAreaCleared={handleAreaCleared}
                            drawActive={drawnArea}
                        />

                        {/* Botón flotante "Limpiar área" */}
                        {drawnArea && (
                            <button
                                onClick={handleAreaCleared}
                                className="position-absolute btn btn-sm btn-light border shadow-sm"
                                style={{ top: 12, right: 12, zIndex: 1001 }}
                            >
                                ✕ Limpiar área
                            </button>
                        )}
                        
                        {/* Overlay semi-transparente cuando está cargando pero ya hay mapa */}
                        {loading && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.6)", zIndex: 1000 }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        )}
                        {!loading && !error && (!properties || properties.length === 0) && (
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.8)", zIndex: 1000 }}>
                                <p className="text-muted fw-semibold">No hay propiedades que coincidan con la búsqueda.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lado de Resultados (Derecha) - Scroll normal */}
                <div id="properties-list-container" className="col-12 col-lg-6 pb-5 pt-3">
                    {/* Banner de preferencias */}
                    {showBanner && (
                        <div className="px-3 px-lg-4 mb-3">
                            <PreferencesBanner
                                onDismiss={() => setBannerDismissed(true)}
                            />
                        </div>
                    )}

                    {/* Mapa en móvil */}
                    <div className="d-block d-lg-none px-3 mb-4">
                        <div className="position-relative" style={{ height: "300px", borderRadius: "24px", overflow: "hidden", boxShadow: "0 24px 50px rgba(15, 23, 42, 0.1)" }}>
                            <LazyPropertiesMap
                                properties={mapProperties || []}
                                isSplit={true}
                                drawMode={true}
                                onAreaDrawn={handleAreaDrawn}
                                onAreaCleared={handleAreaCleared}
                                drawActive={drawnArea}
                            />

                            {drawnArea && (
                                <button
                                    onClick={handleAreaCleared}
                                    className="position-absolute btn btn-sm btn-light border shadow-sm"
                                    style={{ top: 8, right: 8, zIndex: 1001 }}
                                >
                                    ✕ Limpiar área
                                </button>
                            )}
                            
                            {loading && (
                                <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "rgba(255,255,255,0.6)", zIndex: 1000 }}>
                                    <div className="spinner-border text-primary" role="status" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="px-lg-2">
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
                    </div>
                </div>
            </div>

            <Footer />

            <CompareFloatingBar
                selectedProperties={comparedProperties}
                maxProperties={MAX_COMPARE_PROPERTIES}
                onClear={clearComparedProperties}
            />

            {showScrollTop && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                    className="btn btn-primary rounded-circle shadow-lg"
                    style={{
                        position: "fixed",
                        bottom: "30px",
                        right: "30px",
                        width: "50px",
                        height: "50px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1000,
                        transition: "all 0.3s ease",
                    }}
                    aria-label="Volver arriba"
                >
                    <ArrowUp size={24} />
                </button>
            )}
        </div>
    );
}
