import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';

/**
 * Control de dibujo de área para el mapa de propiedades.
 * Debe renderizarse dentro de un <MapContainer>.
 *
 * @param {object}   props
 * @param {function} props.onAreaDrawn   - Callback({ type, polygon? | circleLat?, circleLng?, circleRadiusMeters? })
 * @param {function} props.onAreaCleared - Callback() cuando se elimina el área
 * @param {any}      props.clearSignal   - Cuando es null/falsy, limpia los layers dibujados
 */
export default function DrawAreaControl({ onAreaDrawn, onAreaCleared, clearSignal }) {
  const map = useMap();

  // Usar refs para evitar re-registrar handlers al recibir nuevas instancias de callback
  const onAreaDrawnRef = useRef(onAreaDrawn);
  const onAreaClearedRef = useRef(onAreaCleared);
  const drawnItemsRef = useRef(null);
  useEffect(() => { onAreaDrawnRef.current = onAreaDrawn; }, [onAreaDrawn]);
  useEffect(() => { onAreaClearedRef.current = onAreaCleared; }, [onAreaCleared]);

  // Limpiar layers visualmente cuando el padre resetea drawnArea a null
  useEffect(() => {
    if (!clearSignal && drawnItemsRef.current) {
      drawnItemsRef.current.clearLayers();
    }
  }, [clearSignal]);

  useEffect(() => {
    const drawnItems = new L.FeatureGroup();
    drawnItemsRef.current = drawnItems;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: {
        featureGroup: drawnItems,
        remove: true,
        edit: false,
      },
      draw: {
        polygon: { shapeOptions: { color: '#3b82f6', fillOpacity: 0.15 } },
        circle:  { shapeOptions: { color: '#3b82f6', fillOpacity: 0.15 } },
        polyline:     false,
        rectangle:    false,
        marker:       false,
        circlemarker: false,
      },
    });

    map.addControl(drawControl);

    const handleCreated = (e) => {
      // Solo un área activa a la vez
      drawnItems.clearLayers();
      drawnItems.addLayer(e.layer);

      if (e.layerType === 'polygon') {
        const polygon = e.layer.getLatLngs()[0].map((ll) => [ll.lat, ll.lng]);
        onAreaDrawnRef.current({ type: 'polygon', polygon });
      } else if (e.layerType === 'circle') {
        const { lat, lng } = e.layer.getLatLng();
        onAreaDrawnRef.current({
          type: 'circle',
          circleLat: lat,
          circleLng: lng,
          circleRadiusMeters: e.layer.getRadius(),
        });
      }
    };

    const handleDeleted = () => {
      drawnItems.clearLayers();
      onAreaClearedRef.current();
    };

    map.on(L.Draw.Event.CREATED, handleCreated);
    map.on(L.Draw.Event.DELETED, handleDeleted);

    return () => {
      map.off(L.Draw.Event.CREATED, handleCreated);
      map.off(L.Draw.Event.DELETED, handleDeleted);
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
      drawnItemsRef.current = null;
    };
  }, [map]);

  return null;
}
