import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const stats = [
    { icon: "🏠", number: "+5.000", label: "Propiedades activas" },
    { icon: "😊", number: "+3.000", label: "Clientes Satisfechos" },
    { icon: "🤝", number: "+200", label: "Asociados" },
    { icon: "🌎", number: "+50", label: "Ciudades" },
];

const StatsSection = () => {
    return (
        <section style={{ padding: "70px 0", backgroundColor: "var(--bg-light, #f8f9fb)" }}>
            <Container>
                <Row className="text-center g-4">
                    {stats.map((stat, i) => (
                        <Col md={3} xs={6} key={i}>
                            <div
                                className="d-flex flex-column align-items-center"
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                                    style={{
                                        width: 70,
                                        height: 70,
                                        backgroundColor: "#e8f0fe",
                                        fontSize: "1.8rem",
                                    }}
                                >
                                    {stat.icon}
                                </div>
                                <h3 className="fw-bold mb-1" style={{ color: "var(--primary, #1a56db)" }}>
                                    {stat.number}
                                </h3>
                                <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                                    {stat.label}
                                </p>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default StatsSection;
