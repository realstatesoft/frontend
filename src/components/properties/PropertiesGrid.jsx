import { Container, Row, Col, Button, Spinner, Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import PropertyCard from "./PropertyCard";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 8;

export default function PropertiesGrid({
    properties,
    onClear,
    onRetry,
    currentPage,
    onPageChange,
    loading = false,
    error = null,
    totalPages: externalTotalPages,
    favoriteIds = [],
    togglingIds = [],
    canToggleFavorite = false,
    onToggleFavorite,
}) {
    const { t } = useTranslation("properties");
    // Si se pasa totalPages externo (del backend), usarlo; sino calcular client-side
    const totalPages =
        externalTotalPages != null
            ? externalTotalPages
            : Math.ceil(properties.length / ITEMS_PER_PAGE);

    // Si la paginación es client-side, paginar acá; sino mostrar todo (ya viene paginado)
    const paginated =
        externalTotalPages != null
            ? properties
            : properties.slice(
                (currentPage - 1) * ITEMS_PER_PAGE,
                (currentPage - 1) * ITEMS_PER_PAGE + ITEMS_PER_PAGE
            );

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" variant="primary" />
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

    if (properties.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div style={{ fontSize: "3rem" }}>🏚️</div>
                <p className="text-muted mt-3">
                    {t("results.empty")}
                </p>
                <Button variant="outline-secondary" onClick={onClear}>
                    {t("search.clearFilters")}
                </Button>
            </Container>
        );
    }


    return (
        <Container className="pt-4 pb-2">
            <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
                {t("results.showing", { count: paginated.length })}
            </p>

            <Row className="g-4">
                {paginated.map((property) => (
                    <Col key={property.id} xs={12} sm={6} md={4} lg={3}>
                        <PropertyCard
                            property={property}
                            isFavorite={favoriteIds.includes(property.id)}
                            isFavoriteLoading={togglingIds.includes(property.id)}
                            canToggleFavorite={canToggleFavorite}
                            onToggleFavorite={onToggleFavorite}
                        />
                    </Col>
                ))}
            </Row>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={onPageChange}
            />
        </Container>
    );
}
