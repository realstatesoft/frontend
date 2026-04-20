import { useState, useRef, useEffect, useMemo } from "react";
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
import model3dApi from "../../../services/properties/model3dApi";
import Swal from "sweetalert2";
import PropertyTourEditor from "../../../components/properties/PropertyTourEditor/PropertyTourEditor";

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
  addModel3D,
  uploadingModel3D,
  addTour360Image,
  addTourConfig,
  uploadingTour,
}) {
  const fileInputRef = useRef(null);

  const media = form.media || [];
  // Filtrar solo las fotos convencionales para la galería, pero guardando el índice original
  // Filtrar fotos, modelos 3D e imágenes 360 para la galería, guardando el índice original
  const galleryMedia = useMemo(() => {
    return (form.media || [])
      .map((item, idx) => ({ ...item, originalIndex: idx }))
      .filter(m => ['PHOTO', 'IMAGE', 'MODEL_3D', 'IMAGE_360'].includes(m.type));
  }, [form.media]);

  const canAddMore = galleryMedia.length < MAX_IMAGES;

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    for (let i = 0; i < files.length && galleryMedia.length + i < MAX_IMAGES; i++) {
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
    files.slice(0, MAX_IMAGES - galleryMedia.length).forEach((f) => addMedia(f));
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleModelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await addModel3D(file);
    } finally {
      if (modelInputRef.current) modelInputRef.current.value = "";
    }
  };

  const modelInputRef = useRef(null);
  const tour360InputRef = useRef(null);
  const [showTourEditor, setShowTourEditor] = useState(false);

  const handleTour360Upload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        await addTour360Image(file);
      } finally {
        if (tour360InputRef.current) tour360InputRef.current.value = "";
      }
    }
  };

  const handleTourSaved = (configMedia) => {
    const nextMedia = (form.media || []).filter(m => m.type !== 'VIRTUAL_TOUR_CONFIG');
    setArr("media")([...nextMedia, configMedia]);
    setParsedConfig(null); 
  };

  // Obtener config actual si existe para pasarla al editor
  const currentTourConfig = form.media?.find(m => m.type === 'VIRTUAL_TOUR_CONFIG');
  const [parsedConfig, setParsedConfig] = useState(null);

  useEffect(() => {
    if (currentTourConfig?.url) {
      fetch(currentTourConfig.url)
        .then(res => res.json())
        .then(data => setParsedConfig(data))
        .catch(err => console.error("Error al pre-cargar config:", err));
    } else {
      setParsedConfig(null);
    }
  }, [currentTourConfig?.url]);

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
              {galleryMedia.map((item) => (
                <Col xs={3} key={item.url || item.originalIndex}>
                  <div
                    className="position-relative rounded overflow-hidden"
                    style={{ aspectRatio: "1" }}
                  >
                    {item.type === 'MODEL_3D' ? (
                      <div className="w-100 h-100 d-flex flex-column align-items-center justify-content-center bg-light text-primary border">
                        <i className="bi bi-box" style={{ fontSize: 24 }} />
                        <span style={{ fontSize: 8, marginTop: 4 }}>PLANO 3D</span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt=""
                        className="w-100 h-100"
                        style={{ objectFit: "cover" }}
                      />
                    )}
                    
                    <Badge
                      className="position-absolute top-0 start-0 m-1"
                      style={{
                        background: item.isPrimary ? "#3B6BF5" : "rgba(0,0,0,0.5)",
                        fontSize: 9,
                        cursor: "pointer",
                      }}
                      onClick={() => setPrimaryMedia(item.originalIndex)}
                    >
                      <i className={`bi bi-star${item.isPrimary ? "-fill" : ""} me-1`} />
                      {item.isPrimary ? "Portada" : "Marcar portada"}
                    </Badge>

                    {item.type === 'IMAGE_360' && (
                      <Badge bg="info" className="position-absolute bottom-0 start-0 m-1" style={{ fontSize: 8 }}>
                        360°
                      </Badge>
                    )}

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
                      onClick={() => removeMedia(item.originalIndex)}
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
            {galleryMedia.length > 0 && (
              <small className="text-muted d-block mb-2">
                {galleryMedia.length} imagen{galleryMedia.length !== 1 ? "es" : ""}. Cliqueá en la estrella para marcar como portada.
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
              <input 
                type="file" 
                ref={modelInputRef} 
                className="d-none" 
                accept=".glb,.gltf" 
                onChange={handleModelUpload}
              />
              <Button
                variant="outline-primary"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
                onClick={() => modelInputRef.current?.click()}
                disabled={uploadingModel3D}
              >
                {uploadingModel3D ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="bi bi-box" />
                )}
                {uploadingModel3D ? "Subiendo..." : "Subir Plano 3D"}
              </Button>

              <input 
                type="file" 
                ref={tour360InputRef} 
                className="d-none" 
                accept={ACCEPT_IMAGES} 
                onChange={handleTour360Upload}
              />
              <Button
                variant="outline-info"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
                onClick={() => tour360InputRef.current?.click()}
                disabled={uploadingTour}
              >
                {uploadingTour ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  <i className="bi bi-camera-reuters" />
                )}
                {uploadingTour ? "Subiendo..." : "Añadir Habitación 360"}
              </Button>

              <Button
                variant="outline-dark"
                size="sm"
                type="button"
                className="d-flex align-items-center gap-1"
                onClick={() => setShowTourEditor(true)}
                disabled={!form.media?.some(m => m.type === 'IMAGE_360')}
              >
                <i className="bi bi-pencil-square" />
                Configurar Recorrido
              </Button>
            </Stack>
          </Form.Group>
        </Col>
      </Row>

      <PropertyTourEditor 
        show={showTourEditor}
        onHide={() => setShowTourEditor(false)}
        propertyId={form.id}
        media={form.media || []}
        currentConfig={parsedConfig}
        onSave={handleTourSaved}
      />
    </>
  );
}
