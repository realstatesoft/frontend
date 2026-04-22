import { useState, useEffect, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Badge,
  Button,
  Tab,
  Nav,
  Stack,
  ButtonGroup,
  Dropdown,
  Spinner,
  Alert,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import { CameraVideo, Whatsapp, Envelope, Link45deg, Pencil, Trash, Star, Share, Flag } from "react-bootstrap-icons";

import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import PropertyContactCard from "../../components/Agents/PropertyContactCard";
import { useShowProperty } from "../../hooks/useShowProperty";
import { usePropertyPermissions } from "../../hooks/usePropertyPermissions";
import { formatPrice } from "../../utils/priceFormat";
import PropertySummaryCard from "../../components/properties/PropertySummaryCard/PropertySummaryCard";
import ReportPropertyModal from "../../components/properties/ReportPropertyModal";
import ReportUserModal from "../../components/users/ReportUserModal";
import PropertyStatusBadge from "../../components/properties/PropertyStatusBadge";
import PropertyModel3DViewer from "../../components/properties/PropertyModel3DViewer/PropertyModel3DViewer";
import PropertyVirtualTour from "../../components/properties/PropertyVirtualTour/PropertyVirtualTour";
import Property360Tour from "../../components/properties/Property360Tour/Property360Tour";
import RentCostBreakdown from "../../components/properties/RentCostBreakdown/RentCostBreakdown";
import PropertyFloorPlansViewer from "../../components/properties/PropertyFloorPlansViewer/PropertyFloorPlansViewer";
import "./show-property.scss";

export default function ShowProperty() {
  const BASE_URL = import.meta.env.VITE_DEPLOY_URL

  const {
    property,
    loading,
    actionLoading,
    error,
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
    similarProperties,
    loadingSimilar,
    copyLink,
    activeFlagCount,
    isAuthenticated,
    fetchActiveFlagCount
  } = useShowProperty();

  const [showReportModal, setShowReportModal] = useState(false);
  const [showReportUserModal, setShowReportUserModal] = useState(false);

  const {
    canChangeStatus,
    canChangeVisibility,
    canEdit,
    canDelete,
    canFeature,
    isOwner: isPropertyOwner,
  } = usePropertyPermissions(property);

  const [tourSubTab, setTourSubTab] = useState(null);
  const [tourConfig, setTourConfig] = useState(null);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Resetear estados cuando cambia la propiedad (navegacion entre propiedades similares)
  useEffect(() => {
    setTourSubTab(null);
    setTourConfig(null);
    setLoadingConfig(false);
  }, [property?.id]);

  // Determinar pestanas disponibles y subpestana inicial
  const hasModel = property?.media?.some(m => m.type === 'MODEL_3D');
  const scenes360 = useMemo(() => {
    return property?.media?.filter(m => m.type === 'IMAGE_360') || [];
  }, [property?.media]);
  const hasTour360 = property?.media?.some(m => m.type === 'VIRTUAL_TOUR_CONFIG') || scenes360.length > 0;

  useEffect(() => {
    if (!tourSubTab) {
      if (hasTour360) setTourSubTab('tour360');
      else if (hasModel) setTourSubTab('model3d');
    }
  }, [hasModel, hasTour360]);

  // Cargar configuracion de tour 360 si aplica
  useEffect(() => {
    const configMedia = property?.media?.find(m => m.type === 'VIRTUAL_TOUR_CONFIG');
    if (configMedia?.url) {
      setLoadingConfig(true);
      fetch(configMedia.url)
        .then(res => res.json())
        .then(data => setTourConfig(data))
        .catch(err => console.error("Error al cargar configuracion 360:", err))
        .finally(() => setLoadingConfig(false));
    } else {
      setTourConfig(null);
    }
  }, [property?.id, property?.media]);

  // Generar config de respaldo si no hay una oficial pero si hay fotos 360
  // Usamos useMemo para evitar que el visor se reinicie en cada render del padre
  const finalTourConfig = useMemo(() => {
    if (tourConfig) return tourConfig;
    if (!loadingConfig && scenes360.length > 0) {
      return {
        nodes: scenes360.map((m, idx) => ({
          id: `media_${m.id || idx}`,
          panorama: m.url,
          name: m.title || `Habitacion ${idx + 1}`,
          links: []
        }))
      };
    }
    return null;
  }, [tourConfig, loadingConfig, scenes360]);

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

  // Determinar si es una propiedad para alquilar
  const showRentCost = property.category === 'RENT' || property.category === 'SALE_OR_RENT';

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
          {activeFlagCount > 0 && (
            <Alert variant="warning" className="d-flex align-items-center mb-4">
              <Flag size={20} className="me-2" />
              <span>Esta propiedad tiene reportes activos de otros usuarios. Procede con precaución.</span>
            </Alert>
          )}

          {/* Header */}
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h1>{property.title}</h1>
            <div className="d-flex gap-2 align-items-center mt-2">
              {/* Estado general — ADMIN: selector funcional | Owner/Agent: badge de solo lectura */}
              {(canChangeStatus || canEdit) && (
                canChangeStatus ? (
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
                ) : (
                  <PropertyStatusBadge status={status} />
                )
              )}

              {/* Visibilidad — owner o ADMIN */}
              {canChangeVisibility && (
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
              )}

              {/* Editar — owner o ADMIN  */}
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="d-flex align-items-center"
                  as={Link}
                  to={`/properties/${property.id}/edit`}
                >
                  <Pencil size={16} className="property__icon-button" /> Editar
                </Button>
              )}

              {/* Destacar — cualquier usuario autenticado */}
              {canFeature && (
                <Button
                  size="sm"
                  variant="warning"
                  className="d-flex align-items-center"
                >
                  <Star size={16} className="property__icon-button" /> Destacar
                </Button>
              )}

              {/* Eliminar — owner o ADMIN */}
              {canDelete && (
                <Button
                  size="sm"
                  variant="danger"
                  className="d-flex align-items-center"
                  onClick={openDeleteConfirm}
                >
                  <Trash size={16} className="property__icon-button" /> Eliminar
                </Button>
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
                      `Encontre esta propiedad: ${BASE_URL}/properties/${property.id}`
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
                      label: "banos",
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
                    `~ ${formatPrice(
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
                    { key: "descripcion", label: "Descripcion" },
                    { key: "tours", label: "Tours y Planos" },
                    {
                      key: "caracteristicas",
                      label: "Datos y Caracteristicas",
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
                    <h5 className="property__section-title">Descripcion</h5>
                    <p className="property__description">
                      {property.description || "Sin descripcion."}
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
                          Revisado por ultima vez:{" "}
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
                    <div className="d-flex justify-content-between align-items-center mb-4">
                      <h5 className="property__section-title mb-0">Recorridos e Interaccion</h5>
                      {(hasModel || hasTour360) && (
                        <ButtonGroup size="sm">
                          {hasTour360 && (
                            <Button 
                              variant={tourSubTab === 'tour360' ? 'primary' : 'outline-primary'}
                              onClick={() => setTourSubTab('tour360')}
                            >
                              Tour 360°
                            </Button>
                          )}
                          {hasModel && (
                            <Button 
                              variant={tourSubTab === 'model3d' ? 'primary' : 'outline-primary'}
                              onClick={() => setTourSubTab('model3d')}
                            >
                              Plano 3D
                            </Button>
                          )}
                        </ButtonGroup>
                      )}
                    </div>
                    
                    {/* Contenedor de Subpestañas */}
                    <div className="property__tour-viewport">
                      {tourSubTab === 'tour360' && (
                        loadingConfig ? (
                          <div className="d-flex flex-column align-items-center py-5">
                            <Spinner animation="border" size="sm" className="mb-2" />
                            <span className="text-muted">Iniciando recorrido...</span>
                          </div>
                        ) : finalTourConfig ? (
                          <Property360Tour config={finalTourConfig} />
                        ) : (
                          <Alert variant="info">Cargando configuración del recorrido...</Alert>
                        )
                      )}

                      {tourSubTab === 'model3d' && (
                        property.media?.filter(m => m.type === 'MODEL_3D').map((model, idx) => (
                          <PropertyModel3DViewer 
                            key={model.id || model.url || idx}
                            src={model.url}
                            title={model.title || "Modelo 3D Interactivo"}
                            poster={images[0]}
                          />
                        ))
                      )}

                      {/* Si no hay ninguno, mostrar empty state */}
                      {!hasModel && !hasTour360 && (
                        <div className="property__empty-3d">
                          <div className="property__empty-3d-box">
                            <CameraVideo size={48} className="mb-3 text-muted" />
                            <p className="mb-1 fw-bold">No hay recorridos disponibles</p>
                            <p className="text-muted small">Esta propiedad aun no cuenta con contenido 360 o modelos 3D.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4">
                      <h6 className="property__section-title mb-3" style={{ fontSize: "0.95rem" }}>
                        Planos de la propiedad
                      </h6>
                      <PropertyFloorPlansViewer propertyId={property.id} />
                    </div>
                  </Tab.Pane>

                  <Tab.Pane eventKey="caracteristicas">
                    <h5 className="property__section-title">
                      Datos y Caracteristicas
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
                            No hay caracteristicas cargadas.
                          </p>
                        </Col>
                      )}
                    </Row>
                  </Tab.Pane>
                </Tab.Content>
              </Tab.Container>
            </Col>

            <Col lg={4} className="mt-4 mt-lg-0">
              <PropertyContactCard property={property} />

              {showRentCost && (
                <div className="mt-4">
                  <RentCostBreakdown propertyId={property.id} />
                </div>
              )}

              {isAuthenticated && (
                <div className="mt-4 text-center d-flex flex-column align-items-center gap-2">
                  <Button 
                    variant="link" 
                    className="text-muted d-inline-flex align-items-center"
                    onClick={() => setShowReportModal(true)}
                    style={{ textDecoration: 'none', fontSize: '0.9rem', padding: 0 }}
                  >
                    <Flag className="me-2" /> Reportar propiedad
                  </Button>
                  {!isPropertyOwner && (property.ownerId || property.userId) && (
                    <Button 
                      variant="link" 
                      className="text-muted d-inline-flex align-items-center"
                      onClick={() => setShowReportUserModal(true)}
                      style={{ textDecoration: 'none', fontSize: '0.9rem', padding: 0 }}
                    >
                      <Flag className="me-2" /> Reportar usuario
                    </Button>
                  )}
                </div>
              )}
            </Col>
          </Row>
          
          <h5 className="property__section-title mt-5 mb-3">
            Propiedades similares
          </h5>

          {loadingSimilar ? (
            <div className="d-flex justify-content-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : similarProperties?.length > 0 ? (
            <Row className="g-3 mx-0">
              {similarProperties.map((similar) => (
                <Col key={similar.id} xs={6} sm={4} lg={2}>
                  <PropertySummaryCard property={similar} />
                </Col>
              ))}
            </Row>
          ) : (
            <p className="text-muted">No se encontraron propiedades similares.</p>
          )}
          
        </Container>
      </div>

      <ReportPropertyModal 
        propertyId={property.id} 
        isOpen={showReportModal} 
        onClose={() => setShowReportModal(false)}
        onSuccess={() => fetchActiveFlagCount && fetchActiveFlagCount()}
      />

      <ReportUserModal
        reportedUser={{ id: property.ownerId || property.userId, name: property.ownerName || `Usuario #${property.ownerId || property.userId}` }}
        open={showReportUserModal}
        onClose={() => setShowReportUserModal(false)}
      />

      <Footer />
    </>
  );
} 