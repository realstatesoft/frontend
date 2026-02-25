import { Row, Col, Form, Button, Badge, Stack } from "react-bootstrap";
import { FormSectionTitle, FormLabel, FormMultiSelect } from "../../../components/properties/FormComponents";
import {
  PROPERTY_TYPE_OPTIONS,
  AVAILABILITY_OPTIONS,
  EXTERIOR_FEATURE_OPTIONS,
} from "../../../constants/propertyEnums";
import {
  ELECTRICITY_OPTIONS,
  WATER_OPTIONS,
  SANITARY_OPTIONS,
  MOCK_IMAGES,
} from "../../../constants/createPropertyConstants";

export function PropertyFeaturesSection({ form, set, setArr }) {
  return (
    <>
      <FormSectionTitle title="Características de la Propiedad" />

      <Row className="g-3 mb-3">
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Tipo de Propiedad</FormLabel>
            <Form.Select value={form.propertyType} onChange={set("propertyType")}>
              {PROPERTY_TYPE_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Superficie Total del Lote</FormLabel>
            <Form.Control value={form.surfaceArea} onChange={set("surfaceArea")} placeholder="700" />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Superficie Construida</FormLabel>
            <Form.Control value={form.builtArea} onChange={set("builtArea")} placeholder="300" />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Disponibilidad</FormLabel>
            <Form.Select value={form.availability} onChange={set("availability")}>
              {AVAILABILITY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group>
            <FormLabel required>Instalación eléctrica</FormLabel>
            <Form.Select value={form.electricityInstallation} onChange={set("electricityInstallation")}>
              {ELECTRICITY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel required>Conexión de agua</FormLabel>
            <Form.Select value={form.waterConnection} onChange={set("waterConnection")}>
              {WATER_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel required>Instalación sanitaria</FormLabel>
            <Form.Select value={form.sanitaryInstallation} onChange={set("sanitaryInstallation")}>
              {SANITARY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4 mb-4 align-items-start">
        <Col md={6}>
          <Form.Group>
            <FormLabel>Características del Exterior</FormLabel>
            <FormMultiSelect
              options={EXTERIOR_FEATURE_OPTIONS}
              selected={form.exteriorFeatures}
              onChange={setArr("exteriorFeatures")}
              placeholder="Seleccionar..."
            />
          </Form.Group>
        </Col>

        <Col md={6}>
          <Form.Group>
            <FormLabel>Contenido Multimedia</FormLabel>
            <Row className="g-2 mb-2">
              {MOCK_IMAGES.map((src, i) => (
                <Col xs={3} key={i}>
                  <div
                    className="position-relative rounded overflow-hidden"
                    style={{ aspectRatio: "1" }}
                  >
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
                        style={{
                          background: "rgba(0,0,0,0.55)",
                          cursor: "pointer",
                          fontSize: 11,
                        }}
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
                    aspectRatio: "1",
                    cursor: "pointer",
                    color: "#3B6BF5",
                    fontSize: 22,
                    borderStyle: "dashed",
                    borderColor: "#c0c8e0",
                  }}
                >
                  <i className="bi bi-plus-lg" />
                </div>
              </Col>
            </Row>
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
              >
                <i className="bi bi-file-earmark" /> Subir planos
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
              >
                <i className="bi bi-camera-video" /> Subir vista 3D
              </Button>
            </Stack>
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
