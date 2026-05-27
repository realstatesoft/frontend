import { Link } from "react-router-dom";
import { Row, Col, Button } from "react-bootstrap";

// Imagen de agente de Unsplash (libre de derechos)
const AGENT_IMG =
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=800&q=80";

const AgentHeroSection = () => {
    return (
        <section style={{ minHeight: 380, overflow: "hidden", backgroundColor: "#f5f0ea" }}>
            <Row className="g-0 align-items-stretch" style={{ minHeight: 380 }}>
                <Col
                    md={6}
                    className="d-flex flex-column justify-content-center align-items-start px-4 px-md-5 py-5"
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
                    <p style={{ color: "#555", fontSize: "0.97rem", maxWidth: 460 }}>
                        Muestra tu experiencia a compradores activos en tu mercado. Un
                        perfil de agente gratuito en OpenRoof te ayuda a consolidar tu
                        marca y generar nuevas oportunidades.
                    </p>
                    <div className="d-flex justify-content-start w-100">
                        <Button
                            as={Link}
                            to="/signup/agent"
                            style={{
                                backgroundColor: "#111",
                                border: "none",
                                borderRadius: "999px",
                                padding: "10px 28px",
                                fontSize: "0.95rem",
                                marginTop: "8px",
                                textDecoration: "none",
                            }}
                        >
                            Regístrate ahora
                        </Button>
                    </div>
                </Col>

                
                <Col md={6} className="p-0 d-flex">
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
