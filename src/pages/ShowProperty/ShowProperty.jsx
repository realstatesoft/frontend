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
} from "react-bootstrap";
import "./show-property.scss";

// SAMPLE DATA borrar despues ===============================================
const propertyImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800&q=80",
  "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&q=80",
  "https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=400&q=80",
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80",
];

const features = [
  {
    title: "Dormitorios y baños",
    items: ["Dormitorios: 3", "Baños: 2", "Baños completos: 2"],
  },
  {
    title: "Dormitorio principal",
    items: [
      "Características: Ventilador(es) de techo, lavabos dobles, baño en suite, bañera de jardín/bañera romana, ducha independiente, vestidor(es)",
      "Nivel: Primero",
      "Dimensiones: 0 x 0",
    ],
  },
  {
    title: "Cocina",
    items: [
      "Características: Bar de desayuno, características integradas, cocina para comer, isla de cocina, despensa",
      "Nivel: Primero",
      "Dimensiones: 0 x 0",
    ],
  },
  {
    title: "Sala de estar",
    items: [
      "Características: Ventilador(es) de techo, Chimenea",
      "Nivel: Primero",
      "Dimensiones: 0 x 0",
    ],
  },
  {
    title: "Calefacción",
    items: ["Central, Chimenea(s), Gas Natural"],
  },
  {
    title: "Enfriamiento",
    items: ["Aire central, Ventilador(es) de techo, Eléctrico"],
  },
  {
    title: "Electrodomésticos",
    items: [
      "Incluido: Algunos electrodomésticos a gas, lavavajillas, horno eléctrico, cocina a gas, eliminación, microondas, enchufado para gas, ventilador de escape ventilado",
      "Lavandería: Conexión de secadora, Conexión de secadora eléctrica, Lavandería en cuarto de servicio",
    ],
  },
  {
    title: "Comedor",
    items: ["Nivel: Primero", "Dimensiones: 0 x 0"],
  },
];
// ===============================================

const IconVideo = () => (
  <svg width="36" height="36" fill="none" stroke="#555" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9A2.25 2.25 0 0013.5 5.25h-9A2.25 2.25 0 002.25 7.5v9A2.25 2.25 0 004.5 18.75z" />
  </svg>
);

