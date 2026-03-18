import { Row, Col, Form, Button, Card, Stack } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import { FormSectionTitle, FormLabel, FormMultiSelect } from "../../../components/properties/FormComponents";
import { INTERIOR_FEATURE_OPTIONS } from "../../../constants/propertyEnums";
import { getFloorOptionsForCount, DIMENSION_OPTIONS } from "../../../constants/createPropertyConstants";

function RoomCard({ room, index, onRemove, updateRoom, floorsCount }) {
  const allowed = getFloorOptionsForCount(floorsCount);
  const options = allowed.includes(room.floor) ? allowed : [room.floor, ...allowed];
  return (
    <Col md={6}>
      <Card className="bg-light border-0 rounded-3 position-relative">
        <Card.Body className="position-relative">
        {onRemove && (
          <Button
            variant="link"
            size="sm"
            className="position-absolute top-0 end-0 m-2 p-1 text-muted"
            style={{ zIndex: 10, minWidth: 24, minHeight: 24, cursor: "pointer" }}
            type="button"
            onClick={onRemove}
            aria-label="Quitar habitación"
            title="Quitar habitación"
          >
            <Trash3 size={14} />
          </Button>
        )}
          <div className="d-flex align-items-center mb-3">
            <Form.Control
              size="sm"
              className="fw-bold border-0 bg-transparent p-0"
              style={{ fontSize: 15, maxWidth: "100%" }}
              value={room.name}
              onChange={(e) => updateRoom(index, "name", e.target.value)}
              placeholder="Nombre"
            />
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
                  {options.map((o) => (
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
  );
}


export function InteriorAndRoomsSection({
  form,
  setFloorsCount,
  setBedrooms,
  setHalfBathrooms,
  setFullBathrooms,
  updateRoom,
  addExtraRoom,
  removeExtraRoom,
  fieldErrors = {},
}) {
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
              max="10"
              value={form.floorsCount}
              onChange={setFloorsCount}
              placeholder="2"
              isInvalid={!!fieldErrors.floorsCount}
            />
            {fieldErrors.floorsCount && (
              <Form.Control.Feedback type="invalid">{fieldErrors.floorsCount}</Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Cantidad de dormitorios</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.bedrooms}
              onChange={setBedrooms}
              placeholder="2"
              isInvalid={!!fieldErrors.bedrooms}
            />
            {fieldErrors.bedrooms && (
              <Form.Control.Feedback type="invalid">{fieldErrors.bedrooms}</Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Cantidad de medios baños</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.halfBathrooms}
              onChange={setHalfBathrooms}
              placeholder="1"
              isInvalid={!!fieldErrors.halfBathrooms}
            />
            {fieldErrors.halfBathrooms && (
              <Form.Control.Feedback type="invalid">{fieldErrors.halfBathrooms}</Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel required>Cantidad de baños completos</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.fullBathrooms}
              onChange={setFullBathrooms}
              placeholder="1"
              isInvalid={!!fieldErrors.fullBathrooms}
            />
            {fieldErrors.fullBathrooms && (
              <Form.Control.Feedback type="invalid">{fieldErrors.fullBathrooms}</Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      {(() => {
        const b = Math.max(0, parseInt(form.bedrooms, 10) || 0);
        const h = Math.max(0, parseInt(form.halfBathrooms, 10) || 0);
        const full = Math.max(0, parseInt(form.fullBathrooms, 10) || 0);
        const extraStart = b + h + full;
        const rooms = form.rooms || [];
        const bedroomRooms = rooms.slice(0, b);
        const halfBathRooms = rooms.slice(b, b + h);
        const fullBathRooms = rooms.slice(b + h, b + h + full);
        const extraRooms = rooms.slice(extraStart);
        const cardProps = { updateRoom, floorsCount: form.floorsCount };

        return (
          <>
            {bedroomRooms.length > 0 && (
              <>
                <h6 className="mb-2 mt-3 text-secondary">Dormitorios</h6>
                <Row className="g-4 mb-3">
                  {bedroomRooms.map((room, i) => (
                    <RoomCard
                      key={`bed-${i}`}
                      room={room}
                      index={i}
                      onRemove={() => setBedrooms({ target: { value: String(Math.max(0, b - 1)) } })}
                      {...cardProps}
                    />
                  ))}
                </Row>
              </>
            )}
            {halfBathRooms.length > 0 && (
              <>
                <h6 className="mb-2 mt-3 text-secondary">Medios baños</h6>
                <Row className="g-4 mb-3">
                  {halfBathRooms.map((room, i) => (
                    <RoomCard
                      key={`half-${i}`}
                      room={room}
                      index={b + i}
                      onRemove={() => setHalfBathrooms({ target: { value: String(Math.max(0, h - 1)) } })}
                      {...cardProps}
                    />
                  ))}
                </Row>
              </>
            )}
            {fullBathRooms.length > 0 && (
              <>
                <h6 className="mb-2 mt-3 text-secondary">Baños completos</h6>
                <Row className="g-4 mb-3">
                  {fullBathRooms.map((room, i) => (
                    <RoomCard
                      key={`full-${i}`}
                      room={room}
                      index={b + h + i}
                      onRemove={() => setFullBathrooms({ target: { value: String(Math.max(0, full - 1)) } })}
                      {...cardProps}
                    />
                  ))}
                </Row>
              </>
            )}
            {extraRooms.length > 0 && (
              <>
                <h6 className="mb-2 mt-3 text-secondary">Otras habitaciones (cocina, oficina, etc.)</h6>
                <Row className="g-4 mb-3">
                  {extraRooms.map((room, i) => (
                    <RoomCard
                      key={`extra-${i}`}
                      room={room}
                      index={extraStart + i}
                      onRemove={() => removeExtraRoom(extraStart + i)}
                      {...cardProps}
                    />
                  ))}
                </Row>
              </>
            )}
            <Stack direction="horizontal" gap={2} className="justify-content-end mb-4">
              <Button variant="secondary" type="button" className="px-4" onClick={addExtraRoom}>
                <i className="bi bi-plus-lg me-1" /> Agregar habitación (cocina, etc.)
              </Button>
            </Stack>
          </>
        );
      })()}
    </>
  );
}
