import { useState } from "react";
import { Alert, Button, Card, Col, Form, Row } from "react-bootstrap";
import { PlusLg, XLg } from "react-bootstrap-icons";
import {
  EMPTY_INTERACTION_FORM,
  INTERACTION_FORM_OPTIONS,
} from "../../../constants/clientInteractionConstants";
import { toDateTimeLocalInput } from "../../../utils/dateFormat";

function buildInitialForm() {
  return {
    ...EMPTY_INTERACTION_FORM,
    occurredAt: toDateTimeLocalInput(new Date()),
  };
}

export default function InteractionComposer({
  open,
  onToggle,
  onSubmit,
  creating,
}) {
  const [form, setForm] = useState(buildInitialForm);
  const [localError, setLocalError] = useState(null);

  const handleToggle = (nextOpen) => {
    if (nextOpen) {
      setForm(buildInitialForm());
      setLocalError(null);
    }

    onToggle(nextOpen);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));

    if (localError) {
      setLocalError(null);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.type) {
      setLocalError("Seleccioná un tipo de interacción.");
      return;
    }

    const payload = {
      type: form.type,
      subject: form.subject.trim(),
      note: form.note.trim(),
      outcome: form.outcome.trim(),
      occurredAt: form.occurredAt || undefined,
    };

    const success = await onSubmit(payload);
    if (success) {
      setForm(buildInitialForm());
      handleToggle(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm mb-4" style={{ borderRadius: "1.25rem" }}>
      <Card.Body className="p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-3">
          <div>
            <h4 className="fw-bold mb-1">Registrar interacción</h4>
            <p className="text-muted mb-0 small">
              Cargá notas comerciales manuales. Los eventos automáticos del sistema se
              mostrarán en la misma línea de tiempo.
            </p>
          </div>
          <Button
            variant={open ? "outline-secondary" : "primary"}
            className="rounded-pill px-4 align-self-start"
            onClick={() => handleToggle(!open)}
          >
            {open ? (
              <>
                <XLg className="me-2" />
                Cerrar
              </>
            ) : (
              <>
                <PlusLg className="me-2" />
                Nueva interacción
              </>
            )}
          </Button>
        </div>

        {open && (
          <Form onSubmit={handleSubmit}>
            {localError && (
              <Alert variant="danger" className="py-2">
                {localError}
              </Alert>
            )}

            <Row className="g-3">
              <Col lg={3} md={6}>
                <Form.Label className="small fw-semibold text-secondary">
                  Tipo
                </Form.Label>
                <Form.Select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  disabled={creating}
                >
                  {INTERACTION_FORM_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Form.Select>
              </Col>

              <Col lg={5} md={6}>
                <Form.Label className="small fw-semibold text-secondary">
                  Asunto
                </Form.Label>
                <Form.Control
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="Ej. Llamada de seguimiento por presupuesto"
                  disabled={creating}
                />
              </Col>

              <Col lg={4} md={6}>
                <Form.Label className="small fw-semibold text-secondary">
                  Fecha y hora
                </Form.Label>
                <Form.Control
                  type="datetime-local"
                  name="occurredAt"
                  value={form.occurredAt}
                  onChange={handleChange}
                  disabled={creating}
                />
              </Col>

              <Col xs={12}>
                <Form.Label className="small fw-semibold text-secondary">
                  Nota
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="note"
                  value={form.note}
                  onChange={handleChange}
                  placeholder="Registrá contexto, acuerdos, próximos pasos o datos relevantes."
                  disabled={creating}
                />
              </Col>

              <Col xs={12}>
                <Form.Label className="small fw-semibold text-secondary">
                  Resultado
                </Form.Label>
                <Form.Control
                  type="text"
                  name="outcome"
                  value={form.outcome}
                  onChange={handleChange}
                  placeholder="Ej. FOLLOW_UP_SCHEDULED o INFO_CAPTURED"
                  disabled={creating}
                />
              </Col>
            </Row>

            <div className="d-flex flex-column flex-sm-row justify-content-end gap-2 mt-4">
              <Button
                type="button"
                variant="outline-secondary"
                className="rounded-pill px-4"
                onClick={() => handleToggle(false)}
                disabled={creating}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="rounded-pill px-4"
                disabled={creating}
              >
                {creating ? "Guardando..." : "Guardar interacción"}
              </Button>
            </div>
          </Form>
        )}
      </Card.Body>
    </Card>
  );
}
