import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const steps = [
    {
        number: "1",
        color: "#3b82f6",
        title: "Regístrate",
        description:
            "Crea tu perfil Premier Agent y verifica tu licencia inmobiliaria",
    },
    {
        number: "2",
        color: "#22c55e",
        title: "Configura tu perfil",
        description:
            "Personaliza tu perfil, áreas de servicio y especialidades",
    },
    {
        number: "3",
        color: "#a855f7",
        title: "Recibe leads",
        description:
            "Comienza a recibir leads de calidad y haz crecer tu negocio",
    },
];

const AgentStepsSection = () => {
    return (
        <section style={{ padding: "64px 0", backgroundColor: "#fff" }}>
            <Container>
                <Row className="text-center justify-content-center g-5">
                    {steps.map((step, i) => (
                        <Col key={i} md={4} xs={12}>
                            <div
                                className="d-flex align-items-center justify-content-center rounded-circle mx-auto mb-4"
                                style={{
                                    width: 60,
                                    height: 60,
                                    backgroundColor: step.color,
                                    color: "#fff",
                                    fontSize: "1.4rem",
                                    fontWeight: 700,
                                }}
                            >
                                {step.number}
                            </div>
                            <h5 className="fw-bold mb-2" style={{ fontSize: "1rem" }}>
                                {step.title}
                            </h5>
                            <p
                                className="text-muted"
                                style={{ fontSize: "0.88rem", maxWidth: 220, margin: "0 auto" }}
                            >
                                {step.description}
                            </p>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default AgentStepsSection;
