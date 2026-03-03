import React from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

// Imagen de agente de Unsplash (libre de derechos)
const AGENT_IMG =
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80";

const AgentHeroSection = () => {
    return (
        <section style={{ minHeight: 380, overflow: "hidden" }}>
            <Row className="g-0" style={{ minHeight: 380 }}>
                <Col
                    md={6}
                    className="d-flex flex-column justify-content-center px-5 py-5"
                    style={{ backgroundColor: "#f5f0ea" }}
                >
                    <h1
                        className="fw-bold mb-3"
                        style={{
                            fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                            lineHeight: 1.15,
                            color: "#111",
                        }}
                    >
                        Crea tu perfil de agente inmobiliario
                    </h1>
                    <p style={{ color: "#555", fontSize: "0.97rem", maxWidth: 420 }}>
                        Muestre su experiencia a compradores de vivienda activos en su
                        mercado. Un perfil de agente gratuito en OpenRoof le ayuda a
                        consolidar su marca y Trulia.
                    </p>
                    <div>
                        <Button
                            style={{
                                backgroundColor: "#111",
                                border: "none",
                                borderRadius: "999px",
                                padding: "10px 28px",
                                fontSize: "0.95rem",
                                marginTop: "8px",
                            }}
                        >
                            Regístrate Ahora!
                        </Button>
                    </div>
                </Col>

                
                <Col md={6} className="p-0">
                    <img
                        src={AGENT_IMG}
                        alt="Agente inmobiliario"
                        style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            minHeight: 320,
                            display: "block",
                        }}
                    />
                </Col>
            </Row>
        </section>
    );
};

export default AgentHeroSection;
