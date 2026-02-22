import React from "react";
import { Container } from "react-bootstrap";
import { Search } from "react-bootstrap-icons";

const HeroSection = () => {
    return (
        <section
            style={{
                position: "relative",
                minHeight: "480px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage:
                    "url('https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1600&q=80')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                overflow: "hidden",
            }}
        >
            {/* Dark overlay */}
            <div
                style={{
                    position: "absolute",
                    inset: 0,
                    background:
                        "linear-gradient(to bottom, rgba(0,0,0,0.55), rgba(0,0,0,0.65))",
                }}
            />

            <Container
                className="text-center position-relative"
                style={{ zIndex: 2 }}
            >
                <h1
                    className="text-white fw-bold mb-3"
                    style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
                >
                    La Forma Más Inteligente de
                    <br />
                    <span style={{ color: "#60a5fa" }}>Comprar</span>,{" "}
                    <span style={{ color: "#34d399" }}>Vender</span> o{" "}
                    <span style={{ color: "#fbbf24" }}>Alquilar</span>
                </h1>
                <p
                    className="text-white mb-4"
                    style={{ opacity: 0.85, fontSize: "1.05rem", maxWidth: 600, margin: "0 auto" }}
                >
                    Miles de propiedades te esperan. Encuentra tu hogar ideal con la
                    tecnología más avanzada del mercado.
                </p>

                {/* Search bar */}
                <div
                    className="mx-auto d-flex align-items-center bg-white rounded-pill shadow-lg px-4 py-2"
                    style={{ maxWidth: 520 }}
                >
                    <Search size={18} className="text-muted me-2" />
                    <input
                        type="text"
                        placeholder="Empieza tu búsqueda ahora..."
                        className="border-0 flex-grow-1"
                        style={{
                            outline: "none",
                            fontSize: "0.95rem",
                            background: "transparent",
                        }}
                    />
                    <button
                        className="btn btn-primary rounded-pill px-4 py-2"
                        style={{ backgroundColor: "var(--primary)", border: "none", fontSize: "0.9rem" }}
                    >
                        Buscar
                    </button>
                </div>
            </Container>
        </section>
    );
};

export default HeroSection;
