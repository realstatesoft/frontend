import React, { useState } from "react";
import { Container, Row, Col, Card, Form, Table, Button, Spinner, InputGroup, Dropdown, DropdownButton } from "react-bootstrap";
import { Link } from "react-router-dom";
import { Search, Funnel, Download, Eye, Pencil, Trash } from "react-bootstrap-icons";

import useClients from "../../hooks/useClients";
import Pagination from "../../components/properties/Pagination";
import ConfirmDialog from "../../components/commons/ConfirmDialog";

export default function ClientList() {
    const {
        clients,
        loading,
        error,
        page,
        totalPages,
        totalElements,
        filters,
        handlePageChange,
        updateFilters,
        removeClient,
        exportCsv,
    } = useClients();

    // Local state for the search input to avoid hitting API on every keystroke
    const [searchInput, setSearchInput] = useState(filters.q || "");
    const [showConfirm, setShowConfirm] = useState(false);
    const [clientToDelete, setClientToDelete] = useState(null);
    const [exporting, setExporting] = useState(false);

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

    const confirmDelete = (client) => {
        setClientToDelete(client);
        setShowConfirm(true);
    };

    const handleDelete = async () => {
        if (clientToDelete) {
            try {
                await removeClient(clientToDelete.id);
                // Toast can be added here
            } catch (err) {
                console.error("Error deleting client:", err);
            }
        }
        setShowConfirm(false);
        setClientToDelete(null);
    };

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
        } catch (err) {
            console.error("Error exporting clients:", err);
        } finally {
            setExporting(false);
        }
    };

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

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Mis Clientes</h2>
                <Button variant="outline-primary" onClick={handleExport} disabled={exporting}>
                    {exporting ? <Spinner size="sm" className="me-2" /> : <Download className="me-2" />}
                    Exportar CSV
                </Button>
            </div>

            <Card className="shadow-sm mb-4 border-0">
                <Card.Body>
                    <Form onSubmit={handleSearch}>
                        <Row className="g-3">
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
                                        <Button variant="outline-secondary" onClick={clearSearch}>X</Button>
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
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Card className="shadow-sm border-0">
                <Card.Body className="p-0">
                    {error && <div className="alert alert-danger m-3">{error}</div>}

                    <div className="table-responsive">
                        <Table hover className="mb-0 align-middle">
                            <thead className="bg-light text-muted">
                                <tr>
                                    <th className="border-0 fw-medium">Nombre</th>
                                    <th className="border-0 fw-medium">Email</th>
                                    <th className="border-0 fw-medium">Tipo</th>
                                    <th className="border-0 fw-medium">Estado</th>
                                    <th className="border-0 fw-medium">Registrado</th>
                                    <th className="border-0 fw-medium text-end">Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5">
                                            <Spinner animation="border" variant="primary" />
                                            <p className="text-muted mt-2 mb-0">Cargando clientes...</p>
                                        </td>
                                    </tr>
                                ) : clients.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-5 text-muted">
                                            <Funnel size={32} className="mb-3 opacity-50" />
                                            <p className="mb-0">No se encontraron clientes con los filtros actuales.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    clients.map((client) => (
                                        <tr key={client.id}>
                                            <td className="fw-medium text-dark">{client.userName || "N/A"}</td>
                                            <td className="text-muted">{client.userEmail}</td>
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
                                                {client.createdAt ? new Date(client.createdAt).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="text-end">
                                                <Link to={`/clients/${client.id}`} className="btn btn-sm btn-light me-1" title="Ver Perfil">
                                                    <Eye className="text-primary" />
                                                </Link>
                                                <Link to={`/clients/${client.id}/edit`} className="btn btn-sm btn-light me-1" title="Editar">
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
    );
}
