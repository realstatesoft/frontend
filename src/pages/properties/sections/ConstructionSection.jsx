import { Row, Col, Form } from "react-bootstrap";
import { FormSectionTitle, FormLabel } from "../../../components/properties/FormComponents";
import { CONSTRUCTION_STATUS_OPTIONS } from "../../../constants/propertyEnums";
import {
  STRUCTURE_OPTIONS,
  WALLS_OPTIONS,
  FLOOR_OPTIONS,
  ROOF_OPTIONS,
} from "../../../constants/createPropertyConstants";

export function ConstructionSection({ form, set }) {
  return (
    <>
      <FormSectionTitle title="Características de la Construcción" />

      <Row className="g-3 mb-3">
        <Col md={3}>
          <Form.Group>
            <FormLabel>Año de Construcción</FormLabel>
            <Form.Control value={form.year} onChange={set("year")} placeholder="2010" />
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Estado</FormLabel>
            <Form.Select value={form.construction_status} onChange={set("construction_status")}>
              {CONSTRUCTION_STATUS_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Material de la Estructura</FormLabel>
            <Form.Select value={form.structureMaterial} onChange={set("structureMaterial")}>
              {STRUCTURE_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={3}>
          <Form.Group>
            <FormLabel>Material de Paredes</FormLabel>
            <Form.Select value={form.wallsMaterial} onChange={set("wallsMaterial")}>
              {WALLS_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={4}>
          <Form.Group>
            <FormLabel>Material del Piso</FormLabel>
            <Form.Select value={form.floorMaterial} onChange={set("floorMaterial")}>
              {FLOOR_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Material del Techo</FormLabel>
            <Form.Select value={form.roofMaterial} onChange={set("roofMaterial")}>
              {ROOF_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Nº Espacios de Estacionamiento</FormLabel>
            <Form.Control
              type="number"
              min="0"
              value={form.parkingSpaces}
              onChange={set("parkingSpaces")}
              placeholder="2"
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
