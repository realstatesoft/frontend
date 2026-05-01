import React from "react";
import { Container } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import fotoHero from "../../assets/FotoHero.png";

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
                    className="text-white fw-bold mb-3"
                    style={{ fontSize: "clamp(1.8rem, 4vw, 3rem)" }}
                >
                    {t("hero.title")}
                </h1>
                <p
                    className="text-white mb-4"
                    style={{ opacity: 0.85, fontSize: "1.05rem", maxWidth: 600, margin: "0 auto" }}
                >
                    {t("hero.subtitle")}
                </p>
            </Container>
        </section>
    );
};

export default HeroSection;
