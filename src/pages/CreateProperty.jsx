
import { useState } from "react";
import {
  Container, Card, Row, Col, Form, Button, Badge, Stack,
} from "react-bootstrap";

// ── Tag chip ──────────────────────────────────────────────────────────────────
const Tag = ({ label, onRemove }) => (
  <Badge
    className="d-inline-flex align-items-center gap-1 me-1 mb-1 fw-normal"
    style={{ background: "#EAF0FF", color: "#3B6BF5", fontSize: 13, padding: "5px 10px" }}
  >
    {label}
    <button
      type="button"
      onClick={onRemove}
      className="btn-close ms-1"
      style={{
        fontSize: 8,
        filter: "invert(37%) sepia(98%) saturate(748%) hue-rotate(206deg)",
      }}
      aria-label="Eliminar"
    />
  </Badge>
);

// ── MultiSelect custom ────────────────────────────────────────────────────────
const MultiSelect = ({ options, selected, onChange, placeholder }) => {
  const [open, setOpen] = useState(false);

  const toggle = (val) =>
    onChange(
      selected.includes(val)
        ? selected.filter((s) => s !== val)
        : [...selected, val]
    );

  return (
    <div className="position-relative">
      <div
        className="form-control d-flex justify-content-between align-items-center"
        style={{ cursor: "pointer", color: "#888" }}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{placeholder}</span>
        <i className={`bi bi-chevron-${open ? "up" : "down"} text-muted`} style={{ fontSize: 12 }} />
      </div>

      {open && (
        <div
          className="position-absolute w-100 bg-white border rounded shadow-sm"
          style={{ top: "105%", zIndex: 300 }}
        >
          {options.map((opt) => (
            <div
              key={opt}
              className="px-3 py-2"
              style={{
                cursor: "pointer",
                fontSize: 14,
                background: selected.includes(opt) ? "#EAF0FF" : "#fff",
                color: selected.includes(opt) ? "#3B6BF5" : "#333",
              }}
              onClick={() => toggle(opt)}
            >
              {selected.includes(opt) && <i className="bi bi-check2 me-2" />}
              {opt}
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <div className="mt-2">
          <small className="text-muted d-block mb-1">Características seleccionadas</small>
          <div className="d-flex flex-wrap">
            {selected.map((s, i) => (
              <Tag
                key={`${s}-${i}`}
                label={s}
                onRemove={() => onChange(selected.filter((_, idx) => idx !== i))}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ── Título de sección ─────────────────────────────────────────────────────────
const SectionTitle = ({ title }) => (
  <>
    <h5 className="fw-bold mb-0">{title}</h5>
    <hr className="mt-2 mb-4" />
  </>
);

// ── Label con asterisco ───────────────────────────────────────────────────────
const Lbl = ({ children, required }) => (
  <Form.Label className="fw-semibold">
    {children}{required && <span className="text-primary ms-1">*</span>}
  </Form.Label>
);

// ── Imágenes mock ─────────────────────────────────────────────────────────────
const mockImages = [
  "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=200&q=70",
  "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=200&q=70",
  "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=200&q=70",
  "https://images.unsplash.com/photo-1576941089067-2de3c901e126?w=200&q=70",
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function RegistrarPropiedad() {

 // DATOS DE PRUEBA
 // luego modificar una vez se integre con el backend
  const [form, setForm] = useState({
    titulo: "Vivienda Unifamiliar de dos plantas",
    categoria: "Venta",
    visibilidad: "Pública",
    direccion: "Calle X, Encarnación",
    descripcion: "",
    tipoPropiedad: "Casa",
    superficieLote: "700 m²",
    superficieConstruida: "300 m²",
    disponibilidad: "Inmediata",
    instalacionElectrica: "Trifásica",
    conexionAgua: "Agua corriente",
    instalacionSanitaria: "Red pública",
    exteriorFeatures: ["Piscina", "Estacionamiento Techado"],
    anioConstruccion: "2010",
    estado: "Usada",
    materialEstructura: "Hormigón",
    materialParedes: "Ladrillo",
    materialPiso: "Azulejos",
    materialTecho: "Tejas",
    estacionamientos: "2",
    plantas: "2",
    dormitorios: "2",
    mediosBanos: "1",
    banosCompletos: "1",
    dorm1Planta: "Planta baja",
    dorm1Dim: "6 x 6 mts.",
    dorm1Features: ["Vestidor", "Aire Acondicionado"],
    dorm2Planta: "Primera",
    dorm2Dim: "6 x 6 mts.",
    dorm2Features: ["Vestidor", "Aire Acondicionado"],
  });

  const set = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target ? e.target.value : e }));
  const setArr = (key) => (val) => setForm((f) => ({ ...f, [key]: val }));

  const dormConfig = [
    {
      num: "1", planta: form.dorm1Planta, dim: form.dorm1Dim, features: form.dorm1Features,
      setPlanta: (v) => setForm((f) => ({ ...f, dorm1Planta: v })),
      setDim: (v) => setForm((f) => ({ ...f, dorm1Dim: v })),
      setFeatures: setArr("dorm1Features"),
    },
    {
      num: "2", planta: form.dorm2Planta, dim: form.dorm2Dim, features: form.dorm2Features,
      setPlanta: (v) => setForm((f) => ({ ...f, dorm2Planta: v })),
      setDim: (v) => setForm((f) => ({ ...f, dorm2Dim: v })),
      setFeatures: setArr("dorm2Features"),
    },
  ];

  return (
    <div className="bg-light min-vh-100 py-4">
      <Container style={{ maxWidth: 920 }}>
        <Card className="border-0 shadow-sm rounded-4 p-4 p-md-5">
          <h4 className="fw-bold mb-4">Registrar Propiedad</h4>

          {/* ══ Información Básica ══════════════════════════════════════════ */}
          <SectionTitle title="Información Básica" />

          <Row className="g-3 mb-3">
            <Col md={6}>
              <Form.Group>
                <Lbl required>Título</Lbl>
                <Form.Control
                  value={form.titulo}
                  onChange={set("titulo")}
                  placeholder="Vivienda Unifamiliar de dos plantas"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl required>Categoría</Lbl>
                <Form.Select value={form.categoria} onChange={set("categoria")}>
                  {["Venta", "Alquiler"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl required>Visibilidad</Lbl>
                <Form.Select value={form.visibilidad} onChange={set("visibilidad")}>
                  {["Pública", "Privada"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Lbl required>Dirección</Lbl>
            <Stack direction="horizontal" gap={2}>
              <Form.Control
                value={form.direccion}
                onChange={set("direccion")}
                placeholder="Calle X, Encarnación"
              />
              <Button variant="primary" className="text-nowrap d-flex align-items-center gap-2">
                <i className="bi bi-geo-alt-fill" /> Ubicar en el Mapa
              </Button>
            </Stack>
          </Form.Group>

          <Form.Group className="mb-4">
            <Lbl required>Descripción</Lbl>
            <Form.Control
              as="textarea"
              rows={4}
              value={form.descripcion}
              onChange={set("descripcion")}
              placeholder="Describe la propiedad..."
            />
          </Form.Group>

          {/* ══ Características de la Propiedad ════════════════════════════ */}
          <SectionTitle title="Características de la Propiedad" />

          <Row className="g-3 mb-3">
            <Col md={3}>
              <Form.Group>
                <Lbl required>Tipo de Propiedad</Lbl>
                <Form.Select value={form.tipoPropiedad} onChange={set("tipoPropiedad")}>
                  {["Casa", "Departamento", "Local", "Terreno"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl required>Superficie Total del Lote</Lbl>
                <Form.Control value={form.superficieLote} onChange={set("superficieLote")} placeholder="700 m²" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Superficie Construida</Lbl>
                <Form.Control value={form.superficieConstruida} onChange={set("superficieConstruida")} placeholder="300 m²" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Disponibilidad</Lbl>
                <Form.Control value={form.disponibilidad} onChange={set("disponibilidad")} placeholder="Inmediata" />
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Group>
                <Lbl required>Instalación eléctrica</Lbl>
                <Form.Select value={form.instalacionElectrica} onChange={set("instalacionElectrica")}>
                  {["Trifásica", "Monofásica"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Lbl required>Conexión de agua</Lbl>
                <Form.Select value={form.conexionAgua} onChange={set("conexionAgua")}>
                  {["Agua corriente", "Pozo", "Cisterna"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Lbl required>Instalación sanitaria</Lbl>
                <Form.Select value={form.instalacionSanitaria} onChange={set("instalacionSanitaria")}>
                  {["Red pública", "Cámara séptica"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-4 mb-4 align-items-start">
            <Col md={6}>
              <Form.Group>
                <Lbl>Características del Exterior</Lbl>
                <MultiSelect
                  options={["Piscina", "Estacionamiento Techado", "Jardín", "Quincho", "Cancha"]}
                  selected={form.exteriorFeatures}
                  onChange={setArr("exteriorFeatures")}
                  placeholder="Seleccionar..."
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Lbl>Contenido Multimedia</Lbl>
                <Row className="g-2 mb-2">
                  {mockImages.map((src, i) => (
                    <Col xs={3} key={i}>
                      <div className="position-relative rounded overflow-hidden" style={{ aspectRatio: "1" }}>
                        <img src={src} alt="" className="w-100 h-100" style={{ objectFit: "cover" }} />
                        {i === 0 && (
                          <Badge
                            className="position-absolute top-0 start-0 m-1"
                            style={{ background: "#3B6BF5", fontSize: 9 }}
                          >
                            <i className="bi bi-star-fill me-1" />Portada
                          </Badge>
                        )}
                        {i === 3 && (
                          <div
                            className="position-absolute top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center text-white"
                            style={{ background: "rgba(0,0,0,0.55)", cursor: "pointer", fontSize: 11 }}
                          >
                            <strong>+3 imágenes</strong>
                            <small>Ver todas</small>
                          </div>
                        )}
                      </div>
                    </Col>
                  ))}
                  <Col xs={3}>
                    <div
                      className="d-flex align-items-center justify-content-center rounded border"
                      style={{
                        aspectRatio: "1", cursor: "pointer",
                        color: "#3B6BF5", fontSize: 22,
                        borderStyle: "dashed", borderColor: "#c0c8e0",
                      }}
                    >
                      <i className="bi bi-plus-lg" />
                    </div>
                  </Col>
                </Row>
                <Stack direction="horizontal" gap={2}>
                  <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                    <i className="bi bi-file-earmark" /> Subir planos
                  </Button>
                  <Button variant="outline-secondary" size="sm" className="d-flex align-items-center gap-1">
                    <i className="bi bi-camera-video" /> Subir vista 3D
                  </Button>
                </Stack>
              </Form.Group>
            </Col>
          </Row>

          {/* ══ Características de la Construcción ════════════════════════ */}
          <SectionTitle title="Características de la Construcción" />

          <Row className="g-3 mb-3">
            <Col md={3}>
              <Form.Group>
                <Lbl>Año de Construcción</Lbl>
                <Form.Control value={form.anioConstruccion} onChange={set("anioConstruccion")} placeholder="2010" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Estado</Lbl>
                <Form.Select value={form.estado} onChange={set("estado")}>
                  {["Usada", "Nueva", "En construcción"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Material de la Estructura</Lbl>
                <Form.Select value={form.materialEstructura} onChange={set("materialEstructura")}>
                  {["Hormigón", "Madera", "Mixto"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Material de Paredes</Lbl>
                <Form.Select value={form.materialParedes} onChange={set("materialParedes")}>
                  {["Ladrillo", "Bloque", "Yeso"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Form.Group>
                <Lbl>Material del Piso</Lbl>
                <Form.Select value={form.materialPiso} onChange={set("materialPiso")}>
                  {["Azulejos", "Madera", "Cemento", "Porcelanato"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Lbl>Material del Techo</Lbl>
                <Form.Select value={form.materialTecho} onChange={set("materialTecho")}>
                  {["Tejas", "Losa", "Chapa"].map((o) => <option key={o}>{o}</option>)}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Lbl>Nº Espacios de Estacionamiento</Lbl>
                <Form.Control value={form.estacionamientos} onChange={set("estacionamientos")} placeholder="2" />
              </Form.Group>
            </Col>
          </Row>

          {/* ══ Características del Interior ══════════════════════════════ */}
          <SectionTitle title="Características del Interior" />

          <Row className="g-3 mb-4">
            <Col md={3}>
              <Form.Group>
                <Lbl>Cantidad de plantas</Lbl>
                <Form.Control value={form.plantas} onChange={set("plantas")} placeholder="2" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Cantidad de dormitorios</Lbl>
                <Form.Control value={form.dormitorios} onChange={set("dormitorios")} placeholder="2" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Cantidad de medios baños</Lbl>
                <Form.Control value={form.mediosBanos} onChange={set("mediosBanos")} placeholder="1" />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Lbl>Cantidad de baños completos</Lbl>
                <Form.Control value={form.banosCompletos} onChange={set("banosCompletos")} placeholder="1" />
              </Form.Group>
            </Col>
          </Row>

          {/* Dormitorios */}
          <Row className="g-4 mb-4">
            {dormConfig.map((d) => (
              <Col md={6} key={d.num}>
                <Card className="bg-light border-0 rounded-3">
                  <Card.Body>
                    <p className="fw-bold mb-3">
                      Dormitorio {d.num} <span className="text-primary">*</span>
                    </p>
                    <Row className="g-2 mb-3">
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>Planta</Form.Label>
                          <Form.Select size="sm" value={d.planta} onChange={(e) => d.setPlanta(e.target.value)}>
                            {["Planta baja", "Primera", "Segunda"].map((o) => <option key={o}>{o}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col xs={6}>
                        <Form.Group>
                          <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>Dimensiones</Form.Label>
                          <Form.Select size="sm" value={d.dim} onChange={(e) => d.setDim(e.target.value)}>
                            {["6 x 6 mts.", "4 x 4 mts.", "5 x 5 mts."].map((o) => <option key={o}>{o}</option>)}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>Características</Form.Label>
                      <MultiSelect
                        options={["Vestidor", "Aire Acondicionado", "Balcón", "Calefacción"]}
                        selected={d.features}
                        onChange={d.setFeatures}
                        placeholder="Seleccionar..."
                      />
                    </Form.Group>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* ══ Botones ════════════════════════════════════════════════════ */}
          <Stack direction="horizontal" gap={2} className="justify-content-end pt-3 border-top">
            <Button variant="outline-secondary" className="px-4">Cancelar</Button>
            <Button variant="primary" className="px-4">Guardar Propiedad</Button>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}