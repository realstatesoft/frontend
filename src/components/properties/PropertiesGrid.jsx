import { Container, Row, Col, Button } from "react-bootstrap";
import PropertyCard from "./PropertyCard";
import Pagination from "./Pagination";

const ITEMS_PER_PAGE = 8    ;


export default function PropertiesGrid({ properties, onClear, currentPage, onPageChange }) {
    const totalPages = Math.ceil(properties.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginated = properties.slice(start, start + ITEMS_PER_PAGE);

    if (properties.length === 0) {
        return (
            <Container className="py-5 text-center">
                <div style={{ fontSize: "3rem" }}>🏚️</div>
                <p className="text-muted mt-3">
                    No se encontraron propiedades con esos filtros.
                </p>
                <Button variant="outline-secondary" onClick={onClear}>
                    Limpiar filtros
                </Button>
            </Container>
        );
    }

    return (
        <Container className="pt-4 pb-2">
            
            <p className="text-muted mb-3" style={{ fontSize: "0.875rem" }}>
                Mostrando{" "}
                <strong>{start + 1}–{Math.min(start + ITEMS_PER_PAGE, properties.length)}</strong>{" "}
                de <strong>{properties.length}</strong> propiedades
            </p>

            <Row className="g-4">
                {paginated.map((property) => (
                    <Col key={property.id} xs={12} sm={6} md={4} lg={3}>
                        <PropertyCard property={property} />
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
