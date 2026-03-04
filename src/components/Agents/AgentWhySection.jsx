import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const whyStats = [
    {
        value: "60%",
        description: (
            <>
                Más transacciones en promedio <strong>son cerradas</strong> por agentes
                que usan OpenRoof que por agentes que no lo usan
            </>
        ),
    },
    {
        value: "81%",
        description: (
            <>
                De los compradores de vivienda{" "}
                <strong>utilizaron OpenRoof</strong>, como parte de su proceso de compra
                de vivienda.
            </>
        ),
    },
    {
        value: "1 in 3",
        description: (
            <>
                De todos los compradores de viviendas en Paraguay, buscaron un socio
                agente Premier de OpenRoof en 2023.
            </>
        ),
    },
];

const AgentWhySection = () => {
    return (
        <section style={{ padding: "0" }}>
            <Row className="g-0">
                {/* Left label */}
                <Col
                    md={3}
                    className="d-flex align-items-center justify-content-center p-4"
                    style={{ backgroundColor: "#1a1a1a" }}
                >
                    <h3
                        className="text-white fw-bold text-center mb-0"
                        style={{ fontSize: "1.3rem", lineHeight: 1.3 }}
                    >
                        Por qué trabajamos con agentes
                    </h3>
                </Col>

                {/* Stats */}
                {whyStats.map((stat, i) => (
                    <Col
                        key={i}
                        md={3}
                        className="d-flex flex-column justify-content-center p-4"
                        style={{
                            backgroundColor: i === 2 ? "#f5f0ea" : "#fff",
                            borderLeft: "1px solid #e5e5e5",
                        }}
                    >
                        <h2
                            className="fw-bold mb-2"
                            style={{ fontSize: "clamp(1.8rem, 3vw, 2.5rem)", color: "#111" }}
                        >
                            {stat.value}
                        </h2>
                        <p style={{ fontSize: "0.85rem", color: "#444", marginBottom: 0 }}>
                            {stat.description}
                        </p>
                    </Col>
                ))}
            </Row>
        </section>
    );
};

export default AgentWhySection;
