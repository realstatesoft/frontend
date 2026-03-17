import { Container, Row, Col } from "react-bootstrap";
import { ChevronDown } from "react-bootstrap-icons";
import CustomNavbar from "../../components/Landing/Navbar";
import FavoritePropertyCard from "../../components/properties/FavoritePropertyCard";

/**
 * Datos hardcodeados para la pantalla de favoritos.
 * En el futuro se obtendrán del API de favoritos.
 */
const HARDCODED_FAVORITES = [
  {
    id: 1,
    title: "Casa moderna en Palermo",
    price: 850000,
    status: "PUBLISHED",
    propertyType: "HOUSE",
    address: "Thames 1234, Palermo, CABA",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 150,
    primaryImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600",
    agentName: "María González",
    agentPhone: "+54 11 1234-5678",
    dateAdded: "14 de enero de 2024",
  },
  {
    id: 2,
    title: "Casa familiar en San Isidro",
    price: 1200000,
    status: "SOLD",
    propertyType: "HOUSE",
    address: "Av. Libertador 4500, San Isidro",
    bedrooms: 4,
    bathrooms: 3,
    surfaceArea: 220,
    primaryImageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=600",
    agentName: "Carlos Rodríguez",
    agentPhone: "+54 11 9876-5432",
    dateAdded: "10 de enero de 2024",
  },
  {
    id: 3,
    title: "Departamento luminoso en Recoleta",
    price: 650000,
    status: "PUBLISHED",
    propertyType: "APARTMENT",
    address: "Av. Santa Fe 2800, Recoleta",
    bedrooms: 2,
    bathrooms: 2,
    surfaceArea: 95,
    primaryImageUrl: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=600",
    agentName: "Ana Martínez",
    agentPhone: "+54 11 5555-1234",
    dateAdded: "8 de enero de 2024",
  },
  {
    id: 4,
    title: "Casa con jardín en Belgrano",
    price: 980000,
    status: "PUBLISHED",
    propertyType: "HOUSE",
    address: "Cabildo 3200, Belgrano",
    bedrooms: 3,
    bathrooms: 2,
    surfaceArea: 180,
    primaryImageUrl: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=600",
    agentName: "María González",
    agentPhone: "+54 11 1234-5678",
    dateAdded: "5 de enero de 2024",
  },
];

export default function MyFavoriteProperties() {
  const favorites = HARDCODED_FAVORITES;
  const total = favorites.length;

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

        {/* Grid de propiedades favoritas */}
        <Row xs={1} sm={2} lg={2} className="g-4">
          {favorites.map((property) => (
            <Col key={property.id}>
              <FavoritePropertyCard property={property} />
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );
}
