import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import casita from "../../assets/Home.png"
import eye from "../../assets/Eye.png"
const services = [
    {
        icon: <img src={casita} alt="CIU" style={{ width: 300, height: 30, objectFit: "contain" }} />,
        title: "Comprar una casa",
        description:
            "Encuentra la casa perfecta con nuestra herramienta de búsqueda avanzada.",
        link: "Explorar propiedades →",
        color: "#dbeafe",
    },
    {
        icon: <img src={eye} alt="Eye" style={{ width: 300, height: 30, objectFit: "contain" }} />,
        title: "Alquilar una casa",
        description:
            "Encuentra tu próximo hogar en alquiler con precios competitivos.",
        link: "Ver alquileres →",
        color: "#fef3c7",
    },
    {
        icon: <span style={{ fontSize: "1.5rem", color: "#000000" }}>$</span>,
        title: "Vender tu casa",
        description:
            "Publica tu propiedad y conecta con miles de compradores potenciales.",
        link: "Publicar propiedad →",
        color: "#d1fae5",
    },
];

const ServicesSection = () => {
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });

    return (
        <section
            ref={ref}
            style={{ padding: "80px 0", backgroundColor: "var(--white, #fff)" }}
        >
            <Container>
                <Row className="g-4">
                    {services.map((service, i) => (
                        <Col md={4} key={i}>
                            <div
                                className="p-4 rounded-4 h-100"
                                style={{
                                    backgroundColor: "#fafbfc",
                                    border: "1px solid #f0f0f0",
                                    transition: `all 0.3s ease, opacity 0.6s ease ${i * 150}ms, transform 0.6s ease ${i * 150}ms`,
                                    cursor: "pointer",
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? "translateY(0)" : "translateY(40px)",
                                    color: "black",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-6px)";
                                    e.currentTarget.style.boxShadow = "0 12px 30px rgba(0,0,0,0.08)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                }}
                            >
                                <div
                                    className="d-flex align-items-center justify-content-center rounded-3 mb-3"
                                    style={{
                                        width: 56,
                                        height: 56,
                                        backgroundColor: service.color,
                                        fontSize: "1.5rem",
                                    }}
                                >
                                    {service.icon}
                                </div>
                                <h5 className="fw-bold mb-2">{service.title}</h5>
                                <p className="text-muted mb-3" style={{ fontSize: "0.9rem" }}>
                                    {service.description}
                                </p>
                                <a
                                    href="#"
                                    className="fw-semibold"
                                    style={{ color: "var(--primary, #1a56db)", fontSize: "0.9rem" }}
                                >
                                    {service.link}
                                </a>
                            </div>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default ServicesSection;
