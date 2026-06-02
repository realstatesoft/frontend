import { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button, Spinner, Image } from "react-bootstrap";
import { Link } from "react-router-dom";
import propertyApi from "../../services/properties/propertyApi";
import Swal from "sweetalert2";
import AssignAgentModal from "./AssignAgentModal";

export default function AssignmentSection({ propertyId, isOwner }) {
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await propertyApi.getAssignmentStatus(propertyId);
      setAssignment(res.data?.data ?? null);
    } catch {
      setAssignment(null);
    } finally {
      setLoading(false);
    }
  }, [propertyId]);

  useEffect(() => {
    if (isOwner) fetchStatus();
  }, [isOwner, fetchStatus]);

  async function handleRevoke() {
    if (!assignment?.assignmentId) return;
    const confirm = await Swal.fire({
      title: "¿Revocar solicitud?",
      text: "El agente ya no podrá gestionar esta propiedad",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Sí, revocar",
      cancelButtonText: "Cancelar",
    });
    if (!confirm.isConfirmed) return;
    setActionLoading(true);
    try {
      await propertyApi.revokeAssignment(assignment.assignmentId);
      Swal.fire({ icon: "success", title: "Solicitud revocada", timer: 1500, showConfirmButton: false });
      fetchStatus();
    } catch {
      Swal.fire({ icon: "error", title: "Error al revocar" });
    } finally {
      setActionLoading(false);
    }
  }

  if (!isOwner || loading) {
    if (loading && isOwner) {
      return (
        <Card className="mb-4">
          <Card.Body className="text-center py-3">
            <Spinner animation="border" size="sm" />
          </Card.Body>
        </Card>
      );
    }
    return null;
  }

  const status = assignment?.status;
  const agentName = assignment?.agentName || "";
  const agentAvatar = assignment?.agentAvatar;
  const agentProfileId = assignment?.agentProfileId;
  const agentRating = assignment?.agentRating;
  const agentReviewCount = assignment?.agentReviewCount;

  return (
    <>
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="h6 mb-3">Gestión de la propiedad</Card.Title>

          {!status && (
            <div>
              <p className="text-muted mb-2">Esta propiedad no tiene un agente asignado todavía</p>
              <Button size="sm" variant="primary" onClick={() => setShowModal(true)}>
                Asignar agente
              </Button>
            </div>
          )}

          {status === "PENDING" && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                {agentAvatar && <Image src={agentAvatar} roundedCircle width={32} height={32} />}
                <span className="fw-semibold">{agentName}</span>
                <Badge bg="warning" text="dark">Pendiente</Badge>
              </div>
              <Button size="sm" variant="outline-danger" onClick={handleRevoke} disabled={actionLoading}>
                {actionLoading ? "Revocando..." : "Revocar solicitud"}
              </Button>
            </div>
          )}

          {status === "ACCEPTED" && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                {agentAvatar && <Image src={agentAvatar} roundedCircle width={32} height={32} />}
                <span className="fw-semibold">{agentName}</span>
                <Badge bg="success">Aceptado</Badge>
              </div>
              {agentRating != null && (
                <small className="text-muted d-block mb-2">
                  {"★".repeat(Math.round(agentRating))} {agentRating.toFixed(1)} ({agentReviewCount ?? 0} reseñas)
                </small>
              )}
              <Button size="sm" variant="outline-primary" as={Link} to={`/agents/${agentProfileId}`}>
                Ver perfil
              </Button>
            </div>
          )}

          {status === "REJECTED" && (
            <div>
              <div className="d-flex align-items-center gap-2 mb-2">
                {agentAvatar && <Image src={agentAvatar} roundedCircle width={32} height={32} />}
                <span><strong>{agentName}</strong> rechazó la solicitud</span>
                <Badge bg="danger">Rechazado</Badge>
              </div>
              <Button size="sm" variant="primary" onClick={() => setShowModal(true)}>
                Asignar otro agente
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      <AssignAgentModal
        propertyId={propertyId}
        show={showModal}
        onHide={() => setShowModal(false)}
        onAssigned={fetchStatus}
      />
    </>
  );
}
