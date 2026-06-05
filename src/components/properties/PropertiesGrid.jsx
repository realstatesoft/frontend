import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { LuSearchX } from "react-icons/lu";
import PropertyCard from "./PropertyCard";
import Pagination from "./Pagination";
import HouseLoader from "./HouseLoader";

const ITEMS_PER_PAGE = 12;

export default function PropertiesGrid({
    properties,
    onClear,
    onRetry,
    currentPage,
    onPageChange,
    loading = false,
    fetching = false,
    error = null,
    totalPages: externalTotalPages,
    favoriteIds = [],
    togglingIds = [],
    canToggleFavorite = false,
    onToggleFavorite,
    comparedPropertyIds = [],
    onToggleCompare,
    compareLimitReached = false,
}) {
    const { t } = useTranslation("properties");
    
    // Indica si estamos cargando datos pero ya tenemos algo que mostrar (keepPreviousData)
    const isNavigating = fetching && !loading && properties.length > 0;
    
    const hasExternalPagination = externalTotalPages != null && externalTotalPages > 0;
    
    const totalPages = hasExternalPagination 
        ? externalTotalPages 
        : Math.ceil(properties.length / ITEMS_PER_PAGE);

    const paginated = hasExternalPagination
            ? properties
            : properties.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
            );

    if (loading && properties.length === 0) {
        return (
            <Container className="py-5 text-center" style={{ minHeight: "300px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <Spinner animation="border" variant="primary" role="status" />
                <p className="text-muted mt-3">{t("results.loading")}</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger" className="text-center">
                    <p className="mb-2">{error}</p>
                    <Button variant="outline-danger" size="sm" onClick={onRetry ?? onClear}>
                        {t("results.retry")}
                    </Button>
                </Alert>
            </Container>
        );
    }

    if (!fetching && properties.length === 0) {
        return (
            <Container className="py-5 text-center d-flex flex-column align-items-center justify-content-center" style={{ minHeight: "400px" }}>
                <div 
                    className="mb-4 d-flex align-items-center justify-content-center"
                    style={{ 
                        width: "80px", 
                        height: "80px", 
                        borderRadius: "24px", 
                        backgroundColor: "var(--light, #f8fafc)",
                        color: "var(--text-muted, #94a3b8)"
                    }}
                >
                    <LuSearchX size={40} />
                </div>
                <h4 className="fw-bold mb-2">{t("results.emptyTitle")}</h4>
                <p className="text-muted mb-4" style={{ maxWidth: "300px" }}>
                    {t("results.empty")}
                </p>
                <Button 
                    variant="primary" 
                    onClick={onClear}
                    style={{ borderRadius: "12px", padding: "10px 24px", fontWeight: "600" }}
                >
                    {t("search.clearFilters")}
                </Button>
            </Container>
        );
    }

    const gridStyle = (loading || isNavigating)
        ? { opacity: 0.5, pointerEvents: "none", transition: "opacity 0.3s ease" }
        : { transition: "opacity 0.3s ease" };

    return (
        <Container className="pt-4 pb-2 position-relative" id="properties-grid-container">
            {/* Overlay de carga para transiciones suaves entre páginas */}
            {isNavigating && (
                <div
                    className="position-absolute w-100 h-100 d-flex flex-column align-items-center justify-content-start"
                    style={{
                        top: 0,
                        left: 0,
                        zIndex: 100,
                        backgroundColor: "rgba(255, 255, 255, 0.7)",
                        backdropFilter: "blur(8px)",
                        borderRadius: "24px",
                        transition: "all 0.3s ease",
                        paddingTop: "100px" // Posición elevada para visibilidad inmediata
                    }}
                >
                    <HouseLoader />
                </div>
            )}

            <div style={gridStyle}>
                <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
                    {t("results.showing", { count: paginated.length })}
                </p>

                <Row id="properties-cards-start" className="g-4">
                    {paginated.map((property, index) => (
                        <Col 
                            key={property.id} 
                            xs={12} sm={6} xl={6} xxl={4}
                            style={{ 
                                animation: `fadeInUp 0.8s var(--ease-out) ${index * 0.05}s forwards`,
                                opacity: 0
                            }}
                        >
                            <PropertyCard
                                property={property}
                                isFavorite={favoriteIds.includes(property.id)}
                                isFavoriteLoading={togglingIds.includes(property.id)}
                                canToggleFavorite={canToggleFavorite}
                                onToggleFavorite={onToggleFavorite}
                                isCompared={comparedPropertyIds.includes(property.id)}
                                onToggleCompare={onToggleCompare}
                                compareDisabled={compareLimitReached}
                            />
                        </Col>
                    ))}
                </Row>

                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={onPageChange}
                    disabled={fetching}
                />
            </div>
        </Container>
    );
}
