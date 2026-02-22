import React from "react";
import { Container } from "react-bootstrap";

const AboutSection = () => {
    return (
        <section style={{ padding: "80px 0", backgroundColor: "var(--white, #fff)" }}>
            <Container>
                <div className="text-center mx-auto" style={{ maxWidth: 650 }}>
                    <div
                        className="d-inline-block rounded-pill px-3 py-1 mb-3"
                        style={{
                            backgroundColor: "#e8f0fe",
                            color: "var(--primary, #1a56db)",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                        }}
                    >
                        Sobre Nosotros
                    </div>
                    <h2 className="fw-bold mb-4" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)" }}>
                        Somos una agencia inmobiliaria boutique especializada en el mercado
                        de Paraguay.
                    </h2>
                    <p className="text-muted" style={{ fontSize: "1rem", lineHeight: 1.8 }}>
                        Con años de experiencia y un equipo apasionado, ayudamos a nuestros
                        clientes a encontrar el hogar perfecto. Nuestra misión es hacer que
                        cada transacción sea simple, transparente y exitosa.
                    </p>
                </div>
            </Container>
        </section>
    );
};

export default AboutSection;
