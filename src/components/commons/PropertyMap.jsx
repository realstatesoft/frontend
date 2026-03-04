import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Centro por defecto: Encarnación, Paraguay
const DEFAULT_CENTER = [-27.3369, -55.8668];
const DEFAULT_ZOOM = 13;

// Corrige el icono por defecto del marker en entornos con bundler (Vite/Webpack)
const fixLeafletMarkerIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

/**
 * Manejador de clics dentro del mapa (solo se monta en modo edición).
 * Actualiza la posición del marker y notifica con las coordenadas.
 */
function MapClickHandler({ onChange }) {
  useMapEvents({
    click(e) {
      onChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

/** Ajusta la vista del mapa cuando cambia la posición (ej. tras elegir ubicación). */
function MapViewUpdater({ value }) {
  const map = useMap();
  useEffect(() => {
    if (!map || value?.lat == null || value?.lng == null) return;
    const lat = Number(value.lat);
    const lng = Number(value.lng);
    if (isNaN(lat) || isNaN(lng)) return;
    map.setView([lat, lng], map.getZoom());
  }, [map, value?.lat, value?.lng]);
  return null;
}

export default function PropertyMap({
  value = null,
  onChange,
  readOnly = false,
  height = 280,
  className = "",
  defaultCenter = DEFAULT_CENTER,
  defaultZoom = DEFAULT_ZOOM,
  showCoordinates = true,
}) {
  useEffect(() => {
    fixLeafletMarkerIcon();
  }, []);

  const center = useMemo(() => {
    if (value?.lat != null && value?.lng != null) {
      const lat = Number(value.lat);
      const lng = Number(value.lng);
      if (!isNaN(lat) && !isNaN(lng)) return [lat, lng];
    }
    return defaultCenter;
  }, [value?.lat, value?.lng, defaultCenter]);

  const hasPosition = value?.lat != null && value?.lng != null && !isNaN(Number(value.lat)) && !isNaN(Number(value.lng));
  const markerPosition = hasPosition ? [Number(value.lat), Number(value.lng)] : null;

  const containerHeight = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`property-map ${className}`.trim()}
      style={{ height: containerHeight, width: "100%", minHeight: "200px" }}
    >
      <MapContainer
        center={center}
        zoom={defaultZoom}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
        className="property-map__container"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && typeof onChange === "function" && <MapClickHandler onChange={onChange} />}
        {markerPosition && <Marker position={markerPosition} />}
        {hasPosition && <MapViewUpdater value={value} />}
      </MapContainer>
    </div>
  );
}
