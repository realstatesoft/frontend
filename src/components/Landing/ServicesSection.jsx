import { Container, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { useScrollReveal } from "../../hooks/useScrollReveal";
import { Link } from "react-router-dom";
import casita from "../../assets/Home.png";
import eye from "../../assets/Eye.png";

const ServicesSection = () => {
    const { t } = useTranslation("landing");
    const { ref, isVisible } = useScrollReveal({ threshold: 0.1 });
    const services = [
        {
            icon: <img src={casita} alt="CIU" style={{ width: 300, height: 30, objectFit: "contain" }} />,
            title: t("services.buy.title"),
            description: t("services.buy.description"),
            linkText: t("services.buy.link"),
            to: "/properties",
            state: { availability: "VENTA" },
            color: "#dbeafe",
        },
        {
            icon: <img src={eye} alt="Eye" style={{ width: 300, height: 30, objectFit: "contain" }} />,
            title: t("services.rent.title"),
            description: t("services.rent.description"),
            linkText: t("services.rent.link"),
            to: "/properties",
            state: { availability: "ALQUILER" },
            color: "#fef3c7",
        },
        {
            icon: <span style={{ fontSize: "1.5rem", color: "#000000" }}>$</span>,
            title: t("services.sell.title"),
            description: t("services.sell.description"),
            linkText: t("services.sell.link"),
            to: "/create-property",
            state: null,
            color: "#d1fae5",
        },
    ];

    return (
        <section
            id="services"
            ref={ref}
            style={{ padding: "80px 0", backgroundColor: "var(--white, #fff)" }}
        >
            <Container>
                <Row className="g-4">
                    {services.map((service, i) => (
                        <Col md={4} key={i}>
                            <Link
                                to={service.to}
                                state={service.state}
                                className="p-4 rounded-4 h-100 d-block text-decoration-none shadow-sm"
                                style={{
                                    backgroundColor: "#fff",
                                    border: "1px solid var(--border-color-soft, #f1f5f9)",
                                    transition: `all 0.4s var(--ease-out), opacity 0.8s var(--ease-out) ${i * 0.1}s, transform 0.8s var(--ease-out) ${i * 0.1}s`,
                                    cursor: "pointer",
                                    opacity: isVisible ? 1 : 0,
                                    transform: isVisible ? "translateY(0)" : "translateY(30px)",
                                    color: "var(--text-dark, #0f172a)",
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = "translateY(-8px)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                    e.currentTarget.style.boxShadow = "var(--shadow-sm)";
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
                                <span
                                    className="fw-semibold"
                                    style={{ color: "var(--primary, #1a56db)", fontSize: "0.9rem" }}
                                >
                                    {service.linkText}
                                </span>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default ServicesSection;
