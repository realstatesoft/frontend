import React, { useState } from "react";
import {
  HouseDoor,
  Building,
  Tree,
  Briefcase,
  Box,
  Flower2,
  TagFill,
  Key,
  ArrowRight,
  GeoAlt,
} from "react-bootstrap-icons";
import { Spinner } from "react-bootstrap";
import PropertyMap from "../../../components/commons/PropertyMap";
import { reverseGeocode } from "../../../utils/geocoding";

const PROPERTY_TYPES = [
  { value: "HOUSE", label: "Casa", Icon: HouseDoor },
  { value: "APARTMENT", label: "Departamento", Icon: Building },
  { value: "LAND", label: "Terreno", Icon: Tree },
  { value: "OFFICE", label: "Oficina", Icon: Briefcase },
  { value: "WAREHOUSE", label: "Depósito", Icon: Box },
  { value: "FARM", label: "Campo/Estancia", Icon: Flower2 },
];

export default function StepAddress({ form, set, nextStep }) {
  const [mapCoords, setMapCoords] = useState(form.geolocation || null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState(null);
  
  const canContinue = form.address.trim().length > 5 && mapCoords !== null;

  const handleMapChange = async (coords) => {
    setMapCoords(coords);
    set("geolocation", coords);
    set("latitude", coords.lat);
    set("longitude", coords.lng);
    
    // Reverse geocode to get address
    setLoadingAddress(true);
    setAddressError(null);
    
    try {
      const addr = await reverseGeocode(coords.lat, coords.lng);
      if (addr) {
        set("address", addr);
      }
    } catch {
      setAddressError("No se pudo obtener la dirección automáticamente. Podés editarla manualmente.");
    } finally {
      setLoadingAddress(false);
    }
  };

  return (
    <div className="sell-wizard__step">
      <h2 className="sell-wizard__title">Contanos sobre tu propiedad</h2>
      <p className="sell-wizard__subtitle">
        Primero, ingresá la dirección de la propiedad que querés vender o alquilar.
      </p>

      {/* Category Toggle */}
      <div className="sell-wizard__category-toggle">
        <button
          type="button"
          className={`sell-wizard__category-btn ${form.category === "SALE" ? "sell-wizard__category-btn--active" : ""}`}
          onClick={() => set("category", "SALE")}
        >
          <TagFill /> Vender
        </button>
        <button
          type="button"
          className={`sell-wizard__category-btn ${form.category === "RENT" ? "sell-wizard__category-btn--active" : ""}`}
          onClick={() => set("category", "RENT")}
        >
          <Key /> Alquilar
        </button>
      </div>

      {/* Property Type */}
      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">Tipo de propiedad</label>
        <div className="sell-wizard__grid">
          {PROPERTY_TYPES.map((type) => (
            <div
              key={type.value}
              className={`sell-wizard__card ${form.propertyType === type.value ? "sell-wizard__card--selected" : ""}`}
              onClick={() => set("propertyType", type.value)}
            >
              <div className="sell-wizard__card-icon">
                <type.Icon size={22} />
              </div>
              <span className="sell-wizard__card-label">{type.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Address */}
      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <GeoAlt className="me-1" /> Dirección de la propiedad
        </label>
        <input
          type="text"
          className="sell-wizard__input"
          placeholder="Hacé clic en el mapa o ingresá la dirección"
          value={form.address}
          onChange={(e) => set("address", e.target.value)}
        />
        {loadingAddress && (
          <div className="sell-wizard__address-loading">
            <Spinner animation="border" size="sm" /> Buscando dirección...
          </div>
        )}
        {addressError && (
          <div className="sell-wizard__address-error">
            {addressError}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="sell-wizard__form-group">
        <label className="sell-wizard__label">
          <GeoAlt className="me-1" /> Ubicación en el mapa
        </label>
        <p className="sell-wizard__hint">
          Hacé clic en el mapa para marcar la ubicación exacta de tu propiedad.
        </p>
        <div className="sell-wizard__map-container">
          <PropertyMap
            value={mapCoords}
            onChange={handleMapChange}
            readOnly={false}
            height={280}
            showCoordinates={true}
          />
        </div>
        {mapCoords && (
          <div className="sell-wizard__coords-display">
            Lat: {mapCoords.lat.toFixed(6)}, Lng: {mapCoords.lng.toFixed(6)}
          </div>
        )}
      </div>

      <div className="sell-wizard__actions">
        <button
          type="button"
          className="sell-wizard__btn sell-wizard__btn--next"
          onClick={nextStep}
          disabled={!canContinue}
        >
          Continuar <ArrowRight />
        </button>
      </div>
    </div>
  );
}
