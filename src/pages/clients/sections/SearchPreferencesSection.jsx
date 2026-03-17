import { useState } from "react";
import { Row, Col, Form, Badge } from "react-bootstrap";
import {
  FormSectionTitle,
  FormLabel,
  FormMultiSelect,
  FormTag,
} from "../../../components/properties/FormComponents";

const PROPERTY_TYPE_OPTIONS = [
  "Casa",
  "Apartamento",
  "Terreno",
  "Local Comercial",
  "Oficina",
];

const CHARACTERISTIC_OPTIONS = [
  "Garage",
  "Terraza",
  "Piscina",
  "Jardín",
  "Parrillero",
  "Gimnasio",
  "Seguridad 24/7",
];

export function SearchPreferencesSection({ form, set, setArr, fieldErrors = {} }) {
  const [zoneInput, setZoneInput] = useState("");

  const addZone = (e) => {
    if (e.key === "Enter" && zoneInput.trim()) {
      e.preventDefault();
      const current = form.preferredZones || [];
      if (!current.includes(zoneInput.trim())) {
        setArr("preferredZones")([...current, zoneInput.trim()]);
      }
      setZoneInput("");
    }
  };

  const removeZone = (zone) => {
    setArr("preferredZones")((form.preferredZones || []).filter((z) => z !== zone));
  };

  return (
    <>
      <FormSectionTitle title="Preferencias de Búsqueda del Cliente" />

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Form.Group>
            <FormLabel>Rango de Presupuesto</FormLabel>
            <Form.Control
              value={form.budgetRange}
              onChange={set("budgetRange")}
              placeholder="200.000 US$ - 400.000 US$"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de Habitaciones</FormLabel>
            <Form.Control
              value={form.bedrooms}
              onChange={set("bedrooms")}
              placeholder="3 - 4"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de Baños</FormLabel>
            <Form.Control
              value={form.bathrooms}
              onChange={set("bathrooms")}
              placeholder="2 - 3"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-3 align-items-start">
        <Col md={6}>
          <Form.Group>
            <FormLabel required>Tipos de Propiedad</FormLabel>
            <FormMultiSelect
              options={PROPERTY_TYPE_OPTIONS}
              selected={form.propertyTypes}
              onChange={setArr("propertyTypes")}
              placeholder="Seleccionar..."
            />
            {fieldErrors.propertyTypes && (
              <Form.Text className="text-danger">
                {fieldErrors.propertyTypes}
              </Form.Text>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <FormLabel>Zonas Preferidas</FormLabel>
            <Form.Control
              value={zoneInput}
              onChange={(e) => setZoneInput(e.target.value)}
              onKeyDown={addZone}
              placeholder="Ingrese una zona..."
            />
            {(form.preferredZones || []).length > 0 && (
              <div className="mt-2">
                <small className="text-muted d-block mb-1">
                  Zonas Preferidas seleccionadas
                </small>
                <div className="d-flex flex-wrap">
                  {form.preferredZones.map((zone) => (
                    <FormTag
                      key={zone}
                      label={zone}
                      onRemove={() => removeZone(zone)}
                    />
                  ))}
                </div>
              </div>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={12}>
          <Form.Group>
            <FormLabel>Características Preferidas</FormLabel>
            <FormMultiSelect
              options={CHARACTERISTIC_OPTIONS}
              selected={form.preferredCharacteristics}
              onChange={setArr("preferredCharacteristics")}
              placeholder="Seleccionar..."
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
