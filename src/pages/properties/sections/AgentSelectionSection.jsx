import { Row, Col, Card } from "react-bootstrap";
import SuggestedAgents from "../../../components/properties/SuggestedAgents";

/**
 * Sección para seleccionar un agente inmobiliario.
 * @param {Object} props
 * @param {Object} props.form - Estado del formulario
 * @param {function} props.set - Función para actualizar campos del formulario
 */
export function AgentSelectionSection({ form, set }) {
  const handleSelectAgent = (agentId) => {
    set("agentId")({ target: { value: agentId } });
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Body>
        <Row>
          <Col xs={12}>
            <SuggestedAgents
              propertyType={form.propertyType}
              category={form.category}
              city={form.city}
              selectedAgentId={form.agentId}
              onSelectAgent={handleSelectAgent}
              limit={6}
            />
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
