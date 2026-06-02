import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Carousel, Card, Row, Col, Badge, Spinner } from "react-bootstrap";
import { StarFill } from "react-bootstrap-icons";
import { useTranslation } from "react-i18next";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";
import propertyService from "../../services/propertyService";

const getStatusColor = (status) => {
  switch (status) {
    case "SOLD":
    case "RENTED":
    case "RESERVED":
      return "#d32f2f";
    case "PENDING":
      return "#f57c00";
    default:
      return "#388e3c";
  }
};

const Properties = () => {
  const { t } = useTranslation("landing");
  const { formatPrice } = usePropertyPriceDisplay(0);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const getStatusLabel = (status) => {
    switch (status) {
      case "SOLD":
        return t("status.sold");
      case "RENTED":
        return "Alquilado";
      case "RESERVED":
        return t("status.reserved");
      case "PENDING":
        return "Pendiente";
      default:
        return t("status.available");
    }
  };

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const apiResponse = await propertyService.getFeatured({ limit: 12 });
        const responseData = apiResponse?.data;
        setProperties(Array.isArray(responseData) ? responseData : []);
      } catch (error) {
        console.error("Error fetching featured properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  const propertyGroups = Array.from(
    { length: Math.ceil(properties.length / 4) },
    (_, i) => properties.slice(i * 4, i * 4 + 4)
  );

  return (
    <>
      <div
        id="projects"
        style={{
          backgroundColor: "#f3f4f6",
          width: "100vw",
          marginLeft: "calc(-50vw + 50%)",
        }}
      >
        <Container className="py-5">
          <div className="text-center mx-auto mb-4" style={{ maxWidth: 650 }}>
            <h3 className="fw-bold mb-0" style={{ color: "var(--text-dark, #1f2937)" }}>
              {t("featured.title")}
            </h3>
          </div>
          <style>{`
            .custom-carousel .carousel-item {
              transition: transform 0.7s cubic-bezier(0.4, 0, 0.2, 1) !important;
            }
            .custom-carousel .carousel-control-prev,
            .custom-carousel .carousel-control-next {
              width: 45px;
              height: 45px;
              top: 40%;
              background-color: rgba(60, 60, 60, 0.5);
              border-radius: 50%;
              opacity: 1;
              transition: background-color 0.25s ease, transform 0.2s ease;
            }
            .custom-carousel .carousel-control-prev { left: -45px; }
            .custom-carousel .carousel-control-next { right: -45px; }
            .custom-carousel .carousel-control-prev:hover,
            .custom-carousel .carousel-control-next:hover {
              background-color: rgba(0,0,0,0.85);
              transform: scale(1.1);
            }
            .custom-carousel .carousel-indicators [data-bs-target] {
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background-color: #999;
              border: none;
              transition: background-color 0.3s ease, transform 0.3s ease;
            }
            .custom-carousel .carousel-indicators .active {
              background-color: #333;
              transform: scale(1.3);
            }
          `}</style>

          <div className="custom-carousel position-relative px-5">
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" variant="secondary" />
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-5 text-muted">
                No hay propiedades destacadas en este momento.
              </div>
            ) : (
              <Carousel indicators={true} variant="dark" controls={true} interval={5000} pause="hover">
                {propertyGroups.map((group, index) => (
                  <Carousel.Item key={index} className="px-3">
                    <Row className="mb-5 flex-md-nowrap overflow-hidden g-3">
                      {group.map((property) => (
                        <Col xs={6} sm={6} md={3} key={property.id} className="p-1">
                          <Link
                            to={`/properties/${property.id}`}
                            className="text-decoration-none text-dark d-block h-100"
                          >
                            <Card
                              className="border-0 shadow-sm rounded-4 overflow-hidden h-100"
                              style={{ cursor: "pointer", transition: "transform 0.2s" }}
                              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
                              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                            >
                              <div className="position-relative">
                                <Card.Img
                                  variant="top"
                                  src={
                                    property.primaryImageUrl ||
                                    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6"
                                  }
                                  width={400}
                                  height={200}
                                  style={{ aspectRatio: "2 / 1", objectFit: "cover", height: "auto" }}
                                  loading="lazy"
                                />
                              </div>

                              <Card.Body className="bg-white px-3 py-3">
                                <h5 className="fw-bold text-success mb-1">
                                  {formatPrice(property.price).label || "—"}
                                </h5>

                                <p
                                  className="text-muted mb-2 text-truncate"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  📍 {property.locationName || property.address || "Sin ubicación"}
                                </p>

                                <hr className="my-2" />

                                <div
                                  className="d-flex justify-content-between text-muted"
                                  style={{ fontSize: "0.85rem" }}
                                >
                                  <span>🛏 {property.bedrooms || 0}</span>
                                  <span>🚿 {property.bathrooms || 0}</span>
                                  <span>📐 {property.surfaceArea || 0} m²</span>
                                </div>
                              </Card.Body>
                            </Card>
                          </Link>
                        </Col>
                      ))}
                    </Row>
                  </Carousel.Item>
                ))}
              </Carousel>
            )}
          </div>
        </Container>
      </div>
    </>
  );
};

export default Properties;
