import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import agente from "../../assets/ImagenCta.png";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const CtaSection = () => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.15 });

    return (
        <section ref={ref} style={{ padding: "80px 0", backgroundColor: "#f8f9fb" }}>
            <Container>
                <Row className="align-items-center g-5">
                    
                    <Col lg={6}>
                        <div
                            style={{
                                transition: "opacity 0.8s ease 0.1s, transform 0.8s ease 0.1s",
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateX(0)" : "translateX(-50px)",
                            }}
                        >
                            <h2
                                className="fw-bold mb-3"
                                style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "black" }}
                            >
                                ¿Listo para tu próximo hogar en Paraguay?
                            </h2>
                            <p className="text-muted mb-4" style={{ fontSize: "0.95rem", lineHeight: 1.8 }}>
                                Con años de experiencia en el mercado local, te ofrecemos las
                                mejores opciones para ti. Ya sea que busques comprar, vender o
                                alquilar, nuestros agentes te acompañan en cada paso del camino.
                            </p>

                            <div className="d-flex gap-3 mb-4 flex-wrap">
                                <button
                                    className="btn text-white rounded-pill px-4 py-2 fw-semibold"
                                    style={{
                                        backgroundColor: "var(--primary, #1a56db)",
                                        border: "none",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Explorar ahora
                                </button>
                                <button
                                    className="btn rounded-pill px-4 py-2 fw-semibold"
                                    style={{
                                        backgroundColor: "transparent",
                                        border: "2px solid #d1d5db",
                                        color: "var(--text-dark, #1f2937)",
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    Vende tu propiedad
                                </button>
                            </div>

                            <div className="d-flex gap-4 flex-wrap">
                                {[
                                    { number: "1000+", label: "Propiedades vendidas" },
                                    { number: "400+", label: "Propiedades alquiladas" },
                                    { number: "100+", label: "Agentes" },
                                ].map((s, i) => (
                                    <div key={i}>
                                        <h4 className="fw-bold mb-0" style={{ color: "var(--primary, #1a56db)" }}>
                                            {s.number}
                                        </h4>
                                        <small className="text-muted">{s.label}</small>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </Col>
                    <Col lg={6}>
                        <div
                            className="rounded-4 overflow-hidden shadow"
                            style={{
                                height: 380,
                                transition: "opacity 0.8s ease 0.3s, transform 0.8s ease 0.3s",
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "translateX(0)" : "translateX(50px)",
                            }}
                        >
                            <img
                                src={agente}
                                alt="Agentes inmobiliarios"
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                }}
                            />
                        </div>
                    </Col>
                </Row>
            </Container>
        </section>
    );
};

export default CtaSection;
