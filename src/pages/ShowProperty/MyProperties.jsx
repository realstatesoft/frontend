import { Col, Container, Row, Spinner, Button, Alert } from "react-bootstrap";
import { Link, useLocation, Navigate } from "react-router-dom";
import { Plus } from "react-bootstrap-icons";
import useMyProperties from "../../hooks/useMyProperties";
import { useAuth } from "../../hooks/useAuth";
import MyPropertyCard from "../../components/properties/MyPropertyCard";
import Navbar from "../../components/Landing/Navbar";

const PAGE_SIZE = 12;

export default function MyProperties() {
    const { isAuthenticated } = useAuth();
    const location = useLocation();
    const { properties, loading, error, refetch } = useMyProperties({
        page: 1,
        size: PAGE_SIZE,
    });

    // Usuario no autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return (
        <>
            <Navbar />

            <Container className="py-5">
                {/* Encabezado: título + botón Agregar */}
                <div className="mb-4">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h2
                            className="fw-bold mb-0"
                            style={{ color: "var(--dark, #1e293b)" }}
                        >
                            Mis Propiedades
                        </h2>

                        <Button
                            as={Link}
                            to="/create-property"
                            style={{
                                fontSize: "0.8rem",
                                background: "var(--primary, #2563eb)",
                                border: "none",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                padding: "8px 16px",
                            }}
                        >
                            <Plus size={18} />
                            Agregar
                        </Button>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" variant="primary" />
                        <p className="text-muted mt-3">Cargando propiedades...</p>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <Alert variant="danger" className="text-center">
                        <p className="mb-2">{error}</p>
                        <Button variant="outline-danger" size="sm" onClick={refetch}>
                            Reintentar
                        </Button>
                    </Alert>
                )}

                {/* Lista vacía */}
                {!loading && !error && properties.length === 0 && (
                    <div className="text-center text-muted py-5">
                        <p className="mt-3 mb-3">No tenés propiedades aún.</p>
                        <Button as={Link} to="/create-property" variant="primary">
                            <Plus className="me-2" />
                            Agregar primera propiedad
                        </Button>
                    </div>
                )}

                {/* Grid de propiedades */}
                {!loading && !error && properties.length > 0 && (
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {properties.map((property) => (
                            <Col key={property.id}>
                                <MyPropertyCard property={property} />
                            </Col>
                        ))}
                    </Row>
                )}
            </Container>
        </>
    );
}
