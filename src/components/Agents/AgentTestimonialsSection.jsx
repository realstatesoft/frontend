import React, { useEffect, useRef, useState } from "react";
import { Container } from "react-bootstrap";

const testimonials = [
    {
        initials: "MG",
        name: "María González",
        role: "Premier Agent desde 2022",
        quote:
            '"Desde que me uni a Premier Agent, mis ventas aumentaron 300%. Los leads son de alta calidad y el soporte es excepcional."',
        stat: "85 propiedades vendidas este año",
        textColor: "#1a56db",
    },
    {
        initials: "CR",
        name: "Carlos Rodríguez",
        role: "Team Leader - 12 agentes",
        quote:
            '"Las herramientas de gestión de equipos revolucionaron mi brokerage. Ahora puedo gestionar eficientemente 12 agentes."',
        stat: "200+ transacciones este año",
        textColor: "#1a56db",
    },
    {
        initials: "AM",
        name: "Ana Martínez",
        role: "Especialista en lujo",
        quote:
            '"El perfil Premier me posicionó como la agente #1 en propiedades de lujo en mi área. ROI increíble."',
        stat: "$50M+ en ventas este año",
        textColor: "#1a56db",
    },
    {
        initials: "JP",
        name: "Juan Pérez",
        role: "Agente independiente",
        quote:
            '"Gracias a OpenRoof conseguí mis primeros 10 clientes en menos de un mes. La plataforma es increíblemente fácil de usar."',
        stat: "30 cierres en 2024",
        textColor: "#1a56db",
    },
    {
        initials: "LS",
        name: "Laura Sánchez",
        role: "Broker senior - 8 años",
        quote:
            '"OpenRoof transformó mi negocio. Los leads que recibo son de altísima calidad y el soporte del equipo es excepcional."',
        stat: "120 propiedades este año",
        textColor: "#1a56db",
    },
];

function TestimonialCard({ t }) {
    return (
        <div
            style={{
                minWidth: "320px",
                maxWidth: "320px",
                padding: "28px 24px",
                borderRadius: "12px",
                border: "1px solid #f0f0f0",
                boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
                backgroundColor: "#fff",
                flexShrink: 0,
                display: "flex",
                flexDirection: "column",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                    style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        backgroundColor: "#cbd5e1",
                        color: "#1e293b",
                        fontWeight: 700,
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    {t.initials}
                </div>
                <div>
                    <p style={{ fontWeight: 700, marginBottom: 0, fontSize: "0.95rem" }}>{t.name}</p>
                    <p style={{ color: "#6b7280", marginBottom: 0, fontSize: "0.82rem" }}>{t.role}</p>
                </div>
            </div>

            {/* Cita */}
            <p style={{ fontSize: "0.88rem", color: "#333", lineHeight: 1.6, flexGrow: 1 }}>
                {t.quote}
            </p>

            {/* Stat */}
            <p style={{ fontSize: "0.85rem", color: t.textColor, fontWeight: 600, marginBottom: 0, marginTop: 12 }}>
                {t.stat}
            </p>
        </div>
    );
}

const AgentTestimonialsSection = () => {
    const trackRef = useRef(null);
    
    const items = [...testimonials, ...testimonials];

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;

        const GAP = 24; 
        const CARD_W = 320; 
        const SPEED = 0.5; 

        let animId;
        let pos = 0;
        const totalW = testimonials.length * (CARD_W + GAP);

        function step() {
            pos += SPEED;
            if (pos >= totalW) pos -= totalW;
            track.style.transform = `translateX(-${pos}px)`;
            animId = requestAnimationFrame(step);
        }

        animId = requestAnimationFrame(step);

        // Pausa en hover
        const pause = () => cancelAnimationFrame(animId);
        const resume = () => { animId = requestAnimationFrame(step); };
        track.parentElement.addEventListener("mouseenter", pause);
        track.parentElement.addEventListener("mouseleave", resume);

        return () => {
            cancelAnimationFrame(animId);
            track.parentElement?.removeEventListener("mouseenter", pause);
            track.parentElement?.removeEventListener("mouseleave", resume);
        };
    }, []);

    return (
        <section style={{ padding: "72px 0", backgroundColor: "#fff" }}>
            <Container>
                <div className="text-center mb-5">
                    <h2 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>
                        Testimonios
                    </h2>
                    <p className="text-muted" style={{ fontSize: "0.97rem" }}>
                        Historias reales de éxito de agentes como tú
                    </p>
                </div>
            </Container>

            
            <div
                style={{
                    overflow: "hidden",
                    width: "100%",
                    position: "relative",
                    cursor: "default",
                }}
            >
                
                <div
                    style={{
                        position: "absolute",
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: 80,
                        background: "linear-gradient(to right, #fff, transparent)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 80,
                        background: "linear-gradient(to left, #fff, transparent)",
                        zIndex: 2,
                        pointerEvents: "none",
                    }}
                />

                <div
                    ref={trackRef}
                    style={{
                        display: "flex",
                        gap: "24px",
                        paddingBottom: 8,
                        willChange: "transform",
                    }}
                >
                    {items.map((t, i) => (
                        <TestimonialCard key={i} t={t} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default AgentTestimonialsSection;
