import React, { useState } from "react";
import {
    Container, Row, Col, Card, Form, Table, Button,
    Spinner, InputGroup, Badge,
} from "react-bootstrap";
import { Link } from "react-router-dom";
import {
    Search, Funnel, Download, Eye, Pencil, Trash,
    CheckAll, XCircle,
} from "react-bootstrap-icons";
import Swal from "sweetalert2";

import useClients from "../../hooks/useClients";
import { useAuth } from "../../hooks/useAuth";
import Pagination from "../../components/properties/Pagination";
import ConfirmDialog from "../../components/commons/ConfirmDialog";
import CustomNavbar from "../../components/Landing/Navbar";
import Footer from "../../components/Landing/Footer";

export default function ClientList() {
    const { user } = useAuth();
    const {
        clients,
        loading,
        error,
        page,
        totalPages,
        totalElements,
        filters,
        selectedIds,
        handlePageChange,
        updateFilters,
        removeClient,
        exportCsv,
        toggleSelect,
        selectAll,
        clearSelection,
        batchMarkInactive,
    } = useClients();

    // Permissions — only AGENT or ADMIN can edit/delete/export
    const canEdit = user?.role === "AGENT" || user?.role === "ADMIN";
    const canExport = canEdit;

    const [searchInput, setSearchInput] = useState(filters.q || "");
    const [showConfirm, setShowConfirm] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    // ── Search ──────────────────────────────────────────────────────────────
    const handleSearch = (e) => {
        e.preventDefault();
        updateFilters({ q: searchInput });
    };

    const clearSearch = () => {
        setSearchInput("");
        updateFilters({ q: "" });
    };

    const handleFilterChange = (field, value) => {
        updateFilters({ [field]: value });
    };

    // ── Delete ──────────────────────────────────────────────────────────────
    const confirmDelete = (client) => {
        setClientToDelete(client);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (clientToDelete) {
            await removeClient(clientToDelete.id);
        }
        setShowConfirm(false);
        setClientToDelete(null);
    };

    // ── Export CSV ───────────────────────────────────────────────────────────
    const handleExport = async () => {
        try {
            setExporting(true);
            const blob = await exportCsv();
            const url = window.URL.createObjectURL(new Blob([blob]));
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `clientes_${new Date().toISOString().split("T")[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            await Swal.fire({
                icon: "success",
                title: "Exportación exitosa",
                text: "El archivo CSV fue descargado.",
                timer: 1800,
                showConfirmButton: false,
            });
        } catch (err) {
            await Swal.fire({
                icon: "error",
                title: "Error al exportar",
                text: err?.response?.data?.message || err.message || "No se pudo exportar.",
            });
        } finally {
            setExporting(false);
        }
    };

    // ── Batch actions ───────────────────────────────────────────────────────
    const handleBatchInactive = async () => {
        const result = await Swal.fire({
            icon: "warning",
            title: "Marcar como inactivos",
            text: `¿Marcar ${selectedIds.size} cliente(s) como inactivo(s)?`,
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
        });
        if (result.isConfirmed) {
            await batchMarkInactive(selectedIds);
        }
    };

    // ── Helpers ─────────────────────────────────────────────────────────────
    const getStatusBadgeClass = (status) => {
        switch (status) {
            case "ACTIVE":
                return "bg-success";
            case "INACTIVE":
                return "bg-secondary";
            default:
                return "bg-primary";
        }
    };

    const hasBatchSelection = selectedIds.size > 0;
    const allSelected = clients.length > 0 && selectedIds.size === clients.length;

    return (
        <>
            <CustomNavbar />
            <div className="bg-light min-vh-100">
                <Container className="py-4">
                    {/* ── Header ──────────────────────────────────────────── */}
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <h2 className="mb-0 fw-bold">Mis Clientes</h2>
                            <p className="text-muted mb-0 small">
                                Gestiona los clientes asignados a tu cartera
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            {canExport && (
                                <Button variant="outline-primary" onClick={handleExport} disabled={exporting}>
                                    {exporting ? <Spinner size="sm" className="me-2" /> : <Download className="me-2" />}
                                    Exportar CSV
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ── Batch toolbar ───────────────────────────────────── */}
                    {hasBatchSelection && (
                        <Card className="border-primary shadow-sm mb-3">
                            <Card.Body className="py-2 d-flex align-items-center gap-3">
                                <Badge bg="primary" className="fs-6 px-3 py-2">
                                    {selectedIds.size} seleccionado(s)
                                </Badge>
                                {canExport && (
                                    <Button size="sm" variant="outline-primary" onClick={handleExport} disabled={exporting}>
                                        <Download className="me-1" /> Exportar CSV
                                    </Button>
                                )}
                                {canEdit && (
                                    <Button size="sm" variant="outline-warning" onClick={handleBatchInactive}>
                                        <XCircle className="me-1" /> Marcar inactivo
                                    </Button>
                                )}
                                <Button size="sm" variant="outline-secondary" onClick={clearSelection}>
                                    Deseleccionar todo
                                </Button>
                            </Card.Body>
                        </Card>
                    )}

                    {/* ── Filters Bar ────────────────────────────────────── */}
                    <Card className="shadow-sm mb-4 border-0">
                        <Card.Body>
                            <Form onSubmit={handleSearch}>
                                <Row className="g-3 align-items-end">
                                    <Col md={4}>
                                        <Form.Label className="text-muted small mb-1">Buscar</Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white"><Search size={14} /></InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="Nombre, Email..."
                                                value={searchInput}
                                                onChange={(e) => setSearchInput(e.target.value)}
                                            />
                                            {searchInput && (
                                                <Button variant="outline-secondary" onClick={clearSearch}>✕</Button>
                                            )}
                                            <Button variant="primary" type="submit">Buscar</Button>
                                        </InputGroup>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Label className="text-muted small mb-1">Estado</Form.Label>
                                        <Form.Select
                                            value={filters.status || ""}
                                            onChange={(e) => handleFilterChange("status", e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            <option value="ACTIVE">Activo</option>
                                            <option value="INACTIVE">Inactivo</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Label className="text-muted small mb-1">Tipo</Form.Label>
                                        <Form.Select
                                            value={filters.clientType || ""}
                                            onChange={(e) => handleFilterChange("clientType", e.target.value)}
                                        >
                                            <option value="">Todos</option>
                                            <option value="INDIVIDUAL">Particular</option>
                                            <option value="COMPANY">Empresa</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={2}>
                                        <Form.Label className="text-muted small mb-1">Ordenar por</Form.Label>
                                        <Form.Select
                                            value={filters.sort || "createdAt,desc"}
                                            onChange={(e) => handleFilterChange("sort", e.target.value)}
                                        >
                                            <option value="createdAt,desc">Más recientes</option>
                                            <option value="createdAt,asc">Más antiguos</option>
                                            <option value="userName,asc">Nombre (A-Z)</option>
                                            <option value="userEmail,asc">Email (A-Z)</option>
                                        </Form.Select>
                                    </Col>

                                    <Col md={2} className="d-flex align-items-end">
                                        <Button
                                            variant={showFilters ? "secondary" : "outline-secondary"}
                                            className="w-100"
                                            onClick={() => setShowFilters(!showFilters)}
                                        >
                                            <Funnel className="me-1" />
                                            {showFilters ? "Ocultar" : "Más filtros"}
                                        </Button>
                                    </Col>
                                </Row>

                                {/* ── Date range (collapsible) ──────────────── */}
                                {showFilters && (
                                    <Row className="g-3 mt-1">
                                        <Col md={3}>
                                            <Form.Label className="text-muted small mb-1">
                                                Registrado desde
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.createdAtFrom || ""}
                                                onChange={(e) => handleFilterChange("createdAtFrom", e.target.value)}
                                            />
                                        </Col>
                                        <Col md={3}>
                                            <Form.Label className="text-muted small mb-1">
                                                Registrado hasta
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                value={filters.createdAtTo || ""}
                                                onChange={(e) => handleFilterChange("createdAtTo", e.target.value)}
                                            />
                                        </Col>
                                    </Row>
                                )}
                            </Form>
                        </Card.Body>
                    </Card>

                    {/* ── Table ───────────────────────────────────────────── */}
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-0">
                            {error && <div className="alert alert-danger m-3">{error}</div>}

                            <div className="table-responsive">
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light text-muted">
                                        <tr>
                                            {canEdit && (
                                                <th className="border-0" style={{ width: "40px" }}>
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={allSelected}
                                                        onChange={selectAll}
                                                        title="Seleccionar todos"
                                                    />
                                                </th>
                                            )}
                                            <th className="border-0 fw-medium">Nombre</th>
                                            <th className="border-0 fw-medium">Email</th>
                                            <th className="border-0 fw-medium">Teléfono</th>
                                            <th className="border-0 fw-medium">Tipo</th>
                                            <th className="border-0 fw-medium">Estado</th>
                                            <th className="border-0 fw-medium">Registrado</th>
                                            <th className="border-0 fw-medium text-end">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {loading ? (
                                            <tr>
                                                <td colSpan={canEdit ? 8 : 7} className="text-center py-5">
                                                    <Spinner animation="border" variant="primary" />
                                                    <p className="text-muted mt-2 mb-0">Cargando clientes...</p>
                                                </td>
                                            </tr>
                                        ) : clients.length === 0 ? (
                                            <tr>
                                                <td colSpan={canEdit ? 8 : 7} className="text-center py-5 text-muted">
                                                    <Funnel size={32} className="mb-3 opacity-50" />
                                                    <p className="mb-0">No se encontraron clientes con los filtros actuales.</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            clients.map((client) => (
                                                <tr key={client.id}>
                                                    {canEdit && (
                                                        <td>
                                                            <Form.Check
                                                                type="checkbox"
                                                                checked={selectedIds.has(client.id)}
                                                                onChange={() => toggleSelect(client.id)}
                                                            />
                                                        </td>
                                                    )}
                                                    <td className="fw-medium text-dark">
                                                        {client.userName || "N/A"}
                                                    </td>
                                                    <td className="text-muted">{client.userEmail || "-"}</td>
                                                    <td className="text-muted">{client.userPhone || client.phone || "-"}</td>
                                                    <td>
                                                        <span className="badge bg-light text-dark border">
                                                            {client.clientType === "COMPANY" ? "Empresa" : "Particular"}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${getStatusBadgeClass(client.status)}`}>
                                                            {client.status === "INACTIVE" ? "Inactivo" : "Activo"}
                                                        </span>
                                                    </td>
                                                    <td className="text-muted">
                                                        {client.createdAt
                                                            ? new Date(client.createdAt).toLocaleDateString()
                                                            : "-"}
                                                    </td>
                                                    <td className="text-end">
                                                        <Link
                                                            to={`/clients/${client.id}`}
                                                            className="btn btn-sm btn-light me-1"
                                                            title="Ver Perfil"
                                                        >
                                                            <Eye className="text-primary" />
                                                        </Link>
                                                        {canEdit && (
                                                            <>
                                                                <Link
                                                                    to={`/clients/${client.id}/edit`}
                                                                    className="btn btn-sm btn-light me-1"
                                                                    title="Editar"
                                                                >
                                                                    <Pencil className="text-secondary" />
                                                                </Link>
                                                                <Button
                                                                    variant="light"
                                                                    size="sm"
                                                                    onClick={() => confirmDelete(client)}
                                                                    title="Eliminar"
                                                                >
                                                                    <Trash className="text-danger" />
                                                                </Button>
                                                            </>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </Table>
                            </div>
                        </Card.Body>
                        <Card.Footer className="bg-white border-top-0 pt-0 pb-3">
                            <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted small">
                                    Mostrando {clients.length} de {totalElements} clientes
                                </span>
                                <Pagination
                                    currentPage={page + 1}
                                    totalPages={totalPages}
                                    onPageChange={(p) => handlePageChange(p - 1)}
                                />
                            </div>
                        </Card.Footer>
                    </Card>

                    {/* ── Delete Confirm Dialog ──────────────────────────── */}
                    <ConfirmDialog
                        show={showConfirm}
                        onHide={() => setShowConfirm(false)}
                        onConfirm={handleDelete}
                        title="Eliminar Cliente"
                        message={`¿Estás seguro que deseas archivar/eliminar a ${clientToDelete?.userName}? Esta acción no se puede deshacer de forma fácil.`}
                        confirmText="Eliminar"
                        variant="danger"
                    />
                </Container>
            </div>
            <Footer />
        </>
    );
}
