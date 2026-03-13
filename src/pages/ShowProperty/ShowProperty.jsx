import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Tab,
  Nav,
  Image,
  Stack,
  ButtonGroup,
  Dropdown,
  Spinner,
  Alert,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { CameraVideo, FileText, Whatsapp, Envelope, Link45deg, Pencil, Trash, Star, Share } from "react-bootstrap-icons";

import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import { useShowProperty } from "../../hooks/useShowProperty";
import { formatPrice } from "../../utils/priceFormat";
import "./show-property.scss";

export default function ShowProperty() {
  const BASE_URL = import.meta.env.DEPLOY_URL

  const {
    property,
    loading,
    actionLoading,
    error,
    isOwner,
    status,
    visibility,
    showConfirm,
    confirmData,
    hideConfirm,
    images,
    features,
    priceFormatted,
    propertyTypeLabel,
    mapUrl,
    formatTimeAgo,
    openChangeStatusConfirm,
    openChangeVisibilityConfirm,
    openDeleteConfirm,
    PROPERTY_STATUS_OPTIONS,
    PROPERTY_VISIBILITY_OPTIONS,
    copyLink
  } = useShowProperty();

  if (loading) {
    return (
      <>
        <CustomNavbar />
        <div className="property d-flex justify-content-center align-items-center py-5">
          <Spinner animation="border" variant="primary" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <CustomNavbar />
        <Container className="py-5">
          <Alert variant="danger">{error}</Alert>
        </Container>
        <Footer />
      </>
    );
  }

  if (!property) return null;

  return (
    <>
      <CustomNavbar />

      <div className="property">
        <ConfirmDialog
          show={showConfirm}
          onHide={hideConfirm}
          loading={actionLoading}
          {...confirmData}
        />

        <Container>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1>{property.title}</h1>
            <div className="d-flex gap-2 align-items-center mt-2">
              {isOwner && (
                <>
                  <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle size="sm" variant="success">
                      {status.label}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {PROPERTY_STATUS_OPTIONS.map((option) => (
                        <Dropdown.Item
                          key={option.value}
                          onClick={() => openChangeStatusConfirm(option)}
                        >
                          {option.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>

                  <Dropdown as={ButtonGroup}>
                    <Dropdown.Toggle size="sm" variant="secondary">
                      {visibility.label}
                    </Dropdown.Toggle>
                    <Dropdown.Menu>
                      {PROPERTY_VISIBILITY_OPTIONS.map((option) => (
                        <Dropdown.Item
                          key={option.value}
                          onClick={() => openChangeVisibilityConfirm(option)}
                        >
                          {option.label}
                        </Dropdown.Item>
                      ))}
                    </Dropdown.Menu>
                  </Dropdown>

                  <Button
                    size="sm"
                    variant="outline-primary"
                    className="d-flex align-items-center"
                    as={Link}
                    to={`/properties/${property.id}/edit`}
                  >
                    <Pencil size={16} className="property__icon-button"/> Editar
                  </Button>

                  <Button
                    size="sm"
                    variant="warning"
                    className="d-flex align-items-center"
                  >
                    <Star size={16} className="property__icon-button"/> Destacar
                  </Button>

                  <Button
                    size="sm"
                    variant="danger"
                    className="d-flex align-items-center"
                    onClick={openDeleteConfirm}
                  >
                    <Trash size={16} className="property__icon-button"/> Eliminar
                  </Button>
                </>
              )}
              <Dropdown as={ButtonGroup}>
                <Dropdown.Toggle size="sm" variant="primary">
                  <Share size={16} className="property__icon-button"/> Compartir
                </Dropdown.Toggle>
                <Dropdown.Menu>
                 <Dropdown.Item onClick={copyLink}>
                    <Link45deg size={16} className="property__icon-button"/> Copiar enlace
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="a"
                    href={`https://wa.me/?text=${encodeURIComponent(
                      `Encontré esta propiedad: ${BASE_URL}/properties/${property.id}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Whatsapp size={16} className="property__icon-button"/> Compartir por WhatsApp
                  </Dropdown.Item>

                  <Dropdown.Item
                    as="a"
                    href={`mailto:?subject=${encodeURIComponent(
                      "Mira esta propiedad"
                    )}&body=${encodeURIComponent(
                      `Te comparto esta propiedad:\n${BASE_URL}/properties/${property.id}`
                    )}`}
                  >
                    <Envelope size={16} className="property__icon-button"/> Compartir por Email
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </div>
          </div>
        </Container>

        {/* Gallery */}
        <Container className="pt-3 pb-2">
          <Row className="g-1">
            <Col xs={6} style={{ height: "420px" }}>
              <img
                src={images[0]}
                alt="Fachada"
                className="property__main-image"
              />
            </Col>
            <Col xs={6}>
              <Row className="g-1 h-100">
                {images.slice(1, 5).map((src, i) => (
                  <Col key={i} xs={6} style={{ height: "207px" }}>
                    <img
                      src={src}
                      alt={`Interior ${i + 1}`}
                      className={`property__thumb-image ${
                        i === 1
                          ? "radius-top-right-lg"
                          : i === 3
                          ? "radius-bottom-right-lg"
                          : ""
                      }`}
                    />
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        </Container>

        {/* Main Content */}
        <Container className="py-3">
          <Row>
            <Col lg={8}>
              <Stack
                direction="horizontal"
                gap={4}
                className="align-items-end flex-wrap mb-2"
              >
                <span className="property__price">{priceFormatted}</span>
                <Stack direction="horizontal" gap={4}>
                  {[
                    {
                      value: String(property.bedrooms ?? "-"),
                      label: "habitaciones",
                    },
                    {
                      value: String(property.bathrooms ?? "-"),
                      label: "baños",
                    },
                    {
                      value: String(
                        property.surfaceArea ?? property.builtArea ?? "-",
                      ),
                      label: "metros²",
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="property__stat-value">{stat.value}</div>
                      <div className="property__stat-label">{stat.label}</div>
                    </div>
                  ))}
                </Stack>
              </Stack>

              <p className="property__address">{property.address}</p>

              <Stack direction="horizontal" gap={2} className="flex-wrap mb-4">
                {[
                  propertyTypeLabel,
                  property.constructionYear &&
                    `Construido en ${property.constructionYear}`,
                  property.surfaceArea &&
                    property.price &&
                    `₲ ${formatPrice(
                      String(Math.round(property.price / property.surfaceArea)),
                    )}/m²`,
                ]
                  .filter(Boolean)
                  .map((label) => (
                    <Badge
                      key={label}
                      pill
                      bg="light"
                      text="secondary"
                      className="border-soft"
                      style={{
                        fontWeight: "400",
                        fontSize: "0.82rem",
                        padding: "7px 14px",
                      }}
                    >
                      {label}
                    </Badge>
                  ))}
              </Stack>

              <Tab.Container defaultActiveKey="descripcion">
                <Nav variant="tabs" className="mb-4 border-bottom-soft">
                  {[
                    { key: "descripcion", label: "Descripción" },
                    { key: "tours", label: "Tours y Planos" },
                    {
                      key: "caracteristicas",
                      label: "Datos y Características",
                    },
                  ].map((tab) => (
                    <Nav.Item key={tab.key}>
                      <Nav.Link
                        eventKey={tab.key}
                        style={{ fontSize: "0.9rem", color: "#555" }}
                      >
                        {tab.label}
                      </Nav.Link>
                    </Nav.Item>
                  ))}
                </Nav>

                <Tab.Content>
                  <Tab.Pane eventKey="descripcion">
                    <h5 className="property__section-title">Descripción</h5>
                    <p className="property__description">
                      {property.description || "Sin descripción."}
                    </p>

                    <div
                      className="rounded mt-4 border-soft"
                      style={{ height: "260px", overflow: "hidden" }}
                    >
                      <iframe
                        title="Mapa de la propiedad"
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0 }}
                        src={mapUrl}
                        allowFullScreen
                      />
                    </div>

                    <div className="property__meta-box mt-4">
                      {(property.createdAt ||
                        property.viewCount != null ||
                        property.favoriteCount != null) && (
                        <>
                          {property.createdAt && (
                            <>
                              Publicado{" "}
                              <strong>
                                {formatTimeAgo(property.createdAt)}
                              </strong>
                            </>
                          )}
                          {property.viewCount != null && (
                            <> &nbsp;|&nbsp; {property.viewCount} vistas</>
                          )}
                          {property.favoriteCount != null && (
                            <>
                              {" "}
                              &nbsp;|&nbsp; {property.favoriteCount} guardados
                            </>
                          )}
                          <br />
                        </>
                      )}
                      {property.updatedAt && (
                        <>
                          Revisado por última vez:{" "}
                          {formatTimeAgo(property.updatedAt)}
                          <br />
                          Actualizado hace: {formatTimeAgo(property.updatedAt)}
                          <br />
                        </>
                      )}
                      {property.ownerName && (
                        <>
                          Listado por: {property.ownerName}
                          <br />
                        </>
                      )}
                      {property.id && <>MLS#: {property.id}</>}
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="tours">
                    <h5 className="property__section-title">Tours y Planos</h5>
                    <Row className="g-4 mt-1">
                      {[
                        {
                          key: "tour3d",
                          label: "Tour 3D 360°",
                          Icon: CameraVideo,
                        },
                        {
                          key: "planos",
                          label: "Planos de la propiedad",
                          Icon: FileText,
                        },
                      ].map(({ key, label, Icon }) => (
                        <Col sm={6} key={key}>
                          <div className="property__tour-card">
                            <div className="mb-3">
                              <Icon size={36} color="#555" />
                            </div>
                            <p className="property__tour-label">{label}</p>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </Tab.Pane>

                  <Tab.Pane eventKey="caracteristicas">
                    <h5 className="property__section-title">
                      Datos y Características
                    </h5>
                    <Row className="g-4">
                      {features.length ? (
                        features.map((section, i) => (
                          <Col md={6} key={i}>
                            <div className="property__feature-title">
                              {section.title}
                            </div>
                            <ul className="list-unstyled mb-0">
                              {section.items.map((item, j) => (
                                <li key={j} className="property__feature-item">
                                  &bull; {item}
                                </li>
                              ))}
                            </ul>
                          </Col>
                        ))
                      ) : (
                        <Col>
                          <p className="text-muted">
                            No hay características cargadas.
                          </p>
                        </Col>
                      )}
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>

            <Col lg={4} className="mt-4 mt-lg-0">
              <div className="property__agent-card">
                <Image
                  src="https://randomuser.me/api/portraits/women/68.jpg"
                  alt="Propietario"
                  className="property__agent-avatar"
                />
                <p className="property__agent-name">
                  {property.ownerName || "Propietario"}
                </p>
                <p className="property__agent-exp">8 años de experiencia</p>
                <div className="mb-3">
                  <span className="property__stars">
                    &#9733;&#9733;&#9733;&#9733;&#9733;
                  </span>{" "}
                  <span className="property__reviews">4.8 (15k reseñas)</span>
                </div>
                <Button
                  variant="outline-secondary"
                  className="w-100 mb-2"
                  style={{ borderRadius: "8px" }}
                >
                  Contactar Agente
                </Button>
                <Button
                  variant="dark"
                  className="w-100"
                  style={{ borderRadius: "8px" }}
                >
                  Agendar Visita
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <Footer />
    </>
  );
}
