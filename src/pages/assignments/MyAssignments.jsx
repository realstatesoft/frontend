import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
    Container,
    Card,
    Badge,
    Button,
    Spinner,
    Alert,
    Nav,
    Stack,
    Row,
    Col,
} from "react-bootstrap";
import {
    HouseDoor,
    CheckCircleFill,
    XCircleFill,
    ClockFill,
    PersonFill,
    CalendarEvent,
    ArrowRight,
} from "react-bootstrap-icons";
import { Link, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";

import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";
import {
    getMyAssignments,
    acceptAssignment,
    rejectAssignment,
} from "../../services/assignments/assignmentApi";

/* ────────────────────────── helpers ────────────────────────── */

const STATUS_CONFIG = {
    PENDING: { label: "Pendiente", bg: "warning", icon: ClockFill },
    ACCEPTED: { label: "Aceptada", bg: "success", icon: CheckCircleFill },
    REJECTED: { label: "Rechazada", bg: "danger", icon: XCircleFill },
    REVOKED: { label: "Revocada", bg: "secondary", icon: XCircleFill },
};

const MOCK_DATA = [
    {
        id: 101,
        propertyId: 1,
        propertyTitle: "Casa en Belgrano",
        assignedByName: "Juan Pérez",
        status: "PENDING",
        assignedAt: new Date().toISOString(),
    },
    {
        id: 102,
        propertyId: 2,
        propertyTitle: "Departamento en Palermo",
        assignedByName: "María García",
        status: "PENDING",
        assignedAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: 103,
        propertyId: 3,
        propertyTitle: "PH en Caballito",
        assignedByName: "Carlos López",
        status: "ACCEPTED",
        assignedAt: new Date(Date.now() - 172800000).toISOString(),
    },
];

function formatDate(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}

/* ────────────────────────── component ─────────────────────── */

export default function MyAssignments() {
    const [searchParams] = useSearchParams();
    const isMock = searchParams.get("mock") === "true";

    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(null); // id being acted on
    const [activeTab, setActiveTab] = useState("PENDING");

    /* ── fetch ──────────────────────────────────────────────── */
    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            if (isMock) {
                await new Promise((r) => setTimeout(r, 800));
                setAssignments(MOCK_DATA);
            } else {
                const data = await getMyAssignments();
                setAssignments(Array.isArray(data) ? data : []);
            }
        } catch (err) {
            console.error("Error al cargar asignaciones:", err);
            setError(
                err.response?.data?.message ||
                "No se pudieron cargar las asignaciones. Intenta de nuevo."
            );
        } finally {
            setLoading(false);
        }
    }, [isMock]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    /* ── stats ──────────────────────────────────────────────── */
    const stats = useMemo(
        () => ({
            pending: assignments.filter((a) => a.status === "PENDING").length,
            accepted: assignments.filter((a) => a.status === "ACCEPTED").length,
            total: assignments.length,
        }),
        [assignments]
    );

    /* ── filtered list ─────────────────────────────────────── */
    const filtered = useMemo(
        () => assignments.filter((a) => a.status === activeTab),
        [assignments, activeTab]
    );

    /* ── actions ────────────────────────────────────────────── */
    const handleAccept = async (id) => {
        try {
            setActionLoading(id);
            if (isMock) {
                await new Promise((r) => setTimeout(r, 1000));
                setAssignments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: "ACCEPTED" } : a))
                );
            } else {
                const updated = await acceptAssignment(id);
                setAssignments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, ...updated, status: "ACCEPTED" } : a))
                );
            }
            await Swal.fire({
                icon: "success",
                title: "¡Asignación aceptada!",
                text: "Ahora gestionas esta propiedad.",
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "No se pudo aceptar la asignación.",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Rechazar asignación",
            text: "¿Estás seguro? El propietario será notificado.",
            showCancelButton: true,
            confirmButtonText: "Rechazar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc3545",
        });
        if (!result.isConfirmed) return;

        try {
            setActionLoading(id);
            if (isMock) {
                await new Promise((r) => setTimeout(r, 1000));
                setAssignments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a))
                );
            } else {
                await rejectAssignment(id);
                setAssignments((prev) =>
                    prev.map((a) => (a.id === id ? { ...a, status: "REJECTED" } : a))
                );
            }
            await Swal.fire({
                icon: "info",
                title: "Asignación rechazada",
                timer: 2500,
                showConfirmButton: false,
                toast: true,
                position: "top-end",
            });
        } catch (err) {
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || "No se pudo rechazar la asignación.",
            });
        } finally {
            setActionLoading(null);
        }
    };

    /* ── render ─────────────────────────────────────────────── */
    return (
        <div className="my-assignments-page">
            <CustomNavbar />

            <Container className="py-5">
                {/* Header */}
                <header className="mb-4">
                    <h1 className="fw-bold mb-2">Mis Asignaciones</h1>
                    <p className="text-muted mb-0">
                        Propiedades que los propietarios te solicitaron gestionar.
                    </p>
                </header>

                {/* Stats */}
                <Row className="g-3 mb-4">
                    <Col xs={6} md={4}>
                        <Card className="border-0 shadow-sm text-center py-3">
                            <h2 className="fw-bold text-warning mb-0">{stats.pending}</h2>
                            <small className="text-muted">Pendientes</small>
                        </Card>
                    </Col>
                    <Col xs={6} md={4}>
                        <Card className="border-0 shadow-sm text-center py-3">
                            <h2 className="fw-bold text-success mb-0">{stats.accepted}</h2>
                            <small className="text-muted">Aceptadas</small>
                        </Card>
                    </Col>
                    <Col xs={12} md={4}>
                        <Card className="border-0 shadow-sm text-center py-3">
                            <h2 className="fw-bold text-primary mb-0">{stats.total}</h2>
                            <small className="text-muted">Total</small>
                        </Card>
                    </Col>
                </Row>

                {/* Error */}
                {error && (
                    <Alert variant="danger" dismissible onClose={() => setError(null)}>
                        {error}
                    </Alert>
                )}

                {/* Tabs */}
                <Nav variant="tabs" className="mb-4" activeKey={activeTab} onSelect={setActiveTab}>
                    <Nav.Item>
                        <Nav.Link eventKey="PENDING">
                            Pendientes{" "}
                            {stats.pending > 0 && (
                                <Badge bg="warning" text="dark" pill className="ms-1">
                                    {stats.pending}
                                </Badge>
                            )}
                        </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                        <Nav.Link eventKey="ACCEPTED">Aceptadas</Nav.Link>
                    </Nav.Item>
                </Nav>

                {/* Content */}
                <section>
                    {loading ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" variant="primary" />
                            <p className="text-muted mt-3">Cargando asignaciones...</p>
                        </div>
                    ) : filtered.length > 0 ? (
                        <Row className="g-3">
                            {filtered.map((assignment) => {
                                const cfg = STATUS_CONFIG[assignment.status] || STATUS_CONFIG.PENDING;
                                const StatusIcon = cfg.icon;
                                const isActing = actionLoading === assignment.id;

                                return (
                                    <Col key={assignment.id} xs={12} md={6}>
                                        <Card className="border-0 shadow-sm h-100">
                                            <Card.Body className="d-flex flex-column">
                                                {/* Top row */}
                                                <div className="d-flex justify-content-between align-items-start mb-3">
                                                    <div className="d-flex align-items-center gap-2">
                                                        <div
                                                            className="d-flex align-items-center justify-content-center rounded-3"
                                                            style={{
                                                                width: 44,
                                                                height: 44,
                                                                background:
                                                                    "linear-gradient(135deg,#2563eb 0%,#1d4ed8 100%)",
                                                            }}
                                                        >
                                                            <HouseDoor size={22} className="text-white" />
                                                        </div>
                                                        <div>
                                                            <h6 className="fw-bold mb-0">
                                                                {assignment.propertyTitle || `Propiedad #${assignment.propertyId}`}
                                                            </h6>
                                                            <small className="text-muted d-flex align-items-center gap-1">
                                                                <PersonFill size={12} />
                                                                {assignment.assignedByName || "Propietario"}
                                                            </small>
                                                        </div>
                                                    </div>
                                                    <Badge bg={cfg.bg} className="d-flex align-items-center gap-1">
                                                        <StatusIcon size={12} />
                                                        {cfg.label}
                                                    </Badge>
                                                </div>

                                                {/* Date */}
                                                <small className="text-muted d-flex align-items-center gap-1 mb-3">
                                                    <CalendarEvent size={12} />
                                                    Solicitada el {formatDate(assignment.assignedAt)}
                                                </small>

                                                {/* Actions */}
                                                <div className="mt-auto">
                                                    {assignment.status === "PENDING" && (
                                                        <Stack direction="horizontal" gap={2}>
                                                            <Button
                                                                variant="success"
                                                                size="sm"
                                                                className="flex-fill"
                                                                disabled={isActing}
                                                                onClick={() => handleAccept(assignment.id)}
                                                            >
                                                                {isActing ? (
                                                                    <Spinner size="sm" animation="border" />
                                                                ) : (
                                                                    <>
                                                                        <CheckCircleFill className="me-1" /> Aceptar
                                                                    </>
                                                                )}
                                                            </Button>
                                                            <Button
                                                                variant="outline-danger"
                                                                size="sm"
                                                                className="flex-fill"
                                                                disabled={isActing}
                                                                onClick={() => handleReject(assignment.id)}
                                                            >
                                                                <XCircleFill className="me-1" /> Rechazar
                                                            </Button>
                                                        </Stack>
                                                    )}
                                                    {assignment.status === "ACCEPTED" && (
                                                        <Link
                                                            to={`/properties/${assignment.propertyId}`}
                                                            className="btn btn-outline-primary btn-sm w-100"
                                                        >
                                                            Ver propiedad <ArrowRight className="ms-1" />
                                                        </Link>
                                                    )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                );
                            })}
                        </Row>
                    ) : (
                        <div className="text-center py-5">
                            <HouseDoor size={48} className="text-muted mb-3" />
                            <p className="text-muted">
                                {activeTab === "PENDING"
                                    ? "No tenés solicitudes pendientes en este momento."
                                    : "No tenés asignaciones aceptadas todavía."}
                            </p>
                        </div>
                    )}
                </section>
            </Container>

            <Footer />
        </div>
    );
}
