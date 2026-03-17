import { Row, Col, Form } from "react-bootstrap";
import {
  FormSectionTitle,
  FormLabel,
} from "../../../components/properties/FormComponents";

const ESTADO_CIVIL_OPTIONS = [
  "Soltero/a",
  "Casado/a",
  "Divorciado/a",
  "Viudo/a",
  "Unión libre",
];

export function PersonalInfoSection({ form, set, fieldErrors = {} }) {
  return (
    <>
      <FormSectionTitle title="Información Personal" />

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Form.Group>
            <FormLabel required>Nombre</FormLabel>
            <Form.Control
              value={form.firstName}
              onChange={set("firstName")}
              placeholder="María"
              isInvalid={!!fieldErrors.firstName}
            />
            {fieldErrors.firstName && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.firstName}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <FormLabel required>Apellido</FormLabel>
            <Form.Control
              value={form.lastName}
              onChange={set("lastName")}
              placeholder="García"
              isInvalid={!!fieldErrors.lastName}
            />
            {fieldErrors.lastName && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.lastName}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Group>
            <FormLabel>Fecha de Nacimiento</FormLabel>
            <Form.Control
              type="date"
              value={form.birthDate}
              onChange={set("birthDate")}
            />
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Estado Civil</FormLabel>
            <Form.Select value={form.maritalStatus} onChange={set("maritalStatus")}>
              <option value="">Seleccionar...</option>
              {ESTADO_CIVIL_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Ocupación</FormLabel>
            <Form.Control
              value={form.occupation}
              onChange={set("occupation")}
              placeholder="Ingeniera Informática en AES Group SA"
            />
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-3">
        <Col md={6}>
          <Form.Group>
            <FormLabel>Email</FormLabel>
            <Form.Control
              type="email"
              value={form.email}
              onChange={set("email")}
              placeholder="Maria@email.com"
              isInvalid={!!fieldErrors.email}
            />
            {fieldErrors.email && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.email}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <FormLabel required>Teléfono</FormLabel>
            <Form.Control
              value={form.phone}
              onChange={set("phone")}
              placeholder="0985235689"
              isInvalid={!!fieldErrors.phone}
            />
            {fieldErrors.phone && (
              <Form.Control.Feedback type="invalid">
                {fieldErrors.phone}
              </Form.Control.Feedback>
            )}
          </Form.Group>
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col md={6}>
          <Form.Group>
            <FormLabel>Dirección</FormLabel>
            <Form.Control
              value={form.address}
              onChange={set("address")}
              placeholder="Barrio X, Encarnación"
            />
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group>
            <FormLabel>Ingresos Anuales</FormLabel>
            <Form.Control
              value={form.annualIncome}
              onChange={set("annualIncome")}
              placeholder="85.000 US$"
            />
          </Form.Group>
        </Col>
      </Row>
    </>
  );
}
