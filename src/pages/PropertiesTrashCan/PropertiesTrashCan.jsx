import { Col, Container, Row, Spinner, Button } from "react-bootstrap";
import { Trash3 } from "react-bootstrap-icons";
import useTrashcan from "../../hooks/useTrashcan"
import TrashPropertyCard from "../../components/properties/TrashPropertyCard";
import Navbar from "../../components/Landing/Navbar";
import ConfirmDialog from "../../components/commons/ConfirmDialog";

export default function PropertiesTrashCan() {
    const {
        properties,
        loading, 
        actionLoading, 
        confirmData,
        showConfirm,
        hideConfirm,
        openClearDialog,
        openDeleteDialog,
        openRestoreDialog
    } = useTrashcan();


    return (
        <>
            <Navbar />

            <Container className="py-5">
                <ConfirmDialog
                    show={showConfirm}
                    onHide={hideConfirm}
                    loading={actionLoading}
                    {...confirmData}
                />
                {/* Encabezado */}
                <div className="mb-4">
                    {/* fila título + botón */}
                    <div className="d-flex justify-content-between align-items-center mb-1">
                        <h2
                        className="fw-bold mb-0"
                        style={{ color: "var(--dark, #1e293b)" }}
                        >
                        Papelera de Propiedades
                        </h2>

                        <Button
                        style={{
                            fontSize: "0.8rem",
                            background: "var(--danger, #ef4444)",
                            border: "none",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "6px 10px"
                        }}
                        onClick={openClearDialog}
                        >
                        <Trash3 size={14} />
                        Vaciar papelera
                        </Button>
                    </div>

                    {/* descripción */}
                    <p
                        className="text-muted mb-0"
                        style={{ fontSize: "0.92rem" }}
                    >
                        Las propiedades borradas se mantendrán aquí durante 10 días,
                        en caso de que desees recuperarlas.
                    </p>
                    </div>

                {/* Loading */}
                {loading && (
                    <div className="text-center py-5">
                        <Spinner animation="border" />
                    </div>
                )}

                {/* Lista */}
                {!loading && properties.length === 0 && (
                    <div className="text-center text-muted py-5">
                        <p>No hay propiedades en la papelera.</p>
                    </div>
                )}

                {!loading && properties.length > 0 && (
                    <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                        {properties.map((property) => (
                            <Col key={property.id}>
                                <TrashPropertyCard
                                    property={property}
                                    onRestore={openRestoreDialog}
                                    onDelete={openDeleteDialog}
                                />
                            </Col>
                        ))}
                    </Row>
                )}

            </Container>
        </>
    );
}