const IconDocument = () => (
  <svg width="36" height="36" fill="none" stroke="#555" strokeWidth="1.5" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

export default function ShowProperty() {
  return (
    <div className="property">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h1>Vivienda Unifamiliar en Encarnación Centro</h1>
        <Button size="sm">Compartir</Button>
      </div>

      {/* Gallery */}
      <Container fluid className="px-4 pt-3 pb-2">
        <Row className="g-1">
          <Col xs={6} style={{ height: "420px" }}>
            <img
              src={propertyImages[0]}
              alt="Fachada"
              className="property__main-image"
            />
          </Col>
          <Col xs={6}>
            <Row className="g-1 h-100">
              {propertyImages.slice(1).map((src, i) => (
                <Col key={src} xs={6} style={{ height: "207px" }}>
                  <img
                    src={src}
                    alt={`Interior ${i + 1}`}
                    className="property__thumb-image"
                    style={{
                      borderRadius:
                        i === 1 ? "0 $radius-lg  0 0" : i === 3 ? "0 0 $radius-lg 0" : "0",
                    }}
                  />
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </Container>

      {/* Main Content */}
      <Container fluid className="px-4 py-3">
        <Row>
          {/* Left Column */}
          <Col lg={8}>
            {/* Price & Stats */}
            <Stack direction="horizontal" gap={4} className="align-items-end flex-wrap mb-2">
              <span className="property__price">$519,000</span>
              <Stack direction="horizontal" gap={4}>
                {[
                  { value: "3", label: "habitaciones" },
                  { value: "2", label: "baños" },
                  { value: "600", label: "metros²" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <div className="property__stat-value">{stat.value}</div>
                    <div className="property__stat-label">{stat.label}</div>
                  </div>
                ))}
              </Stack>
            </Stack>

            {/* Address */}
            <p className="property__address">
              543 Las Palmeras Entre Lorenzo Zacarías y Carlos Hrase, Encarnación, Itapúa
            </p>

            {/* Badges */}
            <Stack direction="horizontal" gap={2} className="flex-wrap mb-4">
              {["Vivienda Uni-familiar", "Construido en 2005", "$700/mts²"].map((label) => (
                <Badge
                  key={label}
                  pill
                  bg="light"
                  text="secondary"
                  style={{
                    border: "1px solid $border-color-soft",
                    fontWeight: "400",
                    fontSize: "0.82rem",
                    padding: "7px 14px",
                  }}
                >
                  {label}
                </Badge>
              ))}
            </Stack>

            {/* Tabs */}
            <Tab.Container defaultActiveKey="descripcion">
              <Nav variant="tabs" className="mb-4" style={{ borderBottom: "2px solid  $border-color-soft" }}>
                {[
                  { key: "descripcion", label: "Descripción" },
                  { key: "tours", label: "Tours y Planos" },
                  { key: "caracteristicas", label: "Datos y Características" },
                ].map((tab) => (
                  <Nav.Item key={tab.key}>
                    <Nav.Link eventKey={tab.key} style={{ fontSize: "0.9rem", color: "#555" }}>
                      {tab.label}
                    </Nav.Link>
                  </Nav.Item>
                ))}
              </Nav>

              <Tab.Content>
                {/* Descripcion */}
                <Tab.Pane eventKey="descripcion">
                  <h5 className="property__section-title">Descripción</h5>
                  <p className="property__description">
                    Hermosa casa tradicional ubicada en una zona privilegiada del centro de
                    Encarnación. La propiedad cuenta con amplios espacios, diseño contemporáneo
                    y excelente orientación. Ideal para familias que buscan comodidad en un
                    entorno tranquilo y seguro.
                  </p>

                  {/* Map */}
                  <div
                    className="rounded mt-4"
                    style={{ height: "260px", overflow: "hidden", border: "1px solid $border-color-soft" }}
                  >
                    <iframe
                      title="Mapa de la propiedad"
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      style={{ border: 0 }}
                      src="https://maps.google.com/maps?q=Encarnaci%C3%B3n,+Paraguay&output=embed"
                      allowFullScreen
                    />
                  </div>

                  {/* Meta */}
                  <div className="property__meta-box mt-4">
                    Publicado hace <strong>10 horas</strong> &nbsp;|&nbsp; 55 vistas &nbsp;|&nbsp; 3 guardados
                    <br />
                    Revisado por última vez: Hace 4 horas
                    <br />
                    Actualizado hace: 7 horas
                    <br />
                    Listado por: María López 1235456, Lopez &amp; Asoc.
                    <br />
                    MLS#: 21055028
                  </div>
                </Tab.Pane>

                {/* Tours */}
                <Tab.Pane eventKey="tours">
                  <h5 className="property__section-title">Tours y Planos</h5>
                  <Row className="g-4 mt-1">
                    {[
                      { key: "tour3d", label: "Tour 3D 360°", Icon: IconVideo },
                      { key: "planos", label: "Planos de la propiedad", Icon: IconDocument },
                    ].map(({ key, label, Icon }) => (
                      <Col sm={6} key={key}>
                        <div className="property__tour-card">
                          <div className="mb-3">
                            <Icon />
                          </div>
                          <p className="property__tour-label">{label}</p>
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>

                {/* Caracteristicas */}
                <Tab.Pane eventKey="caracteristicas">
                  <h5 className="property__section-title">Datos y Características</h5>
                  <Row className="g-4">
                    {features.map((section, i) => (
                      <Col md={6} key={i}>
                        <div className="property__feature-title">{section.title}</div>
                        <ul className="list-unstyled mb-0">
                          {section.items.map((item, j) => (
                            <li key={j} className="property__feature-item">
                              &bull; {item}
                            </li>
                          ))}
                        </ul>
                      </Col>
                    ))}
                  </Row>
                </Tab.Pane>
              </Tab.Content>
            </Tab.Container>
          </Col>

          {/* Agent Card */}
          <Col lg={4} className="mt-4 mt-lg-0">
            <div className="property__agent-card">
              <Image
                src="https://randomuser.me/api/portraits/women/68.jpg"
                alt="María López"
                className="property__agent-avatar"
              />
              <p className="property__agent-name">María López</p>
              <p className="property__agent-exp">8 años de experiencia</p>
              <div className="mb-3">
                <span className="property__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>{" "}
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
  );
}