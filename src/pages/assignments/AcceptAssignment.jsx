import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link, Navigate, useLocation } from "react-router-dom";
import { Container, Card, Spinner, Alert, Button, Stack } from "react-bootstrap";
import { CheckCircleFill, XCircleFill, HouseDoor, ArrowLeft } from "react-bootstrap-icons";
import Swal from "sweetalert2";

import { useAuth } from "../../hooks/useAuth";
import { acceptAssignment, rejectAssignment } from "../../services/assignments/assignmentApi";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";

export default function AcceptAssignment() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const location = useLocation();
    const { isAuthenticated } = useAuth();

    const [status, setStatus] = useState("idle"); // idle | loading | accepted | rejected | error
    const [errorMsg, setErrorMsg] = useState("");
    const [assignmentData, setAssignmentData] = useState(null);

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const handleAccept = async () => {
        try {
            setStatus("loading");
            const data = await acceptAssignment(id, token);
            setAssignmentData(data);
            setStatus("accepted");
            await Swal.fire({
                icon: "success",
                title: "¡Asignación aceptada!",
                text: `Ahora gestionas la propiedad "${data?.propertyTitle || ""}".`,
                timer: 3000,
                showConfirmButton: false,
            });
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "No se pudo aceptar la asignación.";
            setErrorMsg(msg);
            setStatus("error");
        }
    };

    const handleReject = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Rechazar asignación",
            text: "¿Estás seguro que deseas rechazar esta asignación? No podrás gestionar esta propiedad.",
            showCancelButton: true,
            confirmButtonText: "Rechazar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc3545",
        });

        if (!result.isConfirmed) return;

        try {
            setStatus("loading");
            await rejectAssignment(id, token);
            setStatus("rejected");
        } catch (err) {
            const msg =
                err?.response?.data?.message ||
                err?.message ||
                "No se pudo rechazar la asignación.";
            setErrorMsg(msg);
            setStatus("error");
        }
    };

    return (
        <>
            <CustomNavbar />
            <div className="bg-light min-vh-100 d-flex align-items-center">
                <Container style={{ maxWidth: "560px" }} className="py-5">
                    <Card className="shadow-sm border-0 rounded-4 text-center p-4">
                        {/* ── Loading ─────────────────────────────────── */}
                        {status === "loading" && (
                            <Card.Body className="py-5">
                                <Spinner animation="border" variant="primary" className="mb-3" />
                                <p className="text-muted mb-0">Procesando solicitud...</p>
                            </Card.Body>
                        )}

                        {/* ── Idle — show accept/reject options ───────── */}
                        {status === "idle" && (
                            <Card.Body className="py-4">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                                    }}
                                >
                                    <HouseDoor size={36} className="text-white" />
                                </div>
                                <h3 className="fw-bold mb-2">Asignación de Propiedad</h3>
                                <p className="text-muted mb-4">
                                    Un propietario te ha solicitado gestionar su propiedad.
                                    ¿Deseas aceptar la asignación?
                                </p>
                                <Stack direction="horizontal" gap={3} className="justify-content-center">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        className="px-4"
                                        onClick={handleAccept}
                                    >
                                        <CheckCircleFill className="me-2" />
                                        Aceptar
                                    </Button>
                                    <Button
                                        variant="outline-danger"
                                        size="lg"
                                        className="px-4"
                                        onClick={handleReject}
                                    >
                                        <XCircleFill className="me-2" />
                                        Rechazar
                                    </Button>
                                </Stack>
                            </Card.Body>
                        )}

                        {/* ── Accepted ────────────────────────────────── */}
                        {status === "accepted" && (
                            <Card.Body className="py-4">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                                    }}
                                >
                                    <CheckCircleFill size={36} className="text-white" />
                                </div>
                                <h3 className="fw-bold text-success mb-2">¡Asignación aceptada!</h3>
                                <p className="text-muted mb-4">
                                    Ahora gestionas la propiedad
                                    {assignmentData?.propertyTitle
                                        ? ` "${assignmentData.propertyTitle}"`
                                        : ""}
                                    . El propietario será notificado.
                                </p>
                                {assignmentData?.propertyId && (
                                    <Link
                                        to={`/properties/${assignmentData.propertyId}`}
                                        className="btn btn-primary me-2"
                                    >
                                        Ver propiedad
                                    </Link>
                                )}
                                <Link to="/" className="btn btn-outline-secondary">
                                    <ArrowLeft className="me-1" /> Ir al inicio
                                </Link>
                            </Card.Body>
                        )}

                        {/* ── Rejected ────────────────────────────────── */}
                        {status === "rejected" && (
                            <Card.Body className="py-4">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: "linear-gradient(135deg, #6b7280 0%, #4b5563 100%)",
                                    }}
                                >
                                    <XCircleFill size={36} className="text-white" />
                                </div>
                                <h3 className="fw-bold mb-2">Asignación rechazada</h3>
                                <p className="text-muted mb-4">
                                    Has rechazado la solicitud. El propietario será notificado
                                    y podrá buscar otro agente.
                                </p>
                                <Link to="/" className="btn btn-outline-primary">
                                    <ArrowLeft className="me-1" /> Ir al inicio
                                </Link>
                            </Card.Body>
                        )}

                        {/* ── Error ───────────────────────────────────── */}
                        {status === "error" && (
                            <Card.Body className="py-4">
                                <div
                                    className="mx-auto mb-4 d-flex align-items-center justify-content-center rounded-circle"
                                    style={{
                                        width: 80,
                                        height: 80,
                                        background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
                                    }}
                                >
                                    <XCircleFill size={36} className="text-white" />
                                </div>
                                <h3 className="fw-bold text-danger mb-2">Error</h3>
                                <Alert variant="danger" className="text-start">
                                    {errorMsg}
                                </Alert>
                                <Stack direction="horizontal" gap={2} className="justify-content-center">
                                    <Button variant="primary" onClick={() => setStatus("idle")}>
                                        Reintentar
                                    </Button>
                                    <Link to="/" className="btn btn-outline-secondary">
                                        <ArrowLeft className="me-1" /> Ir al inicio
                                    </Link>
                                </Stack>
                            </Card.Body>
                        )}
                    </Card>
                </Container>
            </div>
            <Footer />
        </>
    );
}
