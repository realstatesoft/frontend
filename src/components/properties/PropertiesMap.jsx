import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo } from "react";
import { Alert } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { Link } from "react-router-dom";
import PLACEHOLDER_IMAGE from "../../assets/placeholder_img.png";
import usePropertyPriceDisplay from "../../hooks/usePropertyPriceDisplay";

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

function formatStat(value, t, key) {
  if (value == null || value === "—") return "—";
  return t(`map.stats.${key}`, { count: value });
}

export default function PropertiesMap({ properties = [], isSplit = false }) {
  const { t } = useTranslation("properties");
  const { formatPrice } = usePropertyPriceDisplay(0);

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
            title: property.title || t("map.propertyFallback"),
            address: property.address || property.locationName || t("map.locationUnavailable"),
            type: property.propertyType
              ? t(`types.${property.propertyType.toLowerCase()}`, {
                  defaultValue: property.propertyType,
                })
              : t("map.propertyFallback"),
            price: formatPrice(property.price).label || t("map.priceUnavailable"),
            image: property.primaryImageUrl || property.image || PLACEHOLDER_IMAGE,
            bedrooms: property.bedrooms ?? "—",
            bathrooms: property.bathrooms ?? "—",
            area: property.surfaceArea ?? property.area ?? "—",
            position: [lat, lng],
          };
        })
        .filter(Boolean),
    [properties, t, formatPrice]
  );

  return (
    <section className={`properties-map-section ${isSplit ? "is-split h-100 m-0 p-0 mw-100" : ""}`}>
      {!isSplit && (
        <div className="properties-map-section__header">
          <div>
            <p className="properties-map-section__eyebrow mb-1">{t("map.eyebrow")}</p>
            <h2 className="properties-map-section__title mb-1">{t("map.title")}</h2>
            <p className="properties-map-section__subtitle mb-0">
              {t("map.subtitle")}
            </p>
          </div>
          <span className="properties-map-section__count">
            {t("map.points", { count: points.length })}
          </span>
        </div>
      )}

      <div className={`properties-map-section__canvas ${isSplit ? "h-100 rounded-0 border-0" : ""}`}>
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className={`properties-map-section__leaflet ${isSplit ? "h-100" : ""}`}
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
                    <span>🛏 {formatStat(point.bedrooms, t, "bedrooms")}</span>
                    <span>🚿 {formatStat(point.bathrooms, t, "bathrooms")}</span>
                    <span>📐 {formatStat(point.area, t, "area")}</span>
                  </div>
                  <Link to={`/properties/${point.id}`} className="properties-map-popup__link">
                    {t("map.details")}
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </section>
  );
}
