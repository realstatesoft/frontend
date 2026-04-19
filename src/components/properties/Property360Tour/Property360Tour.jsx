import { useEffect, useRef, useState } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import { VirtualTourPlugin } from '@photo-sphere-viewer/virtual-tour-plugin';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { Spinner } from 'react-bootstrap';
import '@photo-sphere-viewer/core/index.css';
import '@photo-sphere-viewer/virtual-tour-plugin/index.css';
import '@photo-sphere-viewer/markers-plugin/index.css';
import './Property360Tour.css';

/**
 * Property360Tour - Visor nativo de imágenes 360 con navegación entre nodos.
 * @param {Object} config - Configuración del tour (nodes, links, etc.)
 * @param {string} startNodeId - ID del nodo inicial.
 */
export default function Property360Tour({ config, startNodeId }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const viewerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !config || !config.nodes || config.nodes.length === 0) {
      setLoading(false);
      return;
    }

    let viewer = null;
    let timer = null;

    // Usar un pequeño retraso para asegurar que el contenedor DOM esté listo y con dimensiones
    timer = setTimeout(() => {
      if (!containerRef.current) return;

      try {
        setLoading(true);
        setError(null);
        
        const nodeId = startNodeId || config.startNodeId || config.nodes?.[0]?.id;

        viewer = new Viewer({
          container: containerRef.current,
          loadingTxt: 'Cargando escena...',
          caption: 'Recorrido Virtual 360°',
          defaultYaw: '0',
          defaultPitch: '0',
          navbar: [
            'zoom',
            'move',
            'download',
            'description',
            'caption',
            'fullscreen',
          ],
          plugins: [
            [MarkersPlugin, {}],
            [VirtualTourPlugin, {
              dataMode: 'client',
              positionMode: 'manual',
              renderMode: '3d',
              nodes: config.nodes,
              startNodeId: nodeId,
            }],
          ],
        });

        viewerRef.current = viewer;

        viewer.addEventListener('ready', () => {
          setLoading(false);
          console.log("360 Viewer: Ready");
        }, { once: true });

      } catch (err) {
        console.error("Error al iniciar el tour 360:", err);
        setError("Error al inicializar el visor 360.");
        setLoading(false);
      }
    }, 50);

    // Limpieza al desmontar o antes de una re-inicialización
    return () => {
      if (timer) clearTimeout(timer);
      if (viewerRef.current) {
        try {
          viewerRef.current.destroy();
        } catch (e) {
          console.warn("Error al destruir el visor:", e);
        }
        viewerRef.current = null;
      }
    };
  }, [config, startNodeId]);

  if (error) {
    return (
      <div className="property-360-error">
        <i className="bi bi-exclamation-triangle fs-1 d-block mb-3"></i>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="property-360-container property-360-tour">
      {loading && (
        <div className="property-360-loader">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <span>Iniciando recorrido...</span>
        </div>
      )}
      <div ref={containerRef} className="property-360-viewer"></div>
    </div>
  );
}
