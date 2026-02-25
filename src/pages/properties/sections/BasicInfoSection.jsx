import { Row, Col, Form, Button, Stack } from "react-bootstrap";
import { FormSectionTitle, FormLabel } from "../../../components/properties/FormComponents";
import { CATEGORY_OPTIONS } from "../../../constants/propertyEnums";

export function BasicInfoSection({ form, set }) {
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
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Categoría</FormLabel>
            <Form.Select value={form.category} onChange={set("category")}>
              {CATEGORY_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Precio (USD)</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.price}
              onChange={set("price")}
              placeholder="350000"
            />
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
          />
          <Button variant="primary" type="button" className="text-nowrap d-flex align-items-center gap-2">
            <i className="bi bi-geo-alt-fill" /> Ubicar en el Mapa
          </Button>
        </Stack>
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
    </>
  );
}
