import { Container, Row, Col, Spinner, Alert, Button } from "react-bootstrap";
import { ChevronDown } from "react-bootstrap-icons";
import { Link } from "react-router-dom";
import CustomNavbar from "../../components/Landing/Navbar";
import FavoritePropertyCard from "../../components/properties/FavoritePropertyCard";
import useMyFavoriteProperties from "../../hooks/useMyFavoriteProperties";
import { useAuth } from "../../hooks/useAuth";

export default function MyFavoriteProperties() {
  const { isAuthenticated } = useAuth();
  const {
    properties: favorites,
    loading,
    error,
    totalElements,
    removingIds,
    removeFavorite,
    refetch,
  } = useMyFavoriteProperties({ page: 1, size: 40 });
  const total = totalElements;

  if (!isAuthenticated) {
    return (
      <>
        <CustomNavbar />
        <Container className="py-5">
          <Alert variant="info" className="text-center">
            <p className="mb-3">Debes iniciar sesión para ver tus favoritos.</p>
            <Button as={Link} to="/login" variant="primary">
              Iniciar sesión
            </Button>
          </Alert>
        </Container>
      </>
    );
  }

  return (
    <>
      <CustomNavbar />

      <Container className="py-5">
        {/* Título y subtítulo */}
        <div className="mb-4">
          <h2
            className="fw-bold mb-1"
            style={{ color: "var(--dark, #1e293b)", fontSize: "1.75rem" }}
          >
            Propiedades Favoritas
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
            Tienes {total} {total === 1 ? "propiedad guardada" : "propiedades guardadas"}
          </p>
        </div>

        {/* Barra de filtros y ordenamiento */}
        <div
          className="d-flex flex-wrap align-items-center gap-3 mb-4 py-2"
          style={{ borderBottom: "1px solid #eee" }}
        >
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Filtrar por estado
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              style={{ borderRadius: "8px" }}
            >
              Todas
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted" style={{ fontSize: "0.875rem" }}>
              Ordenar por
            </span>
            <button
              type="button"
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
              style={{ borderRadius: "8px" }}
            >
              Fecha Agregada
              <ChevronDown size={14} />
            </button>
          </div>
          <div className="ms-auto text-muted" style={{ fontSize: "0.875rem" }}>
            Mostrando {total} de {total} propiedades
          </div>
        </div>

        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="text-muted mt-3">Cargando favoritos...</p>
          </div>
        )}

        {!loading && error && (
          <Alert variant="danger" className="text-center">
            <p className="mb-2">{error}</p>
            <Button variant="outline-danger" size="sm" onClick={refetch}>
              Reintentar
            </Button>
          </Alert>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div className="text-center text-muted py-5">
            <p className="mb-2">Aún no tienes propiedades favoritas.</p>
            <Button as={Link} to="/properties" variant="outline-primary">
              Explorar propiedades
            </Button>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <Row xs={1} sm={2} lg={2} className="g-4">
            {favorites.map((property) => (
              <Col key={property.id}>
                <FavoritePropertyCard
                  property={property}
                  removing={removingIds.includes(property.id)}
                  onRemoveFavorite={removeFavorite}
                />
              </Col>
            ))}
          </Row>
        )}
      </Container>
    </>
  );
}
