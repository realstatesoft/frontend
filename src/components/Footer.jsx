import React from "react";
import { Container, Row, Col } from "react-bootstrap";

const Footer = () => {
    return (
        <footer style={{ backgroundColor: "#111827", color: "#9ca3af", padding: "60px 0 30px" }}>
            <Container>
                <Row className="g-4 mb-5">
                    <Col lg={4}>
                        <h5 className="text-white fw-bold mb-3">🏠 OpenRoof</h5>
                        <p style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
                            Tu aliado de confianza en el mercado inmobiliario de Paraguay.
                            Encontramos tu hogar ideal.
                        </p>
                    </Col>
                    <Col lg={2} xs={6}>
                        <h6 className="text-white fw-semibold mb-3">Empresa</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem" }}>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Sobre nosotros</a></li>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Servicios</a></li>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Agentes</a></li>
                        </ul>
                    </Col>
                    <Col lg={2} xs={6}>
                        <h6 className="text-white fw-semibold mb-3">Propiedades</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem" }}>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Comprar</a></li>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Alquilar</a></li>
                            <li className="mb-2"><a href="#" className="text-muted" style={{ textDecoration: "none" }}>Vender</a></li>
                        </ul>
                    </Col>
                    <Col lg={4}>
                        <h6 className="text-white fw-semibold mb-3">Contacto</h6>
                        <ul className="list-unstyled" style={{ fontSize: "0.9rem" }}>
                            <li className="mb-2">📍 Asunción, Paraguay</li>
                            <li className="mb-2">📞 +595 21 000 000</li>
                            <li className="mb-2">✉️ info@openroof.com.py</li>
                        </ul>
                    </Col>
                </Row>
                <hr style={{ borderColor: "#374151" }} />
                <p className="text-center mb-0 pt-3" style={{ fontSize: "0.85rem" }}>
                    © 2026 OpenRoof. Todos los derechos reservados.
                </p>
            </Container>
        </footer>
    );
};

export default Footer;
