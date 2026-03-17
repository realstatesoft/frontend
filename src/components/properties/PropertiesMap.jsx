import { useEffect, useMemo } from "react";
import { Alert } from "react-bootstrap";
import { Link } from "react-router-dom";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { PROPERTY_TYPE_LABELS } from "../../constants/propertyEnums";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";

const DEFAULT_CENTER = [-27.3369, -55.8668];
const DEFAULT_ZOOM = 12;

const fixLeafletMarkerIcon = () => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  });
};

function MapBoundsController({ points }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    if (points.length === 0) {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      return;
    }

    if (points.length === 1) {
      map.setView(points[0].position, 15);
      return;
    }

    const bounds = L.latLngBounds(points.map((point) => point.position));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [map, points]);

  return null;
}

function formatPrice(price) {
  const numericPrice = Number(price);
  return Number.isFinite(numericPrice) ? `Gs ${numericPrice.toLocaleString()}` : "Precio no disponible";
}

export default function PropertiesMap({ properties = [] }) {
  useEffect(() => {
    fixLeafletMarkerIcon();
  }, []);

  const points = useMemo(
    () =>
      properties
        .filter((property) => property?.lat != null && property?.lng != null)
        .map((property) => {
          const lat = Number(property.lat);
          const lng = Number(property.lng);

          if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

          return {
            id: property.id,
            title: property.title || "Propiedad",
            address: property.address || property.locationName || "Ubicación no disponible",
            type: PROPERTY_TYPE_LABELS[property.propertyType] ?? property.propertyType ?? "Propiedad",
            price: formatPrice(property.price),
            image: property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE,
            bedrooms: property.bedrooms ?? "—",
            bathrooms: property.bathrooms ?? "—",
            area: property.surfaceArea ?? property.area ?? "—",
            position: [lat, lng],
          };
        })
        .filter(Boolean),
    [properties]
  );

  return (
    <section className="properties-map-section">
      <div className="properties-map-section__header">
        <div>
          <p className="properties-map-section__eyebrow mb-1">Mapa de resultados</p>
          <h2 className="properties-map-section__title mb-1">Ubicación de las propiedades</h2>
          <p className="properties-map-section__subtitle mb-0">
            Explorá en el mapa las propiedades visibles con los filtros actuales.
          </p>
        </div>
        <span className="properties-map-section__count">
          {points.length} punto{points.length !== 1 ? "s" : ""}
        </span>
      </div>

      {points.length === 0 ? (
        <Alert variant="light" className="properties-map-section__empty mb-0">
          No hay propiedades con coordenadas disponibles para mostrar en el mapa con los filtros actuales.
        </Alert>
      ) : (
        <div className="properties-map-section__canvas">
          <MapContainer
            center={points[0]?.position ?? DEFAULT_CENTER}
            zoom={DEFAULT_ZOOM}
            scrollWheelZoom={true}
            className="properties-map-section__leaflet"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapBoundsController points={points} />
            {points.map((point) => (
              <Marker key={point.id} position={point.position}>
                <Popup>
                  <div className="properties-map-popup">
                    <img
                      src={point.image}
                      alt={point.title}
                      className="properties-map-popup__image"
                      loading="lazy"
                    />
                    <p className="properties-map-popup__price mb-1">{point.price}</p>
                    <p className="properties-map-popup__type mb-1">{point.type}</p>
                    <p className="properties-map-popup__address mb-2">{point.address}</p>
                    <div className="properties-map-popup__stats">
                      <span>🛏 {point.bedrooms} hab.</span>
                      <span>🚿 {point.bathrooms} baños</span>
                      <span>📐 {point.area} m²</span>
                    </div>
                    <Link to={`/properties/${point.id}`} className="properties-map-popup__link">
                      Ver detalles
                    </Link>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </section>
  );
}
