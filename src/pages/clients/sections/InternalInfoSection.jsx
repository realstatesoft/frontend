import { Row, Col, Form } from "react-bootstrap";
import {
  FormSectionTitle,
  FormLabel,
  FormMultiSelect,
  FormTag,
} from "../../../components/properties/FormComponents";

const PRIORIDAD_OPTIONS = ["Alta", "Media", "Baja"];
const ESTADO_OPTIONS = ["Activo", "Inactivo", "En seguimiento"];
const ETIQUETA_OPTIONS = [
  "Comprador serio",
  "Financiación pre-aprobada",
  "Inversionista",
  "Primera vivienda",
  "Mudanza urgente",
];

export function InternalInfoSection({ form, set, setArr }) {
  return (
    <>
      <FormSectionTitle title="Información Interna del Cliente" />

      <Row className="g-3 mb-3">
        <Col md={4}>
          <Form.Group>
            <FormLabel>Prioridad</FormLabel>
            <Form.Select value={form.priority} onChange={set("priority")}>
              {PRIORIDAD_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Estado</FormLabel>
            <Form.Select value={form.status} onChange={set("status")}>
              {ESTADO_OPTIONS.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={4}>
          <Form.Group>
            <FormLabel>Canal de Origen del Cliente</FormLabel>
            <Form.Control
              value={form.originChannel}
              onChange={set("originChannel")}
              placeholder="Contacto vía Facebook"
            />
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <FormLabel>Comentarios</FormLabel>
        <Form.Control
          as="textarea"
          rows={3}
          value={form.comments}
          onChange={set("comments")}
          placeholder="El cliente prefiere conocer el perfil de los interesados en su propiedad"
        />
      </Form.Group>

      <Row className="g-3 mb-4 align-items-start">
        <Col md={6}>
          <Form.Group>
            <FormLabel>Etiquetas</FormLabel>
            <FormMultiSelect
              options={ETIQUETA_OPTIONS}
              selected={form.tags}
              onChange={setArr("tags")}
              placeholder="Seleccionar..."
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-center" style={{ paddingTop: "2rem" }}>
          <Form.Check
            type="checkbox"
            id="isSearchingProperty"
            label="¿El cliente está en búsqueda de una propiedad?"
            checked={form.isSearchingProperty}
            onChange={(e) =>
              set("isSearchingProperty")({ target: { value: e.target.checked } })
            }
          />
        </Col>
      </Row>
    </>
  );
}
