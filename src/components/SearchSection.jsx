import React, { useState } from "react";

const SearchSection = () => {
  const [activeTab, setActiveTab] = useState("comprar");

  return (
    <>
      {/* Header blanco */}
      <div
        className="text-center py-4"
        style={{ backgroundColor: "#fff" }}
      >
        <h3 className="fw-bold mb-0" style={{ color: "var(--text-dark, #1f2937)" }}>
          Empieza a buscar tu propiedad ideal
        </h3>
      </div>

      <section
        style={{
          position: "relative",
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&q=80')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          padding: "60px 0 80px",
        }}
      >

        {/* Overlay */}
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
          {/* Tabs */}
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
                🏠 Comprar
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
                🏢 Alquilar
              </button>
            </div>
          </div>

          {/* Filter bar */}
          <div
            className="bg-white rounded-4 shadow-lg p-4 mx-auto"
            style={{ maxWidth: 900 }}
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
                  style={{
                    backgroundColor: "var(--primary, #1a56db)",
                    border: "none",
                    fontSize: "0.9rem",
                  }}
                >
                  🔍 Buscar
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