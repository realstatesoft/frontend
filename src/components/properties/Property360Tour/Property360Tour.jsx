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
      if (!config || !config.nodes) setError("No se encontró configuración válida para el tour.");
      return;
    }

    try {
      setLoading(true);
      
      // Inicializar el visor
      const viewer = new Viewer({
        container: containerRef.current,
        panorama: config.nodes[0].panorama, // Temporal, el plugin manejará los nodos
        loadingTxt: 'Cargando escena...',
        caption: 'Recorrido Virtual 360°',
        defaultYaw: '0',
        defaultPitch: '0',
        navbar: [
          'autorotate',
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
            startNodeId: startNodeId || config.nodes[0].id,
          }],
        ],
      });

      viewerRef.current = viewer;

      viewer.addEventListener('ready', () => {
        setLoading(false);
      }, { once: true });

      // Limpieza al desmontar
      return () => {
        if (viewerRef.current) {
          viewerRef.current.destroy();
        }
      };
    } catch (err) {
      console.error("Error al iniciar el tour 360:", err);
      setError("Error al inicializar el visor 360.");
      setLoading(false);
    }
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
    <div className="property-360-container">
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
