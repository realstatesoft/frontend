import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import fotoSearch from "../../assets/fotoSearch.webp";
import { useScrollReveal } from "../../hooks/useScrollReveal";

const SearchSection = () => {
  const { t } = useTranslation("landing");
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("comprar");
  const [hover, setHover] = useState(false);
  
  const [locationStr, setLocationStr] = useState("");
  const [type, setType] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [priceRange, setPriceRange] = useState("");

  const { ref: headerRef, isVisible: headerVisible } = useScrollReveal({ threshold: 0.3 });
  const { ref: cardRef, isVisible: cardVisible } = useScrollReveal({ threshold: 0.2 });

  const handleSearch = () => {
    let minPrice = "";
    let maxPrice = "";
    if (priceRange) {
      const parts = priceRange.split("-");
      minPrice = parts[0];
      if (parts[1]) maxPrice = parts[1];
    }

    let availability = "";
    if (activeTab === "comprar") availability = "Venta";
    else if (activeTab === "alquilar") availability = "Alquiler";

    let minBedrooms = bedrooms === "4+" ? "4" : bedrooms;

    navigate("/properties", {
      state: {
        search: locationStr,
        typeFilter: type || null,
        minBedrooms,
        minPrice,
        maxPrice,
        availability
      }
    });
  };

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
          {t("search.title")}
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
                {t("search.buy")}
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
                {t("search.rent")}
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
                  {t("search.location")}
                </label>
                <input
                  className="form-control border-0 bg-light rounded-3 py-2"
                  placeholder={t("search.locationPlaceholder")}
                  style={{ fontSize: "0.9rem" }}
                  value={locationStr}
                  onChange={(e) => setLocationStr(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  {t("search.propertyType")}
                </label>
                <select 
                  className="form-select border-0 bg-light rounded-3 py-2" 
                  style={{ fontSize: "0.9rem" }}
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                >
                  <option value="">Tipo de Propiedad</option>
                  <option value="Casa">Casa</option>
                  <option value="Departamento">Departamento</option>
                  <option value="Terreno">Terreno</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  {t("search.bedrooms")}
                </label>
                <select 
                  className="form-select border-0 bg-light rounded-3 py-2" 
                  style={{ fontSize: "0.9rem" }}
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                >
                  <option value="">Todos</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4+">4+</option>
                </select>
              </div>
              <div className="col-md-2">
                <label className="form-label text-muted" style={{ fontSize: "0.8rem" }}>
                  {t("search.price")}
                </label>
                <select 
                  className="form-select border-0 bg-light rounded-3 py-2" 
                  style={{ fontSize: "0.9rem" }}
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                >
                  <option value="">Rango de Precios</option>
                  <option value="50000-100000">$50k - $100k</option>
                  <option value="100000-200000">$100k - $200k</option>
                  <option value="200000-">$200k+</option>
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn w-100 text-white rounded-3 py-2 fw-semibold"
                  onMouseEnter={() => setHover(true)}
                  onMouseLeave={() => setHover(false)}
                  onClick={handleSearch}
                  style={{
                    backgroundColor: hover ? "#484747ff" : "var(--primary, #696868ff)",
                    border: "none",
                    fontSize: "0.9rem",
                    transition: "background-color 0.2s ease",
                    cursor: "pointer",
                  }}
                >
                  {t("search.button")}
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
