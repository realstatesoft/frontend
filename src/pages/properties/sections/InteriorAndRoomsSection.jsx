import { Row, Col, Form, Button, Card, Stack } from "react-bootstrap";
import { FormSectionTitle, FormLabel, FormMultiSelect } from "../../../components/properties/FormComponents";
import { INTERIOR_FEATURE_OPTIONS } from "../../../constants/propertyEnums";
import { FLOOR_LEVEL_OPTIONS, DIMENSION_OPTIONS } from "../../../constants/createPropertyConstants";

export function InteriorAndRoomsSection({ form, set, updateRoom, addRoom, removeRoom }) {
  return (
    <>
      <FormSectionTitle title="Características del Interior" />

      <Row className="g-3 mb-4">
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de plantas</FormLabel>
            <Form.Control
              type="number"
              min="1"
              value={form.floorsCount}
              onChange={set("floorsCount")}
              placeholder="2"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de dormitorios</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={set("bedrooms")}
              placeholder="2"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de medios baños</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.halfBathrooms}
              onChange={set("halfBathrooms")}
              placeholder="1"
            />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Cantidad de baños completos</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.fullBathrooms}
              onChange={set("fullBathrooms")}
              placeholder="1"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-4 mb-3">
        {form.rooms.map((room, index) => (
          <Col md={6} key={index}>
            <Card className="bg-light border-0 rounded-3">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <Form.Control
                    size="sm"
                    className="fw-bold border-0 bg-transparent p-0"
                    style={{ fontSize: 15, maxWidth: 200 }}
                    value={room.name}
                    onChange={(e) => updateRoom(index, "name", e.target.value)}
                  />
                  {form.rooms.length > 1 && (
                    <Button
                      variant="link"
                      size="sm"
                      className="text-danger p-0"
                      type="button"
                      onClick={() => removeRoom(index)}
                    >
                      <i className="bi bi-trash3" />
                    </Button>
                  )}
                </div>

                <Row className="g-2 mb-3">
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>
                        Planta
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={room.floor}
                        onChange={(e) => updateRoom(index, "floor", e.target.value)}
                      >
                        {FLOOR_LEVEL_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col xs={6}>
                    <Form.Group>
                      <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>
                        Dimensiones
                      </Form.Label>
                      <Form.Select
                        size="sm"
                        value={room.dimensions}
                        onChange={(e) => updateRoom(index, "dimensions", e.target.value)}
                      >
                        {DIMENSION_OPTIONS.map((o) => (
                          <option key={o}>{o}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group>
                  <Form.Label className="fw-semibold" style={{ fontSize: 13 }}>
                    Características
                  </Form.Label>
                  <FormMultiSelect
                    options={INTERIOR_FEATURE_OPTIONS}
                    selected={room.features}
                    onChange={(val) => updateRoom(index, "features", val)}
                    placeholder="Seleccionar..."
                  />
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      <Stack direction="horizontal" gap={2} className="justify-content-end mb-4">
        <Button variant="outline-primary" type="button" className="px-4" onClick={addRoom}>
          <i className="bi bi-plus-lg me-1" /> Agregar Habitación
        </Button>
      </Stack>
    </>
  );
}
