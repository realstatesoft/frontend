import { useRef } from "react";
import { Row, Col, Form, Button, Badge, Stack, Spinner } from "react-bootstrap";
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
} from "../../../constants/createPropertyConstants";

const ACCEPT_IMAGES = "image/jpeg,image/png,image/webp";
const MAX_IMAGES = 20;

export function PropertyFeaturesSection({
  form,
  set,
  setArr,
  addMedia,
  removeMedia,
  setPrimaryMedia,
  uploadingMedia,
}) {
  const fileInputRef = useRef(null);

  const media = form.media || [];
  const canAddMore = media.length < MAX_IMAGES;

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length && media.length + i < MAX_IMAGES; i++) {
      addMedia(files[i]);
    }
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canAddMore || uploadingMedia) return;
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );
    files.slice(0, MAX_IMAGES - media.length).forEach((f) => addMedia(f));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };
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
              {media.map((item, i) => (
                <Col xs={3} key={item.url || i}>
                  <div
                    className="position-relative rounded overflow-hidden"
                    style={{ aspectRatio: "1" }}
                  >
                    <img
                      src={item.url}
                      alt=""
                      className="w-100 h-100"
                      style={{ objectFit: "cover" }}
                    />
                    <Badge
                      className="position-absolute top-0 start-0 m-1"
                      style={{
                        background: item.isPrimary ? "#3B6BF5" : "rgba(0,0,0,0.5)",
                        fontSize: 9,
                        cursor: "pointer",
                      }}
                      onClick={() => setPrimaryMedia(i)}
                    >
                      <i className={`bi bi-star${item.isPrimary ? "-fill" : ""} me-1`} />
                      {item.isPrimary ? "Portada" : "Marcar portada"}
                    </Badge>
                    <button
                      type="button"
                      className="position-absolute top-0 end-0 m-1 rounded-circle border-0 d-flex align-items-center justify-content-center"
                      style={{
                        width: 24,
                        height: 24,
                        background: "rgba(0,0,0,0.6)",
                        color: "white",
                        cursor: "pointer",
                        fontSize: 14,
                      }}
                      onClick={() => removeMedia(i)}
                      aria-label="Quitar imagen"
                    >
                      ×
                    </button>
                  </div>
                </Col>
              ))}
              {canAddMore && (
                <Col xs={3}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPT_IMAGES}
                    multiple
                    className="d-none"
                    onChange={handleFileChange}
                  />
                  <div
                    className="d-flex flex-column align-items-center justify-content-center rounded border"
                    style={{
                      aspectRatio: "1",
                      cursor: uploadingMedia ? "wait" : "pointer",
                      color: "#3B6BF5",
                      fontSize: 22,
                      borderStyle: "dashed",
                      borderColor: "#c0c8e0",
                    }}
                    onClick={() => !uploadingMedia && fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    {uploadingMedia ? (
                      <Spinner size="sm" className="mb-1" />
                    ) : (
                      <i className="bi bi-plus-lg mb-1" />
                    )}
                    <small style={{ fontSize: 10 }}>Agregar</small>
                  </div>
                </Col>
              )}
            </Row>
            {media.length > 0 && (
              <small className="text-muted d-block mb-2">
                {media.length} imagen{media.length !== 1 ? "es" : ""}. Cliqueá en la estrella para marcar como portada.
              </small>
            )}
            <Stack direction="horizontal" gap={2}>
              <Button
                variant="outline-secondary"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
                disabled
              >
                <i className="bi bi-file-earmark" /> Subir planos
              </Button>
              <Button
                variant="outline-secondary"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
                disabled
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
