import React, { useEffect, useRef, useState } from "react";
import { Container, Row, Col } from "react-bootstrap";
import HomePng from "../../assets/Home.png";
import person from "../../assets/person.png";
import Asociados from "../../assets/Asociados.png";
import ciudadIMG from "../../assets/image 28.png";

const stats = [
    { icon: <img src={HomePng} alt="Home" style={{ width: 50, height: 50, objectFit: "contain" }} />, target: 5000, prefix: "+", suffix: "", label: "Propiedades activas" },
    { icon: <img src={person} alt="person" style={{ width: 50, height: 50, objectFit: "contain" }} />, target: 3000, prefix: "+", suffix: "", label: "Clientes Satisfechos" },
    { icon: <img src={Asociados} alt="Asociados" style={{ width: 65, height: 65, objectFit: "contain" }} />, target: 200, prefix: "+", suffix: "", label: "Asociados" },
    { icon: <img src={ciudadIMG} alt="CIU" style={{ width: 60, height: 60, objectFit: "contain" }} />, target: 50, prefix: "+", suffix: "", label: "Ciudades" },
];


function useCountUp(target, duration = 1800, active = false) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!active) return;
        let start = 0;
        const step = Math.ceil(target / (duration / 16)); 
        const timer = setInterval(() => {
            start += step;
            if (start >= target) {
                setCount(target);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 16);
        return () => clearInterval(timer);
    }, [active, target, duration]);

    return count;
}

function StatCard({ stat, active, delay }) {
    const count = useCountUp(stat.target, 1800, active);

    const formatted = count.toLocaleString("es-PY");

    return (
        <div
            className="d-flex flex-column align-items-center"
            style={{
                opacity: active ? 1 : 0,
                transform: active ? "translateY(0)" : "translateY(30px)",
                transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms`,
            }}
        >
            <div
                className="d-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{
                    width: 70,
                    height: 70,
                    backgroundColor: "#d7e5f3ff",
                    fontSize: "1.8rem",
                }}
            >
                {stat.icon}
            </div>
            <h3 className="fw-bold mb-1" style={{ color: "var(--primary, #151f35ff)" }}>
                {stat.prefix}{formatted}{stat.suffix}
            </h3>
            <p className="text-muted mb-0" style={{ fontSize: "0.9rem" }}>
                {stat.label}
            </p>
        </div>
    );
}

const StatsSection = () => {
    const sectionRef = useRef(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect(); // dispara solo una vez
                }
            },
            { threshold: 0.25 } // 25% de la sección visible para disparar
        );
        if (sectionRef.current) observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <section ref={sectionRef} style={{ padding: "70px 0", backgroundColor: "var(--bg-light, #f8f9fb)" }}>
            <Container>
                <Row className="text-center g-4">
                    {stats.map((stat, i) => (
                        <Col md={3} xs={6} key={i}>
                            <StatCard stat={stat} active={visible} delay={i * 150} />
                        </Col>
                    ))}
                </Row>
            </Container>
        </section>
    );
};

export default StatsSection;
