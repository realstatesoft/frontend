import React, { useState } from "react";
import fotoSearch from "../../assets/fotoSearch.png";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const SearchSection = () => {
  const [activeTab, setActiveTab] = useState("comprar");
  const [hover, setHover] = useState(false);
  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.3 });
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal({ threshold: 0.2 });

  return (
    <>
      <div
        ref={headerRef}
        className="text-center py-4"
        style={{
          backgroundColor: "#fff",
          transition: "opacity 0.7s ease, transform 0.7s ease",
          opacity: headerVisible ? 1 : 0,
          transform: headerVisible ? "translateY(0)" : "translateY(-20px)",
        }}
      >
        <h3 className="fw-bold mb-0" style={{ color: "var(--text-dark, #1f2937)" }}>
          Empieza a buscar tu propiedad ideal
        </h3>
      </div>

      <section
        style={{
          position: "relative",
          backgroundImage: `url(${fotoSearch})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 0 80px",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
          }}
        />

        <div
          className="container position-relative"
          style={{ zIndex: 2 }}
        >
          <div className="d-flex justify-content-center mb-3">
            <div
              className="d-inline-flex rounded-pill overflow-hidden shadow"
              style={{ border: "2px solid white" }}
            >
              <button
                onClick={() => setActiveTab("comprar")}
                className="border-0 px-4 py-2 fw-semibold"
                style={{
                  backgroundColor:
                    activeTab === "comprar" ? "var(--primary, #1a56db)" : "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Comprar
              </button>
              <button
                onClick={() => setActiveTab("alquilar")}
                className="border-0 px-4 py-2 fw-semibold"
                style={{
                  backgroundColor:
                    activeTab === "alquilar" ? "var(--primary, #1a56db)" : "rgba(255,255,255,0.15)",
                  color: "white",
                  fontSize: "0.9rem",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Alquilar
              </button>
            </div>
          </div>

          <div
            ref={cardRef}
            className="bg-white rounded-4 shadow-lg p-4 mx-auto"
            style={{
              maxWidth: 900,
              transition: "opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s",
              opacity: cardVisible ? 1 : 0,
              transform: cardVisible ? "translateY(0)" : "translateY(30px)",
            }}
          >
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  UBICACIÓN
                </label>
                <input
                  className="form-control border-0 bg-light rounded-3 py-2"
                  placeholder="Ciudad, Barrio / MLS ID"
                  style={{ fontSize: "0.9rem" }}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  TIPO
                </label>
                <select className="form-select border-0 bg-light rounded-3 py-2" style={{ fontSize: "0.9rem" }}>
                  <option>Tipo de Propiedad</option>
                  <option>Casa</option>
                  <option>Departamento</option>
                  <option>Terreno</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  DORMITORIOS
                </label>
                <select className="form-select border-0 bg-light rounded-3 py-2" style={{ fontSize: "0.9rem" }}>
                  <option>Todos</option>
                  <option>1</option>
                  <option>2</option>
                  <option>3</option>
                  <option>4+</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  PRECIO
                </label>
                <select className="form-select border-0 bg-light rounded-3 py-2" style={{ fontSize: "0.9rem" }}>
                  <option>Rango de Precios</option>
                  <option>$50k - $100k</option>
                  <option>$100k - $200k</option>
                  <option>$200k+</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn w-100 text-white rounded-3 py-2 fw-semibold"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  style={{
                    backgroundColor: hover ? "#484747ff" : "var(--primary, #696868ff)",
                    border: "none",
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  Buscar
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default SearchSection;