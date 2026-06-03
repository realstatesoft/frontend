import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import fotoHero from "../../assets/FotoHero.webp";

const HeroSection = () => {
    const { t } = useTranslation("landing");
    return (
        <section
            style={{
                position: "relative",
                minHeight: "480px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundImage: `url(${fotoHero})`,
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
                    className="text-white fw-bold mb-4"
                    style={{ 
                        fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
                        letterSpacing: "-0.03em",
                        lineHeight: 1.1,
                        animation: "fadeInUp 0.8s var(--ease-out) forwards"
                    }}
                >
                    {t("hero.title")}
                </h1>
                <p
                    className="text-white mb-5"
                    style={{ 
                        opacity: 0, 
                        fontSize: "1.25rem", 
                        maxWidth: 700, 
                        margin: "0 auto",
                        lineHeight: 1.6,
                        animation: "fadeInUp 0.8s var(--ease-out) 0.2s forwards"
                    }}
                >
                    {t("hero.subtitle")}
                </p>
            </Container>
        </section>
    );
};

export default HeroSection;
