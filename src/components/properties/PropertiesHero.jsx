import { Container, Row, Col, Button, Form, InputGroup } from "react-bootstrap";

/**
 * PropertiesHero
 * Banner con controles de filtro.
 */
export default function PropertiesHero({
    search,
    typeFilter,
    tagFilter,
    totalResults,
    onSearch,
    onTypeChange,
    onTagChange,
    onClear,
}) {
    return (
        <div style={{ backgroundColor: "var(--light, #f8fafc)" }}>
            <Container>
                <div style={{ backgroundColor: "var(--secondary, #64748b)", padding: "20px", borderRadius: "20px" }}>
                    <Row className="g-2">
                        {/* Búsqueda libre */}
                        <Col md={5}>
                            <InputGroup>
                                <InputGroup.Text className="bg-white border-0"></InputGroup.Text>
                                <Form.Control
                                    placeholder="Buscar por ubicación o tipo..."
                                    value={search}
                                    onChange={(e) => onSearch(e.target.value)}
                                    className="border-0"
                                    style={{ boxShadow: "none", }}
                                />
                            </InputGroup>
                        </Col>

                        {/* Tipo de propiedad */}
                        <Col md={3}>
                            <Form.Select
                                value={typeFilter}
                                onChange={(e) => onTypeChange(e.target.value)}
                                className="border-0"
                            >
                                <option>Todos</option>
                                <option>Casa</option>
                                <option>Departamento</option>
                                <option>Terreno</option>
                                <option>Local</option>
                                <option>Depósito</option>
                                <option>Campo</option>
                            </Form.Select>
                        </Col>

                        {/* Estado */}
                        <Col md={3}>
                            <Form.Select
                                value={tagFilter}
                                onChange={(e) => onTagChange(e.target.value)}
                                className="border-0"
                            >
                                <option>Todos</option>
                                <option>Pendiente</option>
                                <option>Aprobado</option>
                                <option>Rechazado</option>
                                <option>Publicado</option>
                                <option>Vendido</option>
                                <option>Alquilado</option>
                                <option>Archivado</option>
                            </Form.Select>
                        </Col>

                        {/* Limpiar filtros */}
                        <Col md={1} className="d-flex align-items-center">
                            <Button
                                variant="outline-light"
                                onClick={onClear}
                                className="w-100"
                                title="Limpiar filtros"
                                style={{ backgroundColor: "var(--light, #f8fafc)", color: "var(--dark, #1e293b)" }}
                            >
                                ✕
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Contador de resultados */}
                <p className="text-white-50 mt-3 mb-0" style={{ fontSize: "0.9rem" }}>
                    {totalResults} propiedad{totalResults !== 1 ? "es" : ""} encontrada
                    {totalResults !== 1 ? "s" : ""}
                </p>
            </Container>
        </div>
    );
}
