import { useState } from "react";
import { Row, Col, Form, Button, Stack } from "react-bootstrap";
import { FormSectionTitle, FormLabel } from "../../../components/properties/FormComponents";
import LocationPickerModal from "../../../components/commons/LocationPickerModal";
import PriceInput from "../../../components/commons/PriceInput";
import { CATEGORY_OPTIONS } from "../../../constants/propertyEnums";

export function BasicInfoSection({ form, set, fieldErrors = {} }) {
  const [showLocationModal, setShowLocationModal] = useState(false);

  const handleOpenLocation = () => setShowLocationModal(true);
  const handleCloseLocation = () => setShowLocationModal(false);

  const handleLocationSelected = ({ lat, lng, address }) => {
    // Actualizar geolocalización
    set("geolocation")({ lat, lng });
    // Actualizar dirección (respetando la editable por usuario)
    if (address && address.trim()) {
      set("address")({ target: { value: address } });
    }
    setShowLocationModal(false);
  };

  return (
    <>
      <FormSectionTitle title="Información Básica" />

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Form.Group>
            <FormLabel required>Título</FormLabel>
            <Form.Control
              value={form.title}
              onChange={set("title")}
              placeholder="Vivienda Unifamiliar de dos plantas"
              isInvalid={!!fieldErrors.title}
            />
            {fieldErrors.title && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.title}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Categoría</FormLabel>
            <Form.Select
              value={form.category}
              onChange={set("category")}
              isInvalid={!!fieldErrors.category}
            >
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
            {fieldErrors.category && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.category}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Precio (Gs.)</FormLabel>
            <PriceInput
              value={form.price}
              onChange={set("price")}
              placeholder="350.000.000"
              isInvalid={!!fieldErrors.price}
            />
            {fieldErrors.price && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.price}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <FormLabel required>Dirección</FormLabel>
        <Stack direction="horizontal" gap={2}>
          <Form.Control
            value={form.address}
            onChange={set("address")}
            placeholder="Calle X, Encarnación"
            isInvalid={!!fieldErrors.address}
          />
          <Button
            variant="primary"
            type="button"
            className="text-nowrap d-flex align-items-center gap-2"
            onClick={handleOpenLocation}
          >
            <i className="bi bi-geo-alt-fill" /> Ubicar en el Mapa
          </Button>
        </Stack>
        {fieldErrors.address && (
          <Form.Control.Feedback type="invalid" className="d-block">
            {fieldErrors.address}
          </Form.Control.Feedback>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <FormLabel required>Descripción</FormLabel>
        <Form.Control
          as="textarea"
          rows={4}
          value={form.description}
          onChange={set("description")}
          placeholder="Describe la propiedad..."
        />
      </Form.Group>

      <LocationPickerModal
        show={showLocationModal}
        onHide={handleCloseLocation}
        initialCoords={form.geolocation}
        initialAddress={form.address}
        onConfirm={handleLocationSelected}
      />
    </>
  );
}
